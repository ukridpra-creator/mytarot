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
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'conaniscowsboy';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;
  if (password !== ADMIN_PASS) return res.status(401).json({ error: 'unauthorized' });

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // ดึง users ทั้งหมด
    const usersSnap = await db.collection('users').get();
    const totalUsers = usersSnap.size;
    let newToday = 0;

    let allTx = [];
    let totalRevenue = 0;
    let todayRevenue = 0;
    let totalCoins = 0;
    const pageCount = {};
    const pkgCount = {};

    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data();

      // ยูสใหม่วันนี้
      if (data.createdAt?.toDate() >= todayStart) newToday++;

      // transactions
      const txSnap = await db.collection('users').doc(userDoc.id).collection('transactions').get();
      txSnap.forEach(tx => {
        const t = tx.data();
        const amt = (t.amount || 0) / 100;
        totalRevenue += amt;
        totalCoins += (t.coins || 0);
        if (t.createdAt?.toDate() >= todayStart) todayRevenue += amt;
        allTx.push({ ...t, userId: userDoc.id });
        const label = t.label || 'unknown';
        pkgCount[label] = (pkgCount[label] || 0) + 1;
      });

      // readings
      const rSnap = await db.collection('users').doc(userDoc.id).collection('readings').get();
      rSnap.forEach(r => {
        const type = r.data().type || 'unknown';
        pageCount[type] = (pageCount[type] || 0) + 1;
      });
    }

    // Top pages
    const topPages = Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Top packages
    const topPkgs = Object.entries(pkgCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Recent transactions
    const recentTx = allTx
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 8)
      .map(t => ({
        label: t.label || '—',
        amount: (t.amount || 0) / 100,
        coins: t.coins || 0,
        createdAt: t.createdAt?.toDate()?.toISOString() || null,
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
    });

  } catch (e) {
    console.error('admin error:', e);
    return res.status(500).json({ error: e.message });
  }
}
