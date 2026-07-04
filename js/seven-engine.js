// seven-engine.js
// คำนวณเลข 7 ตัว 9 ฐาน โหราศาสตร์ไทย
// ต้องโหลด thai-lunar.js ก่อนค่ะ

// ─── ค่าคงที่ ───
var DAY_NUM = {
  0: 1, // อาทิตย์
  1: 2, // จันทร์
  2: 3, // อังคาร
  3: 4, // พุธ
  4: 5, // พฤหัส
  5: 6, // ศุกร์
  6: 7  // เสาร์
};

var DAY_NAME = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
var PLANET_NAME = ['','อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];

var NAKSAT = [
  '', 'ชวด','ฉลู','ขาล','เถาะ','มะโรง','มะเส็ง',
  'มะเมีย','มะแม','วอก','ระกา','จอ','กุน'
];

// ชื่อภพ 7 ตำแหน่ง
var PHOP_NAMES = [
  'อัตตะ','หินะ','ธนัง','ปัตตา','มาตา','โภคา','มัชฌิมา'
];

// ─── helper ───
function mod7(n) {
  while (n > 7) n -= 7;
  while (n < 1) n += 7;
  return n;
}

// ─── ปีนักษัตร ───
// เปลี่ยนปีนักษัตรที่ขึ้น 1 ค่ำ เดือน 5
// ถ้าเดือนจันทรคติ < 5 ถือว่าเป็นปีนักษัตรเดิม
function getNaksat(yearAD, lunarMonth) {
  // ปี พ.ศ. = yearAD + 543
  var be = yearAD + 543;
  // ถ้าเดือนจันทรคติ < 5 ให้ถือเป็นปีก่อนหน้า
  if (lunarMonth < 5) be -= 1;
  // ปีชวด = พ.ศ. ที่หาร 12 เหลือ 4 (2500=ชวด)
  // 2500 mod 12 = 4 → ชวด=1
  var n = ((be - 2500) % 12 + 12) % 12;
  // 2500=ชวด(1), 2501=ฉลู(2)...
  return (n % 12) + 1; // 1-12
}

// ─── MAIN: คำนวณ 9 ฐาน ───
function calcSevenBase(dateStr, hour) {
  // dateStr = 'YYYY-MM-DD', hour = 0-23
  // ถ้าเกิดก่อน 06.00 น. ถือเป็นวันก่อนหน้า
  var d = new Date(dateStr + 'T00:00:00');
  if (hour !== undefined && hour < 6) {
    d.setDate(d.getDate() - 1);
    dateStr = d.toISOString().slice(0,10);
  }

  // วันในสัปดาห์ (0=อาทิตย์)
  var jsDay = new Date(dateStr + 'T12:00:00').getDay();
  var dayNum = DAY_NUM[jsDay]; // 1-7

  // จันทรคติ
  var lunar = getThaiLunarDate(dateStr);
  var lunarMonth = lunar.month; // 1-12
  var lunarDay = lunar.day;
  var lunarWaxing = lunar.waxing;

  // ปีนักษัตร
  var yearAD = parseInt(dateStr.slice(0,4));
  var nakIdx = getNaksat(yearAD, lunarMonth);

  // ─── ฐาน 1: วัน เรียงไป 7 ช่อง ───
  var base1 = [];
  for (var i = 0; i < 7; i++) base1.push(mod7(dayNum + i));

  // ─── ฐาน 2: เดือน (เดือน 8-12 ลบ 7 ก่อน) ───
  var monthNum = lunarMonth > 7 ? lunarMonth - 7 : lunarMonth;
  var base2 = [];
  for (var i = 0; i < 7; i++) base2.push(mod7(monthNum + i));

  // ─── ฐาน 3: ปีนักษัตร ───
  var base3 = [];
  for (var i = 0; i < 7; i++) base3.push(mod7(nakIdx + i));

  // ─── ฐาน 4: ผลรวม 1+2+3 แต่ละช่อง ───
  var base4 = [];
  for (var i = 0; i < 7; i++) base4.push(base1[i] + base2[i] + base3[i]);

  // ─── ฐาน 5: ลบ 7 จนเหลือ ≤ 7 ───
  var base5 = base4.map(function(n) { return mod7(n); });

  // ─── ฐาน 6: ฐาน5 × 2 ลบ 7 ───
  var base6 = base5.map(function(n) { return mod7(n * 2); });

  // ─── ฐาน 7: ฐาน6 × 2 ลบ 7 ───
  var base7 = base6.map(function(n) { return mod7(n * 2); });

  // ─── ฐาน 8: เลขแรกของฐาน 5 เดินตามฐาน 7 ───
  var first5 = base5[0];
  var base8 = [];
  for (var i = 0; i < 7; i++) {
    base8.push(mod7(first5 + (base7[i] - base7[0])));
  }
  // วิธีที่ถูกต้อง: เอา first5 แล้วเดินตาม pattern ของ base7
  // base7[0]=2 base7[1]=7 → diff=+5 → base8[1] = first5+5
  base8 = [];
  var startDiff = base7[0];
  for (var i = 0; i < 7; i++) {
    var diff = base7[i] - startDiff;
    base8.push(mod7(first5 + diff));
  }

  // ─── ฐาน 9: ตัวสุดท้ายของฐาน5 + ตัวสุดท้ายของฐาน8 เดินย้อนหลังตามฐาน7 ───
  var last5 = base5[6];
  var last8 = base8[6];
  var lastSum = mod7(last5 + last8);
  // เดินย้อนหลังตามฐาน 7 จากขวาไปซ้าย
  var base9 = new Array(7);
  base9[6] = lastSum;
  for (var i = 5; i >= 0; i--) {
    var diff7 = base7[i] - base7[i+1];
    base9[i] = mod7(base9[i+1] + diff7);
  }

  return {
    dateStr: dateStr,
    dayNum: dayNum,
    dayName: DAY_NAME[jsDay],
    lunarMonth: lunarMonth,
    lunarDay: lunarDay,
    lunarWaxing: lunarWaxing,
    lunarText: lunar.text,
    nakIdx: nakIdx,
    nakName: NAKSAT[nakIdx],
    yearBE: yearAD + 543,
    bases: [base1, base2, base3, base4, base5, base6, base7, base8, base9]
  };
}
