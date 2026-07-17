// api/human-design.js
// Human Design API — ดึงตำแหน่งดาว 2 ครั้ง (conscious + design) แล้วคืนกลับ
// ไม่หักเหรียญที่นี่ — ใช้ api/claude.js หักแล้วใน human-design.html

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);

  if (req.method !== 'POST') return res.status(405).end();

  // ── Auth ──
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'unauthorized' });

  try {
    await getAuth().verifyIdToken(idToken);
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  // ── Parse body ──
  let body;
  try {
    body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
      req.on('error', reject);
    });
  } catch (e) {
    return res.status(400).json({ error: 'invalid_body' });
  }

  const { year, month, day, hour, minute, lat, lng } = body;
  if (!year || !month || !day || hour === undefined || minute === undefined || !lat || !lng) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  // ── คำนวณวันออกแบบ (88 วันก่อนเกิด) ──
  const birthDate = new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
  const designDate = new Date(birthDate.getTime() - (88 * 24 * 60 * 60 * 1000));

  // ── เรียก FreeAstroAPI ──
  async function fetchPlanets(date) {
    const res = await fetch('https://api.freeastroapi.com/api/v1/natal/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.FREEASTRO_API_KEY,
      },
      body: JSON.stringify({
        name: 'User',
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours() + 7,
        minute: date.getUTCMinutes(),
        lat,
        lng,
        tz_str: 'Asia/Bangkok'
      })
    });
    return res.json();
  }

  try {
    const [consciousRaw, designRaw] = await Promise.all([
      fetchPlanets(birthDate),
      fetchPlanets(designDate),
    ]);

    // แปลง planets array → { sun: longitude, moon: longitude, ... }
    function parsePlanets(raw) {
      const planets = {};
      const list = raw?.planets || [];
      list.forEach(p => {
        const name = (p.name || '').toLowerCase();
        const lon = p.pos ?? p.longitude ?? p.full_degree ?? 0;
        if (name === 'sun')         planets.sun = lon;
        else if (name === 'moon')   planets.moon = lon;
        else if (name === 'mercury') planets.mercury = lon;
        else if (name === 'venus')  planets.venus = lon;
        else if (name === 'mars')   planets.mars = lon;
        else if (name === 'jupiter') planets.jupiter = lon;
        else if (name === 'saturn') planets.saturn = lon;
        else if (name === 'uranus') planets.uranus = lon;
        else if (name === 'neptune') planets.neptune = lon;
        else if (name === 'pluto')  planets.pluto = lon;
        else if (name.includes('north node') || name === 'true node')
          planets.northNode = lon;
      });
      // Earth = Sun + 180
      if (planets.sun !== undefined) planets.earth = (planets.sun + 180) % 360;
      return planets;
    }

    const conscious = parsePlanets(consciousRaw);
    const design    = parsePlanets(designRaw);

    return res.status(200).json({ conscious, design });

  } catch (e) {
    console.error('HD API error:', e);
    return res.status(500).json({ error: 'calculation_failed' });
  }
}
