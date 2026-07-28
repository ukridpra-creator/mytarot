// api/verify-google-purchase.js
// ตรวจสอบการซื้อเหรียญผ่าน Google Play Billing (เฉพาะแอป Android) แล้วเติมเหรียญให้ user
// โครงเดียวกับ verify-slip.js แต่ตรวจ purchaseToken ของ Google แทนสลิป EasySlip

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { google } from 'googleapis';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const ALLOWED_ORIGIN = 'https://www.mytarot.vip';
const PACKAGE_NAME = 'vip.mytarot.app'; // ต้องตรงกับ appId ใน capacitor.config.json เป๊ะ

// ── ข้อมูลแพ็กเกจ: product ID → จำนวนเหรียญที่ให้ + ราคาที่ตั้งใน Play Console (บาท) ──
// ราคาตั้งแพงกว่าเว็บ ~20% เพื่อชดเชยค่า commission ที่ Google หัก (15% ปีแรก)
const PRODUCT_INFO = {
  mytarot_coins_50:   { coins: 50,   amount: 30   },
  mytarot_coins_100:  { coins: 100,  amount: 60   },
  mytarot_coins_330:  { coins: 330,  amount: 180  },
  mytarot_coins_575:  { coins: 575,  amount: 300  },
  mytarot_coins_1200: { coins: 1200, amount: 600  },
  mytarot_coins_2500: { coins: 2500, amount: 1200 },
};

// จัดกลุ่มยอดเงินเป็น tier เดียวกับที่ verify-slip.js ใช้ เพื่อให้ "แพ็กเกจขายดี"
// ใน admin dashboard นับรวมทั้ง EasySlip และ Google Play เข้าด้วยกันในหมวดเดียว
function pkgTierKey(amount) {
  if (amount >= 1000) return 'pkg_1000';
  if (amount >= 500)  return 'pkg_500';
  if (amount >= 250)  return 'pkg_250';
  if (amount >= 150)  return 'pkg_150';
  if (amount >= 50)   return 'pkg_50';
  if (amount >= 25)   return 'pkg_25';
  return 'pkg_other';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('verify-google-purchase error: service account env vars missing');
    return res.status(500).json({ error: 'server_misconfigured' });
  }

  // ── Auth: ยืนยันตัวตนผู้ใช้ด้วย Firebase ID token ──
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'unauthorized' });

  let uid;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  const { productId, purchaseToken } = req.body || {};
  if (!productId || !purchaseToken) {
    return res.status(400).json({ error: 'missing_fields', message: 'ข้อมูลการซื้อไม่ครบค่ะ' });
  }

  const productInfo = PRODUCT_INFO[productId];
  if (!productInfo) {
    return res.status(400).json({ error: 'unknown_product', message: 'ไม่พบแพ็กเกจนี้ในระบบค่ะ' });
  }

  const db = getFirestore();

  // ── กันซ้ำ: ถ้า purchaseToken นี้เคยถูกใช้แล้ว ไม่เติมเหรียญซ้ำ ──
  const usedRef = db.collection('used_google_purchases').doc(purchaseToken);
  const usedSnap = await usedRef.get();
  if (usedSnap.exists) {
    return res.status(400).json({ error: 'already_used', message: 'รายการนี้ถูกใช้ไปแล้วค่ะ' });
  }

  // ── ตรวจสอบ purchaseToken กับ Google Play Developer API ──
  let purchaseState;
  try {
    const auth = new google.auth.JWT({
      email: process.env.FIREBASE_CLIENT_EMAIL,
      key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    const androidpublisher = google.androidpublisher({ version: 'v3', auth });

    const result = await androidpublisher.purchases.products.get({
      packageName: PACKAGE_NAME,
      productId,
      token: purchaseToken,
    });

    purchaseState = result.data.purchaseState; // 0 = ซื้อสำเร็จ, 1 = ยกเลิก, 2 = pending
  } catch (e) {
    console.error('Google Play verify error:', e?.response?.data || e.message);
    return res.status(500).json({ error: 'google_verify_failed', message: 'ตรวจสอบการซื้อกับ Google ไม่สำเร็จค่ะ กรุณาลองใหม่' });
  }

  if (purchaseState !== 0) {
    return res.status(400).json({ error: 'purchase_not_completed', message: 'การซื้อยังไม่สำเร็จหรือถูกยกเลิกค่ะ' });
  }

  // ── เติมเหรียญ (Firestore Transaction) ──
  const userRef = db.collection('users').doc(uid);
  const totalCoins = productInfo.coins;
  const amount = productInfo.amount;
  const tierKey = pkgTierKey(amount);
  const statsRef = db.collection('stats').doc('summary');

  try {
    await db.runTransaction(async (t) => {
      t.set(usedRef, { uid, productId, usedAt: new Date() });

      t.set(userRef, {
        coins: FieldValue.increment(totalCoins),
        lastActive: new Date(),
      }, { merge: true });

      // เขียนลง topup_history ร่วมกับรายการ EasySlip เพื่อให้ admin dashboard
      // (recentTx, todayRevenue) นับรวมทั้ง 2 ช่องทางโดยไม่ต้องแก้ admin.js เพิ่ม
      t.set(db.collection('topup_history').doc(), {
        uid,
        transRef: purchaseToken.slice(0, 40), // ตัดให้สั้นลง เก็บไว้อ้างอิงเฉยๆ
        coins: totalCoins,
        bonus: 0,
        totalCoins,
        amount,
        source: 'google_play',
        productId,
        createdAt: new Date(),
      });

      t.set(statsRef, {
        totalRevenue: FieldValue.increment(amount),
        totalCoinsSold: FieldValue.increment(totalCoins),
        totalTx: FieldValue.increment(1),
        [tierKey]: FieldValue.increment(1),
      }, { merge: true });
    });
  } catch (e) {
    console.error('verify-google-purchase transaction error:', e);
    return res.status(500).json({ error: 'transaction_failed', message: 'เกิดข้อผิดพลาดค่ะ กรุณาลองใหม่' });
  }

  // ── consume purchase ฝั่ง Google เพื่อให้ซื้อแพ็กเกจนี้ซ้ำได้อีกในอนาคต ──
  // (ทำหลัง credit สำเร็จแล้วเท่านั้น ถ้า consume fail ไม่กระทบเหรียญที่เติมไปแล้ว
  //  แค่ log ไว้เฉยๆ เพราะ Google จะ auto-refund ถ้าไม่ acknowledge/consume ภายใน 3 วัน)
  try {
    const auth = new google.auth.JWT({
      email: process.env.FIREBASE_CLIENT_EMAIL,
      key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    const androidpublisher = google.androidpublisher({ version: 'v3', auth });
    await androidpublisher.purchases.products.consume({
      packageName: PACKAGE_NAME,
      productId,
      token: purchaseToken,
    });
  } catch (e) {
    console.error('consume purchase failed (non-fatal, coins already credited):', e?.response?.data || e.message);
  }

  const updatedSnap = await userRef.get();
  const newCoins = updatedSnap.data()?.coins || totalCoins;

  return res.status(200).json({
    success: true,
    newCoins,
    coinsAdded: totalCoins,
    message: `เติมเหรียญสำเร็จค่ะ ได้รับ 🪙 ${totalCoins.toLocaleString()} เหรียญค่ะ`
  });
}