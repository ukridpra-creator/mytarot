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

// เผื่อเวลาให้พอสำหรับ collectionGroup query ถ้าข้อมูลเยอะ (ปรับได้ตาม plan ของ Vercel)
export const config = { maxDuration: 30 };

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

    // ── ดึงข้อมูลหลักพร้อมกัน (แทนการวนลูป query ทีละ user แบบเดิมที่ทำให้ช้า
    //    และเสี่ยง timeout กลางทางจนข้อมูลบางคนหายไปเงียบๆ)
    //    หมายเหตุสำคัญ: ระบบเติมเงินปัจจุบันใช้ EasySlip ซึ่งบันทึกลง collection
    //    ระดับบนสุด "topup_history" ไม่ใช่ sub-collection "users/{uid}/transactions"
    //    แบบเดิม (ที่เป็นของระบบ Stripe เก่า) — ของเดิม query ผิด collection มาตลอด
    //    จึงไม่เคยเห็นยอดเติมเงินที่เกิดขึ้นจริงเลย ──
    const [usersSnap, topupSnap, readingsGroupSnap, ledgerSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('topup_history').get(),
      db.collectionGroup('readings').get(),
      db.collection('coin_ledger').get(),
    ]);

    const totalUsers = usersSnap.size;
    let newToday = 0;

    // เก็บข้อมูล user ไว้ใน map เพื่อ lookup เร็ว ไม่ query ซ้ำ
    const userMap = {};
    usersSnap.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = toJSDate(data.createdAt);
      userMap[doc.id] = {
        uid: doc.id,
        displayName: data.displayName || '',
        email: data.email || '',
        coins: data.coins || 0,
        createdAt,
        lastActive: null, // คำนวณจาก transaction/reading ล่าสุดของ user นี้ด้านล่าง
      };
      if (createdAt && createdAt >= todayStart) newToday++;
    });

    // ── ประมวลผล topup_history ของทุก user รวดเดียว (EasySlip) ──
    let allTx = [];
    let totalRevenue = 0;
    let todayRevenue = 0;
    let totalCoins = 0;
    const pkgCount = {};

    topupSnap.forEach(txDoc => {
      const t = txDoc.data();
      const uid = t.uid; // topup_history เป็น top-level collection เก็บ uid เป็น field ตรงๆ
      const amt = t.amount || 0; // บาทเต็มอยู่แล้ว (EasySlip) ไม่ใช่หน่วยสตางค์แบบ Stripe เดิม
      const coinsAdded = t.totalCoins || 0; // ยอดเหรียญจริงที่ได้ (รวมโบนัส)
      const txCreated = toJSDate(t.createdAt);

      totalRevenue += amt;
      totalCoins += coinsAdded;
      if (txCreated && txCreated >= todayStart) todayRevenue += amt;

      allTx.push({
        label: `เติมเงิน (${coinsAdded.toLocaleString()} เหรียญ)`,
        amount: amt,
        coins: coinsAdded,
        userId: uid,
        _createdAtDate: txCreated,
      });

      // จัดกลุ่มตามยอดเงิน แทน "label" แบบเดิม (EasySlip ไม่มี package name เหมือน Stripe)
      const pkgLabel = `฿${amt.toLocaleString()}`;
      pkgCount[pkgLabel] = (pkgCount[pkgLabel] || 0) + 1;

      if (uid && userMap[uid] && txCreated) {
        if (!userMap[uid].lastActive || txCreated > userMap[uid].lastActive) {
          userMap[uid].lastActive = txCreated;
        }
      }
    });

    // ── รวมความเคลื่อนไหวจาก coin_ledger (เช็คอิน/ต้นไม้) เข้า lastActive ด้วย ──
    ledgerSnap.forEach(ledgerDoc => {
      const l = ledgerDoc.data();
      const uid = l.uid;
      const created = toJSDate(l.createdAt);
      if (uid && userMap[uid] && created) {
        if (!userMap[uid].lastActive || created > userMap[uid].lastActive) {
          userMap[uid].lastActive = created;
        }
      }
    });

    // ── ประมวลผล readings ของทุก user รวดเดียว ──
    const pageCountAll = {};
    const pageCountToday = {};
    const pageCountWeek = {};
    const pageCountMonth = {};

    readingsGroupSnap.forEach(rDoc => {
      const rd = rDoc.data();
      const uid = rDoc.ref.parent.parent?.id;
      const type = rd.type || 'unknown';
      const readingDate = toJSDate(rd.createdAt);

      pageCountAll[type] = (pageCountAll[type] || 0) + 1;
      if (readingDate && readingDate >= monthStart) pageCountMonth[type] = (pageCountMonth[type] || 0) + 1;
      if (readingDate && readingDate >= weekStart) pageCountWeek[type] = (pageCountWeek[type] || 0) + 1;
      if (readingDate && readingDate >= todayStart) pageCountToday[type] = (pageCountToday[type] || 0) + 1;

      if (uid && userMap[uid] && readingDate) {
        if (!userMap[uid].lastActive || readingDate > userMap[uid].lastActive) {
          userMap[uid].lastActive = readingDate;
        }
      }
    });

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
      .sort((a, b) => (b._createdAtDate ? b._createdAtDate.getTime() : 0) - (a._createdAtDate ? a._createdAtDate.getTime() : 0))
      .slice(0, 8)
      .map(t => ({
        label: t.label || '—',
        amount: (t.amount || 0) / 100,
        coins: t.coins || 0,
        userId: t.userId,
        createdAt: t._createdAtDate ? t._createdAtDate.toISOString() : null,
      }));

    // ── ผู้ใช้ที่มีความเคลื่อนไหวล่าสุด (อิงจากเวลาอ่านไพ่/เติมเงินล่าสุด) ──
    const recentUsers = Object.values(userMap)
      .filter(u => u.lastActive)
      .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
      .slice(0, 15)
      .map(u => ({
        uid: u.uid,
        displayName: u.displayName || u.email || ('User ' + u.uid.slice(0, 8)),
        email: u.email,
        coins: u.coins,
        lastActive: u.lastActive.toISOString(),
      }));

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
      recentUsers,
    });

  } catch (e) {
    console.error('admin error:', e);
    return res.status(500).json({ error: e.message });
  }
}