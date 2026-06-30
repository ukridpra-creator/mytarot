// api/tree-reward.js
// รับเหรียญจากต้นไม้ศักดิ์สิทธิ์

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

  const { color } = req.body || {};
  if (!color) return res.status(400).json({ error: 'missing_color' });

  // สุ่มเหรียญตามสี
  // yellow = ถุงทอง 5-10, อื่นๆ = 1-5
  let reward;
  if (color === 'yellow') {
    reward = Math.floor(Math.random() * 6) + 5; // 5-10
  } else {
    reward = Math.floor(Math.random() * 5) + 1; // 1-5
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const data = snap.exists ? snap.data() : {};
    const newCoins = (data.coins || 0) + reward;

    await userRef.set({ coins: newCoins }, { merge: true });

    return res.status(200).json({
      reward,
      coins: newCoins,
      message: `รับ ${reward} เหรียญจากต้นไม้ศักดิ์สิทธิ์!`
    });

  } catch(e) {
    console.error('tree-reward error:', e);
    return res.status(500).json({ error: 'server_error' });
  }
}
