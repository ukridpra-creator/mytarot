import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
const ADMIN_PASS = process.env.ADMIN_PASSWORD;
const ALLOWED_ORIGIN = 'https://www.mytarot.vip';

function toJSDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  if (!ADMIN_PASS) {
    console.error('admin-user-detail error: ADMIN_PASSWORD is not configured');
    return res.status(500).json({ error: 'server_misconfigured' });
  }

  const { password, uid } = req.body;
  if (password !== ADMIN_PASS) return res.status(401).json({ error: 'unauthorized' });
  if (!uid) return res.status(400).json({ error: 'missing_uid' });

  try {
    const userRef = db.collection('users').doc(uid);

    // ดึงข้อมูล user + แหล่งที่มาเหรียญทั้งหมด + readings ของคนนี้พร้อมกัน
    // (scoped เฉพาะ uid เดียว เร็วมาก ไม่มีปัญหา N+1)
    // หมายเหตุ: ถ้า Firestore ขึ้น error "FAILED_PRECONDITION" ตอน query ที่มี where+orderBy
    // ครั้งแรก ให้กด link ที่ error แนบมาเพื่อสร้าง composite index อัตโนมัติ (ทำครั้งเดียว)
    const [userSnap, topupSnap, ledgerSnap, readingsSnap] = await Promise.all([
      userRef.get(),
      db.collection('topup_history').where('uid', '==', uid).orderBy('createdAt', 'desc').limit(50).get(),
      db.collection('coin_ledger').where('uid', '==', uid).orderBy('createdAt', 'desc').limit(50).get(),
      userRef.collection('readings').orderBy('createdAt', 'desc').limit(50).get(),
    ]);

    if (!userSnap.exists) return res.status(404).json({ error: 'user_not_found' });

    const userData = userSnap.data();

    // ── รวมแหล่งที่มาของเหรียญทั้งหมดเป็นรายการเดียว เรียงตามเวลา ──
    const topupEntries = topupSnap.docs.map(d => {
      const t = d.data();
      const dt = toJSDate(t.createdAt);
      return {
        source: 'topup',
        label: `💳 เติมเงิน ฿${(t.amount || 0).toLocaleString()}`,
        coins: t.totalCoins || 0,
        createdAt: dt ? dt.toISOString() : null,
      };
    });

    const sourceLabelMap = { checkin: '🎁 เช็คอินรายวัน', tree: '🌳 เขย่าต้นไม้มงคล' };
    const ledgerEntries = ledgerSnap.docs.map(d => {
      const l = d.data();
      const dt = toJSDate(l.createdAt);
      return {
        source: l.source || 'other',
        label: sourceLabelMap[l.source] || (l.source || 'อื่นๆ'),
        coins: l.coins || 0,
        createdAt: dt ? dt.toISOString() : null,
      };
    });

    const coinSources = [...topupEntries, ...ledgerEntries]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 50);

    const readings = readingsSnap.docs.map(d => {
      const r = d.data();
      const dt = toJSDate(r.createdAt);
      return {
        type: r.type || 'unknown',
        createdAt: dt ? dt.toISOString() : null,
      };
    });

    return res.status(200).json({
      uid,
      displayName: userData.displayName || '',
      email: userData.email || '',
      coins: userData.coins || 0,
      createdAt: toJSDate(userData.createdAt)?.toISOString() || null,
      coinSources,
      readings,
    });
  } catch (e) {
    console.error('admin-user-detail error:', e);
    return res.status(500).json({ error: e.message });
  }
}