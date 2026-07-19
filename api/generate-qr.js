// api/generate-qr.js
// สร้าง QR พร้อมเพย์ที่ถูกต้องตามมาตรฐาน EMVCo เอง แทนที่จะพึ่งบริการภายนอกอย่าง promptpay.io
// ใช้ promptpay-qr สร้าง payload ตามสเปกจริง + qrcode วาดออกมาเป็นรูปภาพ

import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

const ALLOWED_ORIGIN = 'https://www.mytarot.vip';
const OUR_PHONE = '0815341515'; // เบอร์พร้อมเพย์ผู้รับเงิน

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const amount = parseFloat(req.query.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'invalid_amount', message: 'จำนวนเงินไม่ถูกต้องค่ะ' });
  }

  try {
    // สร้าง payload text ตามมาตรฐาน EMVCo QR พร้อมเพย์ (คำนวณ checksum ให้ถูกต้องอัตโนมัติ)
    const payload = generatePayload(OUR_PHONE, { amount });

    // วาด payload เป็นภาพ QR แบบ PNG
    const pngBuffer = await QRCode.toBuffer(payload, {
      type: 'png',
      width: 400,
      margin: 1,
      errorCorrectionLevel: 'M',
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store'); // ไม่แคช เพราะยอดเงินเปลี่ยนได้ทุกครั้ง
    return res.status(200).send(pngBuffer);
  } catch (e) {
    console.error('generate-qr error:', e);
    return res.status(500).json({ error: 'qr_generation_failed', message: 'สร้าง QR ไม่สำเร็จค่ะ กรุณาลองใหม่ค่ะ' });
  }
}