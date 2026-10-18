// POST /api/admin-user-search  { password, q }
// ค้นหา user จาก: UID / อีเมล / ชื่อ (displayName)
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
const iso = (t) => (t && t.toDate ? t.toDate().toISOString() : t || null);

async function pack(doc, email) {
  const d = doc.data() || {};
  if (email === undefined) {
    try { email = (await getAuth().getUser(doc.id)).email || ''; } catch { email = ''; }
  }
  return { uid: doc.id, displayName: d.displayName || '', email, coins: d.coins || 0, lastActive: iso(d.lastActive) };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password, q } = req.body || {};
  if (!passOk(password)) return res.status(401).json({ error: 'unauthorized' });
  const term = String(q || '').trim();
  if (term.length < 2) return res.status(400).json({ error: 'query_too_short' });

  try {
    const out = new Map();

    // 1) อีเมล
    if (term.includes('@')) {
      try {
        const u = await getAuth().getUserByEmail(term);
        const doc = await db.collection('users').doc(u.uid).get();
        if (doc.exists) out.set(doc.id, await pack(doc, u.email || term));
      } catch {}
    }
    // 2) UID ตรงๆ
    if (/^[A-Za-z0-9]{20,40}$/.test(term)) {
      const doc = await db.collection('users').doc(term).get();
      if (doc.exists) out.set(doc.id, await pack(doc));
    }
    // 3) ชื่อ: prefix query (เร็ว/ถูก)
    if (out.size < 20) {
      const snap = await db.collection('users').orderBy('displayName')
        .startAt(term).endAt(term + '').limit(20).get();
      for (const doc of snap.docs) if (!out.has(doc.id)) out.set(doc.id, await pack(doc));
    }
    // 4) ชื่อ: ถ้ายังไม่เจอ สแกนยูสที่ active ล่าสุด 1500 คน หาแบบ "มีคำนี้อยู่ข้างใน"
    if (out.size === 0) {
      const snap = await db.collection('users').orderBy('lastActive', 'desc').limit(1500).get();
      const t = term.toLowerCase();
      for (const doc of snap.docs) {
        if (String(doc.data().displayName || '').toLowerCase().includes(t)) {
          out.set(doc.id, await pack(doc));
          if (out.size >= 20) break;
        }
      }
    }
    return res.status(200).json({ users: [...out.values()].slice(0, 20) });
  } catch (e) {
    console.error('admin-user-search', e);
    return res.status(500).json({ error: 'server_error' });
  }
}