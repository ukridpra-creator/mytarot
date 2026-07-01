// pages/api/claude.js
//
// เปลี่ยนจากเดิม: เพิ่มการตรวจ login จริง (Firebase ID Token) + หักเหรียญแบบ
// transaction "ก่อน" เรียก Anthropic ในขั้นตอนเดียวกัน เพื่อไม่ให้มีช่องว่าง
// ระหว่าง "จ่ายเหรียญ" กับ "ใช้ AI จริง" ที่คนแอบข้ามได้
//
// ผลคือ: ไม่ต้องมี /api/use-coins แยกสำหรับ flow ดูดวงอีกต่อไป
// (จะเก็บไฟล์นั้นไว้เผื่อใช้กรณีอื่น เช่น แอดมินเติมเหรียญ ก็ได้ แต่ไม่ถูกเรียกจากหน้านี้แล้ว)

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// ราคาต่อบริการ — กำหนดที่ server เท่านั้น ห้ามรับ "amount" จาก client เด็ดขาด
// (ไม่งั้นคนแก้ JS ฝั่งหน้าเว็บส่ง amount: 1 มาแทนได้)
const SERVICE_COSTS = {
  bazi: 40,
  tarot: 20,
  tarot_followup: 5,
"han-oracle-1": 10,
"han-oracle-3": 20,
"han-oracle-5": 30,
"noh-oracle-1": 10,
"noh-oracle-3": 20,
"noh-oracle-5": 30,
"destiny": 49,
"destiny-2": 0,
"foot-reading": 30,
"deity": 20,
"love-code": 10,
"saju": 30,
"saju-read": 0,
"loshu": 20,
"pinnacle": 20,
};

// ตั้งเป็นโดเมนจริงของเว็บ (ใส่ใน .env: ALLOWED_ORIGIN=https://yourdomain.com)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// ปิด bodyParser อัตโนมัติของ Next.js เพราะโค้ดนี้อ่าน raw stream เอง
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);

  if (req.method !== 'POST') return res.status(405).end();

  // 1) ต้อง login เท่านั้น — ตรวจ Firebase ID Token จริง (ไม่เชื่อ uid ที่ client ส่งมา)
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'unauthorized' });

  let uid;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  // 2) อ่าน body
  let body;
  try {
    body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
      req.on('error', reject);
    });
  } catch (e) {
    return res.status(400).json({ error: 'invalid_body' });
  }

  // 3) ราคามาจาก server เท่านั้น โดยดูจาก "service" ที่ client บอกว่าใช้บริการไหน
  const service = body.service;
  const cost = SERVICE_COSTS[service];
  if (!cost) return res.status(400).json({ error: 'invalid_service' });

  // 4) หักเหรียญแบบ transaction ก่อนเรียก Anthropic — กันใช้ฟรี/กันกดซ้ำ-ยิงซ้อน
  const userRef = db.collection('users').doc(uid);
  let newBalance;
  try {
    newBalance = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const current = snap.exists ? (snap.data().coins || 0) : 0;
      if (current < cost) throw new Error('insufficient_coins');
      const updated = current - cost;
      tx.set(userRef, { coins: updated }, { merge: true });
      return updated;
    });
  } catch (e) {
    if (e.message === 'insufficient_coins') {
      return res.status(402).json({ error: 'insufficient_coins' });
    }
    console.error('coin deduction error:', e);
    return res.status(500).json({ error: 'server_error' });
  }

  // 5) เรียก Anthropic แล้ว stream กลับ (เหมือนเดิม) — ลบ service ออกก่อนส่ง เพราะไม่ใช่ field ของ Anthropic API
  delete body.service;
  body.stream = true;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // ส่งยอดเหรียญใหม่กลับไปทาง header ให้หน้าเว็บอัปเดต UI ได้โดยไม่ต้องยิง request เพิ่ม
  res.setHeader('X-New-Coin-Balance', String(newBalance));
  res.setHeader('Access-Control-Expose-Headers', 'X-New-Coin-Balance');

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            res.write(parsed.delta.text);
          }
        } catch (e) {}
      }
    }
  }

  res.end();
}