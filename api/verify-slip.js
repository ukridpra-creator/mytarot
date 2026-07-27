// api/verify-slip.js
// ตรวจสอบสลิปด้วย EasySlip API v2 แล้วเติมเหรียญใน Firestore
// ป้องกัน: สลิปปลอม, สลิปซ้ำ, โอนเข้าบัญชีอื่น, race condition, brute-force

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createHash } from 'crypto';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const config = {
  api: { bodyParser: false }, // ต้องปิด bodyParser เพราะรับ multipart/form-data
};

const ALLOWED_ORIGIN = 'https://www.mytarot.vip'; // บังคับเจาะจงโดเมนเสมอ ไม่ใช้ '*'
const MAX_ATTEMPTS_PER_HOUR = 10; // กันสแปมยิงสลิปมั่วๆ เปลืองโควต้า EasySlip
const HASH_CACHE_HOURS = 24; // จำผลลัพธ์ของรูปเดิมไว้กี่ชั่วโมง (กันเปลือง EasySlip call ถ้ากดซ้ำ)

// ── ข้อมูลบัญชีเรา ──
const OUR_PHONE = '0815341515'; // เบอร์พร้อมเพย์ผู้รับเงิน

// ── คำนวณเหรียญจากยอดโอนจริง ──
function amountToCoins(amount) {
  if (amount >= 1000) return { coins: 2000, bonus: 500,  total: 2500 };
  if (amount >= 500)  return { coins: 1000, bonus: 200,  total: 1200 };
  if (amount >= 250)  return { coins: 500,  bonus: 75,   total: 575  };
  if (amount >= 150)  return { coins: 300,  bonus: 30,   total: 330  };
  if (amount >= 50)   return { coins: 100,  bonus: 0,    total: 100  };
  if (amount >= 25)   return { coins: 50,   bonus: 0,    total: 50   };
  return null; // น้อยกว่า 25฿ reject
}

// ── กำหนด key สำหรับ counter สรุปยอดขายแยกตามช่วงราคา (ใช้แสดง "แพ็กเกจขายดี" ใน admin
//    โดยไม่ต้องสแกน topup_history ทั้งหมดทุกครั้งที่ดู dashboard) ──
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

  if (!process.env.EASYSLIP_API_KEY) {
    console.error('verify-slip error: EASYSLIP_API_KEY is not configured');
    return res.status(500).json({ error: 'server_misconfigured' });
  }

  // ── Auth ──
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

  const db = getFirestore();

  // ── กัน brute-force / สแปม: จำกัดจำนวนครั้งต่อชั่วโมงต่อ user ──
  const rateRef = db.collection('_slipRateLimit').doc(uid);
  const rateSnap = await rateRef.get();
  const now = Date.now();
  if (rateSnap.exists) {
    const r = rateSnap.data();
    const windowStart = r.windowStart || 0;
    const withinWindow = now - windowStart < 60 * 60 * 1000;
    if (withinWindow && (r.count || 0) >= MAX_ATTEMPTS_PER_HOUR) {
      return res.status(429).json({
        error: 'too_many_attempts',
        message: 'ส่งสลิปตรวจสอบบ่อยเกินไปค่ะ กรุณารอสักครู่แล้วลองใหม่ค่ะ'
      });
    }
    await rateRef.set({
      count: withinWindow ? FieldValue.increment(1) : 1,
      windowStart: withinWindow ? windowStart : now,
    }, { merge: true });
  } else {
    await rateRef.set({ count: 1, windowStart: now });
  }

  // ── Parse multipart form ──
  let fields = {}, slipBuffer = null, slipMime = 'image/jpeg';
  try {
    const { fields: f, slipBuf, mime } = await parseMultipart(req);
    fields = f;
    slipBuffer = slipBuf;
    slipMime = mime || 'image/jpeg';
  } catch (e) {
    return res.status(400).json({ error: 'invalid_form' });
  }

  if (!slipBuffer) return res.status(400).json({ error: 'no_slip', message: 'กรุณาแนบสลิปค่ะ' });

  // ── คำนวณ hash ของรูปภาพ แล้วเช็คว่าเคยส่งรูปนี้มาก่อนไหม ──
  const imageHash = createHash('sha256').update(slipBuffer).digest('hex');
  const hashRef = db.collection('_slipHashCache').doc(imageHash);

  async function respond(status, body) {
    try {
      await hashRef.set({
        status: body.success ? 'success' : 'failed',
        response: body,
        httpStatus: status,
        uid,
        cachedAt: Date.now(),
      });
    } catch (e) {
      console.error('hash cache write error:', e);
    }
    return res.status(status).json(body);
  }

  const hashSnap = await hashRef.get();
  if (hashSnap.exists) {
    const cached = hashSnap.data();
    const ageHours = (Date.now() - (cached.cachedAt || 0)) / (1000 * 60 * 60);
    if (ageHours < HASH_CACHE_HOURS) {
      if (cached.status === 'processing') {
        return res.status(409).json({
          error: 'already_processing',
          message: 'สลิปนี้กำลังถูกตรวจสอบอยู่ค่ะ กรุณารอสักครู่นะคะ'
        });
      }
      console.log('duplicate image hash, returning cached result:', imageHash);
      return res.status(cached.httpStatus || 400).json(cached.response);
    }
  }
  await hashRef.set({ status: 'processing', uid, cachedAt: Date.now() });

  // ── เรียก EasySlip API v2 ──
  let slipData;
  try {
    const formData = new FormData();
    const blob = new Blob([slipBuffer], { type: slipMime });
    formData.append('image', blob, 'slip.jpg');
    formData.append('checkDuplicate', 'true');

    const easyRes = await fetch('https://api.easyslip.com/v2/verify/bank', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EASYSLIP_API_KEY}`,
      },
      body: formData,
    });

    const easyData = await easyRes.json();
    console.log('EasySlip response:', JSON.stringify(easyData));

    if (!easyRes.ok || !easyData.success) {
      const code = easyData?.error?.code;
      if (code === 'SLIP_PENDING') {
        return respond(400, {
          error: 'slip_pending',
          message: 'สลิปธนาคารกรุงเทพที่เพิ่งโอนอาจยังตรวจสอบไม่ได้ค่ะ กรุณารอสักครู่แล้วลองใหม่นะคะ'
        });
      }
      if (code === 'SLIP_NOT_FOUND') {
        return respond(400, {
          error: 'slip_not_found',
          message: 'ไม่พบ QR Code ในรูปสลิปค่ะ กรุณาถ่ายให้เห็น QR ชัดเจนแล้วลองใหม่นะคะ'
        });
      }
      return respond(400, {
        error: 'slip_invalid',
        message: 'ไม่สามารถตรวจสอบสลิปได้ค่ะ กรุณาลองใหม่หรือส่งสลิปที่ชัดขึ้นค่ะ'
      });
    }

    slipData = easyData.data?.rawSlip;
    if (!slipData) {
      return respond(400, { error: 'slip_invalid', message: 'อ่านข้อมูลสลิปไม่ได้ค่ะ กรุณาลองใหม่ค่ะ' });
    }

    if (easyData.data?.isDuplicate) {
      return respond(400, {
        error: 'slip_already_used',
        message: 'สลิปนี้ถูกใช้แล้วค่ะ กรุณาใช้สลิปใหม่ค่ะ'
      });
    }
  } catch (e) {
    console.error('EasySlip error:', e);
    await hashRef.delete().catch(() => {});
    return res.status(500).json({ error: 'easyslip_error', message: 'ระบบตรวจสอบขัดข้องค่ะ กรุณาลองใหม่ค่ะ' });
  }

  // ── ตรวจสอบ receiver account ──
  const receiverBankAcct = (slipData?.receiver?.account?.bank?.account || '').replace(/[-\sx]/gi, '');
  const receiverProxy = (slipData?.receiver?.account?.proxy?.account || '').replace(/[-\sx]/gi, '');
  const ourPhoneTail = OUR_PHONE.slice(-4);

  const matchedByBank = receiverBankAcct && receiverBankAcct.endsWith(ourPhoneTail);
  const matchedByProxy = receiverProxy && receiverProxy.endsWith(ourPhoneTail);

  if (!matchedByBank && !matchedByProxy) {
    console.log('receiver mismatch, rawSlip.receiver:', JSON.stringify(slipData?.receiver));
    return respond(400, {
      error: 'wrong_receiver',
      message: 'สลิปนี้โอนเข้าบัญชีอื่นค่ะ กรุณาโอนผ่านพร้อมเพย์เบอร์ 081-534-1515 ค่ะ'
    });
  }

  // ── คำนวณเหรียญจากยอดโอนจริง ──
  const slipAmount = parseFloat(slipData?.amount?.amount || 0);
  const pkg = amountToCoins(slipAmount);
  if (!pkg) {
    return respond(400, {
      error: 'amount_too_low',
      message: `ยอดโอน ${slipAmount.toLocaleString()} ฿ น้อยเกินไปค่ะ ขั้นต่ำ 25 ฿ ค่ะ`
    });
  }

  // ── ตรวจสอบวันที่ (ไม่เกิน 2 ชั่วโมง) ──
  const slipDate = slipData?.date ? new Date(slipData.date) : null;
  if (slipDate) {
    const diffMs = Date.now() - slipDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours > 2) {
      return respond(400, {
        error: 'slip_expired',
        message: 'สลิปหมดอายุแล้วค่ะ กรุณาใช้สลิปที่โอนภายใน 2 ชั่วโมงค่ะ'
      });
    }
  }

  // ── ตรวจสอบ transRef ซ้ำ + เติมเหรียญ (Firestore Transaction) ──
  const transRef = slipData?.transRef;
  if (!transRef) {
    return respond(400, {
      error: 'no_transref',
      message: 'ไม่พบรหัสธุรกรรมในสลิปค่ะ กรุณาส่งสลิปที่ชัดขึ้นค่ะ'
    });
  }

  const slipRef = db.collection('used_slips').doc(transRef);
  const userRef = db.collection('users').doc(uid);
  const totalCoins = pkg.total;
  const tierKey = pkgTierKey(slipAmount);
  // ── stats/summary: เอกสารสรุปยอดรวมทั้งหมด อ่านครั้งเดียวพอสำหรับ admin dashboard
  //    แทนการสแกน topup_history ทั้งคอลเลกชันทุกครั้งที่ดูหน้าแอดมิน ──
  const statsRef = db.collection('stats').doc('summary');

  try {
    await db.runTransaction(async (t) => {
      const slipSnap = await t.get(slipRef);
      if (slipSnap.exists) {
        throw new Error('SLIP_USED');
      }

      t.set(slipRef, {
        uid,
        transRef,
        amount: slipAmount,
        coinsAdded: totalCoins,
        usedAt: new Date(),
        slipDate: slipDate || null,
      });

      t.set(userRef, {
        coins: FieldValue.increment(totalCoins),
        lastActive: new Date(),
      }, { merge: true });

      t.set(db.collection('topup_history').doc(), {
        uid,
        transRef,
        coins: pkg.coins,
        bonus: pkg.bonus,
        totalCoins,
        amount: slipAmount,
        createdAt: new Date(),
      });

      // อัปเดต counter สรุปยอดรวม (ใช้แสดงใน admin dashboard แบบอ่านครั้งเดียว)
      t.set(statsRef, {
        totalRevenue: FieldValue.increment(slipAmount),
        totalCoinsSold: FieldValue.increment(totalCoins),
        totalTx: FieldValue.increment(1),
        [tierKey]: FieldValue.increment(1),
      }, { merge: true });
    });

    const updatedSnap = await userRef.get();
    const newCoins = updatedSnap.data()?.coins || totalCoins;

    return respond(200, {
      success: true,
      newCoins,
      coinsAdded: totalCoins,
      message: `เติมเหรียญสำเร็จค่ะ ได้รับ 🪙 ${totalCoins.toLocaleString()} เหรียญค่ะ`
    });

  } catch (e) {
    if (e.message === 'SLIP_USED') {
      return respond(400, {
        error: 'slip_already_used',
        message: 'สลิปนี้ถูกใช้แล้วค่ะ กรุณาใช้สลิปใหม่ค่ะ'
      });
    }
    console.error('Transaction error:', e);
    await hashRef.delete().catch(() => {});
    return res.status(500).json({ error: 'transaction_failed', message: 'เกิดข้อผิดพลาดค่ะ กรุณาลองใหม่ค่ะ' });
  }
}

// ── Parse multipart/form-data ──
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('error', reject);
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || '';
        const boundary = contentType.split('boundary=')[1];
        if (!boundary) return reject(new Error('no boundary'));

        const fields = {};
        let slipBuf = null;
        let mime = 'image/jpeg';

        const parts = body.toString('binary').split('--' + boundary);
        for (const part of parts) {
          if (!part.includes('Content-Disposition')) continue;
          const [header, ...bodyParts] = part.split('\r\n\r\n');
          const bodyStr = bodyParts.join('\r\n\r\n').replace(/\r\n$/, '');

          const nameMatch = header.match(/name="([^"]+)"/);
          const fileMatch = header.match(/filename="([^"]+)"/);
          const mimeMatch = header.match(/Content-Type:\s*([^\r\n]+)/);

          if (!nameMatch) continue;
          const name = nameMatch[1];

          if (fileMatch) {
            mime = mimeMatch ? mimeMatch[1].trim() : 'image/jpeg';
            slipBuf = Buffer.from(bodyStr, 'binary');
          } else {
            fields[name] = bodyStr;
          }
        }

        resolve({ fields, slipBuf, mime });
      } catch (e) {
        reject(e);
      }
    });
  });
}