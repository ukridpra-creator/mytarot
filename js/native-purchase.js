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

// แปล error message ดิบจาก Google Play Billing (มักเป็นภาษาอังกฤษ เช่น
// "USER_CANCELED", "This item is not purchased", "Item unavailable" ฯลฯ)
// ให้เป็นข้อความไทยที่เข้าใจง่าย ไม่ให้ raw error หลุดออกไปโชว์ผู้ใช้ตรงๆ
function translatePurchaseError(err) {
  const raw = (err && err.message) ? String(err.message) : String(err || '');
  const lower = raw.toLowerCase();

  if (lower.includes('cancel')) {
    return 'คุณได้ยกเลิกการทำรายการค่ะ';
  }
  if (lower.includes('already own') || lower.includes('already purchased') || lower.includes('item_already_owned')) {
    return 'คุณมีรายการนี้ค้างระบบอยู่แล้วค่ะ ลองปิดแอปแล้วเปิดใหม่ หากยังพบปัญหากรุณาติดต่อแอดมิน';
  }
  if (lower.includes('not purchased') || lower.includes('pending')) {
    return 'การชำระเงินยังไม่เสร็จสมบูรณ์ค่ะ กรุณาลองใหม่อีกครั้ง';
  }
  if (lower.includes('unavailable') || lower.includes('not found') || lower.includes('not_found') || lower.includes('item_unavailable')) {
    return 'แพ็กเกจนี้ยังไม่พร้อมจำหน่ายในขณะนี้ค่ะ กรุณาลองใหม่ภายหลังหรือเลือกแพ็กเกจอื่น';
  }
  if (lower.includes('network') || lower.includes('service_unavailable') || lower.includes('service unavailable')) {
    return 'เชื่อมต่อกับ Google Play ไม่สำเร็จค่ะ กรุณาตรวจสอบสัญญาณอินเทอร์เน็ตแล้วลองใหม่';
  }
  if (lower.includes('developer error') || lower.includes('developer_error')) {
    return 'เกิดข้อผิดพลาดจากระบบค่ะ กรุณาติดต่อทีมงาน';
  }

  // ไม่รู้จัก pattern ไหนเลย ก็ไม่โชว์ raw error ภาษาอังกฤษ ใช้ข้อความกลางแทน
  return 'ไม่สามารถซื้อเหรียญได้ค่ะ กรุณาลองใหม่อีกครั้ง';
}

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
  // (เหตุผลเดียวกับข้างบน — ไม่ import จาก npm package ตรงๆ)
  //
  // สำคัญ: purchaseProduct() คืนค่าเป็น Promise<Transaction> โดยตรง
  // (ยืนยันจาก node_modules/@capgo/native-purchases/dist/esm/definitions.d.ts บรรทัด 1033-1042)
  // ไม่ได้ห่อด้วย { transaction: ... } อีกชั้น — ต้องดึง purchaseToken จาก result ตรงๆ
  let result;
  try {
    result = await NativePurchases.purchaseProduct({
      productIdentifier,
      productType: 'inapp',
    });
  } catch (err) {
    // เก็บ raw error ไว้ดูใน console เผื่อ debug แต่ error ที่ throw ต่อไปต้องเป็นภาษาไทยเสมอ
    console.error('purchaseProduct raw error:', err);
    throw new Error(translatePurchaseError(err));
  }

  const purchaseToken = result?.purchaseToken;
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