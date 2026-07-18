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

// แปลงค่า createdAt ให้เป็น JS Date อย่างปลอดภัย ไม่ว่าจะเป็น Firestore Timestamp,
// string, number, Date object หรือรูปแบบอื่น — ถ้าแปลงไม่ได้จะ return null แทนที่จะ throw error
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
const MAX_ATTEMPTS = 5;       // จำนวนครั้งที่พิมพ์รหัสผิดได้ก่อนถูกล็อก
const LOCKOUT_MINUTES = 15;   // ระยะเวลาที่ถูกล็อกหลังพิมพ์ผิดครบจำนวน

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  if (!ADMIN_PASS) {
    console.error('admin error: ADMIN_PASSWORD is not configured in environment variables');
    return res.status(500).json({ error: 'server_misconfigured' });
  }

  // ระบุตัวตนผู้เรียกด้วย IP เพื่อกันการสุ่มรหัสผ่าน (brute-force)
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
      update.count = 0; // รีเซ็ตตัวนับหลังล็อก รอบถัดไปเริ่มนับใหม่
    }
    await attemptRef.set(update, { merge: true });
    return res.status(401).json({ error: 'unauthorized' });
  }

  // เข้าสำเร็จ — เคลียร์ประวัติความพยายามที่ผิดของ IP นี้
  if (attemptSnap.exists) await attemptRef.delete();

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // จุดเริ่มต้นสัปดาห์นี้ (จันทร์) และเดือนนี้ (วันที่ 1)
    const weekStart = new Date(todayStart);
    const dayOfWeek = weekStart.getDay(); // 0=อาทิตย์...6=เสาร์
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - diffToMonday);

    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    // ดึง users ทั้งหมด
    const usersSnap = await db.collection('users').get();
    const totalUsers = usersSnap.size;
    let newToday = 0;

    let allTx = [];
    let totalRevenue = 0;
    let todayRevenue = 0;
    let totalCoins = 0;
    const pageCountAll = {};
    const pageCountToday = {};
    const pageCountWeek = {};
    const pageCountMonth = {};
    const pkgCount = {};

    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data();

      // ยูสใหม่วันนี้
      const userCreated = toJSDate(data.createdAt);
      if (userCreated && userCreated >= todayStart) newToday++;

      // transactions
      const txSnap = await db.collection('users').doc(userDoc.id).collection('transactions').get();
      txSnap.forEach(tx => {
        const t = tx.data();
        const amt = (t.amount || 0) / 100;
        totalRevenue += amt;
        totalCoins += (t.coins || 0);
        const txCreated = toJSDate(t.createdAt);
        if (txCreated && txCreated >= todayStart) todayRevenue += amt;
        allTx.push({ ...t, userId: userDoc.id });
        const label = t.label || 'unknown';
        pkgCount[label] = (pkgCount[label] || 0) + 1;
      });

      // readings
      const rSnap = await db.collection('users').doc(userDoc.id).collection('readings').get();
      rSnap.forEach(r => {
        const rd = r.data();
        const type = rd.type || 'unknown';
        const readingDate = toJSDate(rd.createdAt);

        pageCountAll[type] = (pageCountAll[type] || 0) + 1;
        if (readingDate && readingDate >= monthStart) pageCountMonth[type] = (pageCountMonth[type] || 0) + 1;
        if (readingDate && readingDate >= weekStart) pageCountWeek[type] = (pageCountWeek[type] || 0) + 1;
        if (readingDate && readingDate >= todayStart) pageCountToday[type] = (pageCountToday[type] || 0) + 1;
      });
    }

    // Top pages — แยกตามช่วงเวลา
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

    // Top packages
    const topPkgs = Object.entries(pkgCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Recent transactions
    const recentTx = allTx
      .sort((a, b) => {
        const aDate = toJSDate(a.createdAt);
        const bDate = toJSDate(b.createdAt);
        return (bDate ? bDate.getTime() : 0) - (aDate ? aDate.getTime() : 0);
      })
      .slice(0, 8)
      .map(t => {
        const d = toJSDate(t.createdAt);
        return {
          label: t.label || '—',
          amount: (t.amount || 0) / 100,
          coins: t.coins || 0,
          createdAt: d ? d.toISOString() : null,
        };
      });

    return res.status(200).json({
      totalUsers,
      newToday,
      totalRevenue: Math.round(totalRevenue),
      todayRevenue: Math.round(todayRevenue),
      totalTx: allTx.length,
      totalCoins,
      topPages,
      topPkgs,
      recentTx,
    });

  } catch (e) {
    console.error('admin error:', e);
    return res.status(500).json({ error: e.message });
  }
}