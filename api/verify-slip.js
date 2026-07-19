// api/verify-slip.js
// ตรวจสอบสลิปด้วย EasySlip API แล้วเติมเหรียญใน Firestore
// ป้องกัน: สลิปปลอม, สลิปซ้ำ, โอนเข้าบัญชีอื่น, race condition

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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

export const config = {
  api: { bodyParser: false }, // ต้องปิด bodyParser เพราะรับ multipart/form-data
};

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// ── ข้อมูลบัญชีเรา ──
const OUR_ACCOUNT = '0213690248'; // เลขบัญชี KBank ไม่มี dash

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

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

  // ── เรียก EasySlip API ──
  let slipData;
  try {
    const formData = new FormData();
    const blob = new Blob([slipBuffer], { type: slipMime });
    formData.append('files', blob, 'slip.jpg');

    const easyRes = await fetch('https://api.easyslip.app/api/v1/verification', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EASYSLIP_API_KEY}`,
      },
      body: formData,
    });

    const easyData = await easyRes.json();
    console.log('EasySlip response:', JSON.stringify(easyData));

    if (!easyRes.ok || easyData.status !== 200) {
      return res.status(400).json({
        error: 'slip_invalid',
        message: 'ไม่สามารถตรวจสอบสลิปได้ค่ะ กรุณาลองใหม่หรือส่งสลิปที่ชัดขึ้นค่ะ'
      });
    }

    slipData = easyData.data;
  } catch (e) {
    console.error('EasySlip error:', e);
    return res.status(500).json({ error: 'easyslip_error', message: 'ระบบตรวจสอบขัดข้องค่ะ กรุณาลองใหม่ค่ะ' });
  }

  // ── ตรวจสอบ receiver account ──
  const receiverAcct = (slipData?.receiver?.account?.value || '').replace(/[-\s]/g, '');
  if (!receiverAcct.includes(OUR_ACCOUNT.slice(-8))) {
    return res.status(400).json({
      error: 'wrong_receiver',
      message: 'สลิปนี้โอนเข้าบัญชีอื่นค่ะ กรุณาโอนเข้าบัญชีกสิกรไทย 021-369024-8 ค่ะ'
    });
  }

  // ── คำนวณเหรียญจากยอดโอนจริง ──
  const slipAmount = parseFloat(slipData?.amount?.amount || 0);
  const pkg = amountToCoins(slipAmount);
  if (!pkg) {
    return res.status(400).json({
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
      return res.status(400).json({
        error: 'slip_expired',
        message: 'สลิปหมดอายุแล้วค่ะ กรุณาใช้สลิปที่โอนภายใน 2 ชั่วโมงค่ะ'
      });
    }
  }

  // ── ตรวจสอบ transRef ซ้ำ + เติมเหรียญ (Firestore Transaction) ──
  const transRef = slipData?.transRef || slipData?.transactionId || slipData?.ref;
  if (!transRef) {
    return res.status(400).json({
      error: 'no_transref',
      message: 'ไม่พบรหัสธุรกรรมในสลิปค่ะ กรุณาส่งสลิปที่ชัดขึ้นค่ะ'
    });
  }

  const db = getFirestore();
  const slipRef = db.collection('used_slips').doc(transRef);
  const userRef = db.collection('users').doc(uid);
  const totalCoins = pkg.total;

  try {
    let newCoins;
    await db.runTransaction(async (t) => {
      // เช็คสลิปซ้ำ
      const slipSnap = await t.get(slipRef);
      if (slipSnap.exists) {
        throw new Error('SLIP_USED');
      }

      // อ่าน coins ปัจจุบัน
      const userSnap = await t.get(userRef);
      const currentCoins = userSnap.exists ? (userSnap.data().coins || 0) : 0;
      newCoins = currentCoins + totalCoins;

      // เขียน atomic
      t.set(slipRef, {
        uid,
        transRef,
        amount: slipAmount,
        pkgId,
        coinsAdded: totalCoins,
        usedAt: new Date(),
        slipDate: slipDate || null,
      });

      t.set(userRef, {
        coins: FieldValue.increment(totalCoins),
      }, { merge: true });

      // บันทึก history
      t.set(db.collection('topup_history').doc(), {
        uid,
        transRef,
        coins: pkg.coins,
        bonus: pkg.bonus,
        totalCoins,
        amount: slipAmount,
        createdAt: new Date(),
      });
    });

    // อ่าน coins ล่าสุดหลัง transaction
    const updatedSnap = await userRef.get();
    newCoins = updatedSnap.data()?.coins || totalCoins;

    return res.status(200).json({
      success: true,
      newCoins,
      coinsAdded: totalCoins,
      message: `เติมเหรียญสำเร็จค่ะ ได้รับ 🪙 ${totalCoins.toLocaleString()} เหรียญค่ะ`
    });

  } catch (e) {
    if (e.message === 'SLIP_USED') {
      return res.status(400).json({
        error: 'slip_already_used',
        message: 'สลิปนี้ถูกใช้แล้วค่ะ กรุณาใช้สลิปใหม่ค่ะ'
      });
    }
    console.error('Transaction error:', e);
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
            // ไฟล์ slip
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