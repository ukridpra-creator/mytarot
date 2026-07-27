// api/checkin.js
// เช็คอินประจำวัน — server-side ทั้งหมด

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const config = { maxDuration: 10 };

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
const auth = getAuth();

const REWARDS = { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10, 7:50 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.replace('Bearer ', '').trim();
  if (!idToken) return res.status(401).json({ error: 'no_token' });

  let uid;
  try {
    const decoded = await auth.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch(e) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  try {
    const userRef = db.collection('users').doc(uid);

    const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const today = now.toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() + 7 * 60 * 60 * 1000 - 86400000).toISOString().slice(0, 10);

    const { checkOnly } = req.body;

    // ── ใช้ Firestore Transaction ครอบทั้งการเช็คสถานะและเติมเหรียญ ──
    // เดิมโค้ดอ่านค่า coins มาบวกเลขแล้วเขียนทับ (read-then-write) มีโอกาสเกิด race condition
    // ถ้ามี 2 request มาพร้อมกัน (เช่นกดซ้ำเร็วๆ) อาจได้เหรียญไม่ครบหรือได้ซ้ำ
    // เปลี่ยนมาใช้ FieldValue.increment() ภายใน transaction แทน เพื่อความถูกต้อง atomic
    const result = await db.runTransaction(async (t) => {
      const snap = await t.get(userRef);
      const data = snap.exists ? snap.data() : {};

      // เช็คอินแล้ววันนี้
      if ((data.lastCheckin || '') === today) {
        return { already: true, streak: data.checkinStreak || 0, coins: data.coins || 0 };
      }

      // checkOnly — แค่ดูว่าเช็คอินแล้วหรือยัง ไม่ได้เหรียญ ไม่ต้องเขียนอะไร
      if (checkOnly) {
        return { checkOnlyMode: true, already: false, streak: data.checkinStreak || 0, coins: data.coins || 0 };
      }

      // คำนวณ streak
      let streak = data.checkinStreak || 0;
      if ((data.lastCheckin || '') === yesterday) {
        streak = Math.min(streak + 1, 7);
      } else {
        streak = 1;
      }

      const reward = REWARDS[streak] || 10;
      const saveStreak = streak === 7 ? 0 : streak;

      t.set(userRef, {
        lastCheckin: today,
        checkinStreak: saveStreak,
        coins: FieldValue.increment(reward),
        lastActive: new Date(),
      }, { merge: true });

      // ── บันทึกลง coin ledger กลาง เพื่อให้ admin dashboard ดูย้อนหลังได้ว่า
      //    user คนนี้ได้เหรียญจากเช็คอินวันไหนบ้าง (ของเดิมไม่เคย log ไว้เลย) ──
      const ledgerRef = db.collection('coin_ledger').doc();
      t.set(ledgerRef, {
        uid,
        source: 'checkin',
        coins: reward,
        detail: { streak },
        createdAt: new Date(),
      });

      return { already: false, streak, reward };
    });

    if (result.already) {
      return res.status(200).json({
        already: true,
        streak: result.streak,
        coins: result.coins,
        message: 'เช็คอินแล้ววันนี้ค่ะ'
      });
    }

    if (result.checkOnlyMode) {
      return res.status(200).json({
        already: false,
        streak: result.streak,
        coins: result.coins,
      });
    }

    // อ่านยอดเหรียญล่าสุดหลัง transaction เพื่อตอบกลับให้ตรงจริง
    const updatedSnap = await userRef.get();
    const newCoins = updatedSnap.data()?.coins || 0;

    return res.status(200).json({
      already: false,
      streak: result.streak,
      reward: result.reward,
      coins: newCoins,
      message: `รับ ${result.reward} เหรียญสำเร็จ!`
    });

  } catch(e) {
    console.error('checkin error:', e);
    return res.status(500).json({ error: 'server_error' });
  }
}