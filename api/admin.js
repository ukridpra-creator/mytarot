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

export const config = { maxDuration: 30 };

// แปลงค่า createdAt ให้เป็น JS Date อย่างปลอดภัย
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

const ALLOWED_ORIGIN = 'https://www.mytarot.vip';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// จำนวน readings สูงสุดที่จะดึงมาคำนวณ "หน้าที่เล่นเยอะสุด" ต่อครั้ง
// (จำกัดไว้กันโควต้าบาน เนื่องจากยังไม่มีระบบ counter แยกตามประเภทการอ่าน
//  ผลลัพธ์จึงเป็นค่าประมาณจากตัวอย่างล่าสุด ไม่ใช่ยอดสะสมทั้งหมด 100%)
const READINGS_SAMPLE_LIMIT = 3000;

const PKG_LABELS = {
  pkg_25: '฿25', pkg_50: '฿50', pkg_150: '฿150',
  pkg_250: '฿250', pkg_500: '฿500', pkg_1000: '฿1000+', pkg_other: 'อื่นๆ',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  if (!ADMIN_PASS) {
    console.error('admin error: ADMIN_PASSWORD is not configured in environment variables');
    return res.status(500).json({ error: 'server_misconfigured' });
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').toString().split(',')[0].trim();
  const attemptRef = db.collection('_adminLoginAttempts').doc(ip);

  const attemptSnap = await attemptRef.get();
  const now = Date.now();
  if (attemptSnap.exists) {
    const a = attemptSnap.data();
    const lockedUntil = (a.lockedUntil || 0);
    if (lockedUntil > now) {
      const waitMin = Math.ceil((lockedUntil - now) / 60000);
      return res.status(429).json({ error: 'too_many_attempts', message: `ลองผิดหลายครั้งเกินไป กรุณารออีก ${waitMin} นาทีค่ะ` });
    }
  }

  const { password } = req.body;
  if (password !== ADMIN_PASS) {
    const prev = attemptSnap.exists ? attemptSnap.data() : { count: 0 };
    const newCount = (prev.count || 0) + 1;
    const update = { count: newCount, lastAttempt: now };
    if (newCount >= MAX_ATTEMPTS) {
      update.lockedUntil = now + LOCKOUT_MINUTES * 60000;
      update.count = 0;
    }
    await attemptRef.set(update, { merge: true });
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (attemptSnap.exists) await attemptRef.delete();

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(todayStart);
    const dayOfWeek = weekStart.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - diffToMonday);

    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    // ── ดึงข้อมูลทั้งหมดพร้อมกัน แบบประหยัดโควต้าที่สุดเท่าที่ทำได้:
    //    - stats/summary: อ่าน 1 doc (ยอดรวมทั้งหมด อัปเดตโดย verify-slip.js)
    //    - totalUsers / newToday: aggregation count query (ถูกกว่าอ่านทุก doc มาก)
    //    - todayTopup: จำกัดแค่ของวันนี้เท่านั้น (เล็ก ไม่โตตามข้อมูลสะสม)
    //    - recentTx: orderBy+limit(8) อ่านแค่ 8 รายการล่าสุด
    //    - recentUsers: orderBy(lastActive)+limit(15) อ่านแค่ 15 คน (lastActive มาจาก
    //      checkin/tree-reward/verify-slip ที่อัปเดต field นี้ทุกครั้งที่มีกิจกรรม)
    //    - readings: จำกัดตัวอย่าง 3000 รายการล่าสุด (ดูหมายเหตุที่ READINGS_SAMPLE_LIMIT) ──
    const [
      statsSnap,
      totalUsersAgg,
      newTodayAgg,
      todayTopupSnap,
      recentTxSnap,
      recentUsersSnap,
      readingsSnap,
    ] = await Promise.all([
      db.collection('stats').doc('summary').get(),
      db.collection('users').count().get(),
      db.collection('users').where('createdAt', '>=', todayStart).count().get(),
      db.collection('topup_history').where('createdAt', '>=', todayStart).get(),
      db.collection('topup_history').orderBy('createdAt', 'desc').limit(8).get(),
      db.collection('users').orderBy('lastActive', 'desc').limit(15).get(),
      db.collectionGroup('readings').limit(READINGS_SAMPLE_LIMIT).get(),
    ]);

    const stats = statsSnap.exists ? statsSnap.data() : {};
    const totalUsers = totalUsersAgg.data().count;
    const newToday = newTodayAgg.data().count;

    let todayRevenue = 0;
    todayTopupSnap.forEach(d => { todayRevenue += d.data().amount || 0; });

    const recentTx = recentTxSnap.docs.map(d => {
      const t = d.data();
      const dt = toJSDate(t.createdAt);
      return {
        label: `เติมเงิน (${(t.totalCoins || 0).toLocaleString()} เหรียญ)`,
        amount: t.amount || 0,
        coins: t.totalCoins || 0,
        userId: t.uid,
        createdAt: dt ? dt.toISOString() : null,
      };
    });

    const recentUsers = recentUsersSnap.docs.map(doc => {
      const d = doc.data();
      const dt = toJSDate(d.lastActive);
      return {
        uid: doc.id,
        displayName: d.displayName || d.email || ('User ' + doc.id.slice(0, 8)),
        email: d.email || '',
        coins: d.coins || 0,
        lastActive: dt ? dt.toISOString() : null,
      };
    });

    // ── Top pages (ตัวอย่างจาก READINGS_SAMPLE_LIMIT รายการล่าสุด) ──
    const pageCountAll = {};
    const pageCountToday = {};
    const pageCountWeek = {};
    const pageCountMonth = {};

    readingsSnap.forEach(rDoc => {
      const rd = rDoc.data();
      const type = rd.type || 'unknown';
      const readingDate = toJSDate(rd.createdAt);

      pageCountAll[type] = (pageCountAll[type] || 0) + 1;
      if (readingDate && readingDate >= monthStart) pageCountMonth[type] = (pageCountMonth[type] || 0) + 1;
      if (readingDate && readingDate >= weekStart) pageCountWeek[type] = (pageCountWeek[type] || 0) + 1;
      if (readingDate && readingDate >= todayStart) pageCountToday[type] = (pageCountToday[type] || 0) + 1;
    });

    const buildTopPages = (countObj) => Object.entries(countObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topPages = {
      all: buildTopPages(pageCountAll),
      today: buildTopPages(pageCountToday),
      week: buildTopPages(pageCountWeek),
      month: buildTopPages(pageCountMonth),
    };

    // ── Top packages: อ่านตรงจาก counter ใน stats/summary ไม่ต้องสแกนอะไรเลย ──
    const topPkgs = Object.entries(PKG_LABELS)
      .map(([key, name]) => ({ name, count: stats[key] || 0 }))
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({
      totalUsers,
      newToday,
      totalRevenue: Math.round(stats.totalRevenue || 0),
      todayRevenue: Math.round(todayRevenue),
      totalTx: stats.totalTx || 0,
      totalCoins: stats.totalCoinsSold || 0,
      topPages,
      topPkgs,
      recentTx,
      recentUsers,
    });

  } catch (e) {
    console.error('admin error:', e);
    return res.status(500).json({ error: e.message });
  }
}