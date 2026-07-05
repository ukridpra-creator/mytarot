// pages/api/claude.js

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

// ราคากลาง — ใช้แทนตัวเลขตรงๆ ได้เลยค่ะ
const TIER = {
  FREE: 0,
  T10:  10,
  T19:  19,
  T20:  20,
  T29:  29,
  T30:  30,
  T39:  39,
  T40:  40,
  T49:  49,
  T59:  59,
  T69:  69,
  T79:  79,
  T89:  89,
  T99:  99,
};

const SERVICE_COSTS = {
  bazi:             40,
  tarot:            20,
  tarot_followup:    5,
  "han-oracle-1":   10,
  "han-oracle-3":   20,
  "han-oracle-5":   30,
  "noh-oracle-1":   10,
  "noh-oracle-3":   20,
  "noh-oracle-5":   30,
  "destiny":        49,
  "destiny-2":       0,
  "foot-reading":   30,
  "deity":          20,
  "love-code":      10,
  "saju":           59,
  "saju-read":       0,
  "loshu":          20,
  "pinnacle":       20,
  "thai-astro":     99,
  "thai-astro-read": 0,
  "gunghap":        TIER.T39,
  "gunghap-read":   TIER.FREE,
  "tojung": TIER.T29,
  "numerology": TIER.T39,
  "mole-reading": TIER.T10,
  "voice-reading": TIER.T49,
  "nakshatras": TIER.T19,
  "vedic": TIER.T49,
  "pastlife": TIER.T30,
  "challenge": TIER.T20,
  "seven": TIER.T39,
  "triwai": TIER.T9,
  "thaksa": TIER.T19,
  "soul_aura": TIER.T19,
  "biorhythm": TIER.T10,
  "kabbalah": TIER.T19,
  "destiny":   TIER.T79,
  "destiny-2": TIER.T79,
};

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

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

  const service = body.service;
  const cost = SERVICE_COSTS[service];
  if (cost === undefined) return res.status(400).json({ error: 'invalid_service' });

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
