// pages/api/synastry.js
// เรียก Prokerala Synastry API แล้วส่งผลกลับค่ะ

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

const db = getFirestore();
const COST = 29;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

export const config = { api: { bodyParser: true } };

// ── Prokerala OAuth token ──
let prokeralaToken = null;
let tokenExpiry = 0;

async function getProkeralaToken() {
  if (prokeralaToken && Date.now() < tokenExpiry) return prokeralaToken;
  const res = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.PROKERALA_CLIENT_ID,
      client_secret: process.env.PROKERALA_CLIENT_SECRET,
    }),
  });
  const data = await res.json();
  prokeralaToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return prokeralaToken;
}

// ── คำนวณ Western Sign จากวันเกิด ──
function getWesternSign(day, month) {
  const signs = [
    { name:'Capricorn', start:[12,22] }, { name:'Aquarius', start:[1,20] },
    { name:'Pisces',    start:[2,19]  }, { name:'Aries',    start:[3,21] },
    { name:'Taurus',    start:[4,20]  }, { name:'Gemini',   start:[5,21] },
    { name:'Cancer',    start:[6,21]  }, { name:'Leo',      start:[7,23] },
    { name:'Virgo',     start:[8,23]  }, { name:'Libra',    start:[9,23] },
    { name:'Scorpio',   start:[10,23] }, { name:'Sagittarius', start:[11,22] },
  ];
  for (const s of signs) {
    const [sm, sd] = s.start;
    if (month === sm && day >= sd) return s.name;
    if (month === (sm % 12) + 1 && day < sd) return s.name;
  }
  return 'Capricorn';
}

const SIGN_ELEMENT = {
  Aries:'Fire', Leo:'Fire', Sagittarius:'Fire',
  Taurus:'Earth', Virgo:'Earth', Capricorn:'Earth',
  Gemini:'Air', Libra:'Air', Aquarius:'Air',
  Cancer:'Water', Scorpio:'Water', Pisces:'Water',
};

const SIGN_RULER = {
  Aries:'Mars', Taurus:'Venus', Gemini:'Mercury', Cancer:'Moon',
  Leo:'Sun', Virgo:'Mercury', Libra:'Venus', Scorpio:'Pluto',
  Sagittarius:'Jupiter', Capricorn:'Saturn', Aquarius:'Uranus', Pisces:'Neptune',
};

// ── aspect interpretation ──
const ASPECT_MEANING = {
  conjunction: { th:'คอนจังก์ชัน (0°)', desc:'พลังรวมกันเข้มข้น เสริมกันอย่างแรงกล้าค่ะ', type:'neutral' },
  sextile:     { th:'เซ็กซ์ไทล์ (60°)', desc:'เสริมกันเบาๆ สร้างโอกาสดีในความสัมพันธ์ค่ะ', type:'positive' },
  square:      { th:'สแควร์ (90°)',      desc:'ทำมุม 90° มีความตึงเครียดแต่สร้างพลังขับเคลื่อนค่ะ', type:'tense' },
  trine:       { th:'ไทรน์ (120°)',      desc:'ทำมุม 120° พลังงานไหลเวียนกันอย่างกลมกลืนค่ะ', type:'positive' },
  opposition:  { th:'ออพโพสิชัน (180°)',desc:'ทำมุม 180° ดึงคนละทิศแต่ดึงดูดกันเหมือนแม่เหล็กค่ะ', type:'tense' },
  quincunx:    { th:'ควินคังซ์ (150°)', desc:'ทำมุม 150° ต้องปรับตัวหากันค่ะ', type:'neutral' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // auth
  const idToken = (req.headers.authorization || '').replace('Bearer ', '');
  if (!idToken) return res.status(401).json({ error: 'unauthorized' });

  let uid;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch { return res.status(401).json({ error: 'invalid_token' }); }

  // deduct coins
  const userRef = db.collection('users').doc(uid);
  let newBalance;
  try {
    newBalance = await db.runTransaction(async tx => {
      const snap = await tx.get(userRef);
      const coins = snap.exists ? (snap.data().coins || 0) : 0;
      if (coins < COST) throw new Error('insufficient_coins');
      const updated = coins - COST;
      tx.set(userRef, { coins: updated }, { merge: true });
      return updated;
    });
  } catch (e) {
    if (e.message === 'insufficient_coins') return res.status(402).json({ error: 'insufficient_coins' });
    return res.status(500).json({ error: 'server_error' });
  }

  const { personA, personB } = req.body;
  // personA/B: { day, month, year, hour, minute, lat, lng }

  try {
    const token = await getProkeralaToken();

    // format datetime ISO
    function toISO(p) {
      const d = new Date(p.year, p.month-1, p.day, p.hour||12, p.minute||0);
      return d.toISOString().slice(0,19)+'+00:00';
    }

    // เรียก Prokerala synastry planet positions
    const url = new URL('https://api.prokerala.com/v2/astrology/western/synastry-chart');
    url.searchParams.set('primary_birth_time',   toISO(personA));
    url.searchParams.set('primary_coordinates',  `${personA.lat||13.75},${personA.lng||100.52}`);
    url.searchParams.set('secondary_birth_time', toISO(personB));
    url.searchParams.set('secondary_coordinates',`${personB.lat||13.75},${personB.lng||100.52}`);
    url.searchParams.set('house_system', 'placidus');
    url.searchParams.set('aspect_filter', 'all');
    url.searchParams.set('la', 'en');

    const proRes = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let aspects = [];
    let planetPositions = {};

    if (proRes.ok) {
      const data = await proRes.json();
      aspects = data?.data?.aspects || [];
      planetPositions = data?.data?.planet_positions || {};
    }

    // fallback: คำนวณราศีจากวันเกิดเอาค่ะ
    const signA = getWesternSign(personA.day, personA.month);
    const signB = getWesternSign(personB.day, personB.month);
    const elemA = SIGN_ELEMENT[signA] || 'Fire';
    const elemB = SIGN_ELEMENT[signB] || 'Fire';
    const rulerA = SIGN_RULER[signA] || 'Sun';
    const rulerB = SIGN_RULER[signB] || 'Sun';

    // สร้าง aspect summary สำหรับ prompt
    const aspectSummary = aspects.slice(0, 8).map(a => {
      const m = ASPECT_MEANING[a.aspect?.toLowerCase()] || {};
      return `${a.primary_planet} ของ A ${m.th||a.aspect} ${a.secondary_planet} ของ B`;
    }).join('\n');

    res.setHeader('X-New-Coin-Balance', String(newBalance));
    res.setHeader('Access-Control-Expose-Headers', 'X-New-Coin-Balance');

    return res.status(200).json({
      newBalance,
      profileA: { sign: signA, element: elemA, ruler: rulerA },
      profileB: { sign: signB, element: elemB, ruler: rulerB },
      aspects: aspects.slice(0, 10),
      aspectSummary,
    });

  } catch (e) {
    console.error('synastry error:', e);
    // fallback ไม่มี Prokerala ก็ยังทำนายจากราศีได้ค่ะ
    const signA = getWesternSign(personA.day, personA.month);
    const signB = getWesternSign(personB.day, personB.month);
    res.setHeader('X-New-Coin-Balance', String(newBalance));
    res.setHeader('Access-Control-Expose-Headers', 'X-New-Coin-Balance');
    return res.status(200).json({
      newBalance,
      profileA: { sign: signA, element: SIGN_ELEMENT[signA], ruler: SIGN_RULER[signA] },
      profileB: { sign: signB, element: SIGN_ELEMENT[signB], ruler: SIGN_RULER[signB] },
      aspects: [],
      aspectSummary: '',
    });
  }
}
