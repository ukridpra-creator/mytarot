// POST /api/admin-add-coins  { password, uid, coins, reason }
// เพิ่ม(หรือหัก ถ้าใส่ติดลบ) เหรียญให้ user + บันทึก coin_ledger เป็นหลักฐาน
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'crypto';

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

function passOk(p) {
  const a = Buffer.from(String(p || ''));
  const b = Buffer.from(String(process.env.ADMIN_PASSWORD || ''));
  return a.length === b.length && b.length > 0 && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password, uid, coins, reason } = req.body || {};
  if (!passOk(password)) return res.status(401).json({ error: 'unauthorized' });

  const n = Number(coins);
  if (!uid || typeof uid !== 'string' || !Number.isInteger(n) || n === 0 || Math.abs(n) > 100000) {
    return res.status(400).json({ error: 'bad_input' });
  }
  const note = String(reason || '').slice(0, 200) || 'admin manual';

  try {
    const userRef = db.collection('users').doc(uid);
    const ledgerRef = db.collection('coin_ledger').doc();
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) throw new Error('user_not_found');
      const before = snap.data().coins || 0;
      const after = before + n;
      if (after < 0) throw new Error('negative_balance');
      tx.update(userRef, { coins: after });
      tx.set(ledgerRef, {
        uid, delta: n, balanceBefore: before, balanceAfter: after,
        source: 'admin', coins: n, type: 'admin_adjust', reason: note,
        createdAt: FieldValue.serverTimestamp(),
      });
      return { before, after };
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    if (e.message === 'user_not_found') return res.status(404).json({ error: 'user_not_found' });
    if (e.message === 'negative_balance') return res.status(400).json({ error: 'negative_balance' });
    console.error('admin-add-coins', e);
    return res.status(500).json({ error: 'server_error' });
  }
}