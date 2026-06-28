// api/checkin.js
// เช็คอินประจำวัน — server-side ทั้งหมด

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const config = { maxDuration: 10 };

// init Firebase Admin
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

  // verify token
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
    const snap = await userRef.get();
    const data = snap.exists ? snap.data() : {};

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // เช็คอินแล้ววันนี้
    if ((data.lastCheckin || '') === today) {
      return res.status(200).json({
        already: true,
        streak: data.checkinStreak || 0,
        coins: data.coins || 0,
        message: 'เช็คอินแล้ววันนี้ค่ะ'
      });
    }

    // คำนวณ streak
    let streak = data.checkinStreak || 0;
    if ((data.lastCheckin || '') === yesterday) {
      streak = Math.min(streak + 1, 7);
    } else {
      streak = 1;
    }

    const reward = REWARDS[streak] || 10;
    const newCoins = (data.coins || 0) + reward;

    // reset streak หลังวันที่ 7
    const saveStreak = streak === 7 ? 0 : streak;

    await userRef.set({
      lastCheckin: today,
      checkinStreak: saveStreak,
      coins: newCoins,
    }, { merge: true });

    return res.status(200).json({
      already: false,
      streak: streak,
      reward: reward,
      coins: newCoins,
      message: `รับ ${reward} เหรียญสำเร็จ!`
    });

  } catch(e) {
    console.error('checkin error:', e);
    return res.status(500).json({ error: 'server_error' });
  }
}