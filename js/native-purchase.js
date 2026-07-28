// js/native-purchase.js
// ซื้อเหรียญผ่าน Google Play Billing (ใช้เฉพาะตอนรันในแอป Capacitor เท่านั้น)
//
// สำคัญ: ใช้ window.Capacitor.Plugins.NativePurchases แทนการ import
// '@capgo/native-purchases' ตรงๆ เพราะเว็บนี้เป็น static HTML ไม่มี bundler
// (import แบบ bare specifier จะพังทั้งหน้า เหมือนที่เคยเกิดกับ native-google-auth.js มาก่อน)

// map จาก pkgId เดิมของหน้า coins.html ไปยัง Product ID ที่ตั้งไว้ใน Google Play Console
// (ต้องสร้าง product ID เหล่านี้ใน Play Console ให้ตรงเป๊ะก่อนใช้งานจริง)
const PRODUCT_MAP = {
  '50':   'mytarot_coins_50',
  '100':  'mytarot_coins_100',
  '300':  'mytarot_coins_330',
  '500':  'mytarot_coins_575',
  '1000': 'mytarot_coins_1200',
  '2000': 'mytarot_coins_2500',
};

export async function nativePurchaseCoins(pkgId, idToken) {
  const productIdentifier = PRODUCT_MAP[pkgId];
  if (!productIdentifier) throw new Error('ไม่พบแพ็กเกจนี้ในระบบแอปค่ะ');

  const { NativePurchases } = window.Capacitor.Plugins;
  if (!NativePurchases) throw new Error('ระบบซื้อเหรียญยังไม่พร้อมใช้งานค่ะ กรุณาลองใหม่');

  // เช็คว่าเครื่องรองรับการซื้อผ่าน Google Play Billing ไหม
  const { isBillingSupported } = await NativePurchases.isBillingSupported();
  if (!isBillingSupported) throw new Error('อุปกรณ์นี้ไม่รองรับการซื้อผ่าน Google Play ค่ะ');

  // เปิดหน้าต่างซื้อของ Google Play
  // หมายเหตุ: ค่า productType ใช้ string 'inapp' ตรงๆ แทนการ import PURCHASE_TYPE enum
  // (เหตุผลเดียวกับข้างบน — ไม่ import จาก npm package ตรงๆ) ควรตรวจสอบค่าจริงจาก
  // node_modules/@capgo/native-purchases อีกครั้งก่อนใช้งานจริง เผื่อค่าคนละแบบ
  const result = await NativePurchases.purchaseProduct({
    productIdentifier,
    productType: 'inapp',
  });

  const purchaseToken = result?.transaction?.purchaseToken;
  if (!purchaseToken) throw new Error('ไม่สามารถทำรายการซื้อได้ค่ะ กรุณาลองใหม่');

  // ส่งไปตรวจสอบฝั่งเซิร์ฟเวอร์ผ่าน Google Play Developer API แล้วเติมเหรียญ
  const res = await fetch('/api/verify-google-purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + idToken,
    },
    body: JSON.stringify({ productId: productIdentifier, purchaseToken }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'ตรวจสอบการซื้อไม่สำเร็จค่ะ กรุณาลองใหม่');
  }

  return data; // { success, newCoins, coinsAdded, message }
}