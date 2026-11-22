/*!
 * thai-astro-engine.js — โหราศาสตร์ไทย คัมภีร์สุริยยาตร์ + มานัตต์
 *
 * คำนวณสมผุสดาว 10 ดวง ลัคนา (อันโตนาทีสามัญ อาทิตย์อุทัยจริง) นวางค์ ตรียางค์ ฤกษ์
 * เรือนชะตา มาตรฐานดาว และมุมสัมพันธ์ ทั้งดวงกำเนิดและดาวจร
 * ไม่มี dependency ไม่เรียก API ใช้ได้ทั้งในเบราว์เซอร์ (window.ThaiAstro) และ Node.js
 *
 * สอบเทียบกับ myhora.com (ปฏิทินโหราศาสตร์ไทย สุริยยาตร์, ลัคนาอันโตนาทีสามัญ
 * สมผุสอาทิตย์อุทัย) ดูชุดทดสอบใน thai-astro-engine.test.js
 *
 * สูตรสมผุสดาวเรียบเรียงตามไลบรารี suriyayatra (MIT License,
 * Copyright (c) 2026 Lucifer-911GT, https://github.com/Lucifer-911GT/suriyayatra)
 *
 * หน่วยภายใน: ลิปดา (arcminute) นับจาก 0° เมษ = 0 ถึง 21599
 * เวลาที่รับเข้า: เวลานาฬิกาไทย (UTC+7) ระบบลบ 18 นาทีให้เองเพื่อเข้ากรอบ
 * เวลาท้องถิ่นกรุงเทพฯ (UTC+06:42) ที่คัมภีร์ใช้
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ThaiAstro = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var FULL = 21600;
  var DAY = 1440;
  var HORAKHUN_JDN = 1954167;
  var LMT_SHIFT = 18; // เวลานาฬิกาไทย − เวลาท้องถิ่นกรุงเทพฯ (นาที)
  var BANGKOK = { lat: 13.752555, lon: 100.494066 };

  /** พิกัดอำเภอเมืองของ 77 จังหวัด [ชื่อ, ละติจูด, ลองจิจูด] ใช้คำนวณเวลาอาทิตย์อุทัย */
  var PROVINCES = [
    ["กรุงเทพมหานคร", 13.7526, 100.4941],
    ["กระบี่", 8.0863, 98.9063],
    ["กาญจนบุรี", 14.0228, 99.5328],
    ["กาฬสินธุ์", 16.4322, 103.5061],
    ["กำแพงเพชร", 16.4828, 99.5227],
    ["ขอนแก่น", 16.4419, 102.8360],
    ["จันทบุรี", 12.6113, 102.1039],
    ["ฉะเชิงเทรา", 13.6904, 101.0780],
    ["ชลบุรี", 13.3611, 100.9847],
    ["ชัยนาท", 15.1851, 100.1251],
    ["ชัยภูมิ", 15.8068, 102.0316],
    ["ชุมพร", 10.4930, 99.1800],
    ["เชียงราย", 19.9105, 99.8406],
    ["เชียงใหม่", 18.7883, 98.9853],
    ["ตรัง", 7.5563, 99.6114],
    ["ตราด", 12.2428, 102.5175],
    ["ตาก", 16.8840, 99.1258],
    ["นครนายก", 14.2069, 101.2131],
    ["นครปฐม", 13.8199, 100.0622],
    ["นครพนม", 17.3920, 104.7696],
    ["นครราชสีมา", 14.9799, 102.0978],
    ["นครศรีธรรมราช", 8.4304, 99.9631],
    ["นครสวรรค์", 15.7030, 100.1367],
    ["นนทบุรี", 13.8621, 100.5144],
    ["นราธิวาส", 6.4255, 101.8253],
    ["น่าน", 18.7756, 100.7730],
    ["บึงกาฬ", 18.3609, 103.6466],
    ["บุรีรัมย์", 14.9930, 103.1029],
    ["ปทุมธานี", 14.0208, 100.5250],
    ["ประจวบคีรีขันธ์", 11.8126, 99.7957],
    ["ปราจีนบุรี", 14.0509, 101.3727],
    ["ปัตตานี", 6.8696, 101.2501],
    ["พระนครศรีอยุธยา", 14.3532, 100.5689],
    ["พะเยา", 19.1664, 99.9019],
    ["พังงา", 8.4509, 98.5255],
    ["พัทลุง", 7.6167, 100.0740],
    ["พิจิตร", 16.4429, 100.3487],
    ["พิษณุโลก", 16.8211, 100.2659],
    ["เพชรบุรี", 13.1119, 99.9447],
    ["เพชรบูรณ์", 16.4190, 101.1591],
    ["แพร่", 18.1446, 100.1403],
    ["ภูเก็ต", 7.8804, 98.3923],
    ["มหาสารคาม", 16.1851, 103.3007],
    ["มุกดาหาร", 16.5425, 104.7235],
    ["แม่ฮ่องสอน", 19.3020, 97.9654],
    ["ยโสธร", 15.7921, 104.1453],
    ["ยะลา", 6.5411, 101.2804],
    ["ร้อยเอ็ด", 16.0538, 103.6520],
    ["ระนอง", 9.9658, 98.6348],
    ["ระยอง", 12.6814, 101.2816],
    ["ราชบุรี", 13.5283, 99.8134],
    ["ลพบุรี", 14.7995, 100.6534],
    ["ลำปาง", 18.2888, 99.4909],
    ["ลำพูน", 18.5745, 99.0087],
    ["เลย", 17.4860, 101.7223],
    ["ศรีสะเกษ", 15.1186, 104.3220],
    ["สกลนคร", 17.1546, 104.1348],
    ["สงขลา", 7.1898, 100.5954],
    ["สตูล", 6.6238, 100.0674],
    ["สมุทรปราการ", 13.5991, 100.5998],
    ["สมุทรสงคราม", 13.4098, 100.0023],
    ["สมุทรสาคร", 13.5475, 100.2744],
    ["สระแก้ว", 13.8240, 102.0646],
    ["สระบุรี", 14.5289, 100.9101],
    ["สิงห์บุรี", 14.8936, 100.3967],
    ["สุโขทัย", 17.0056, 99.8264],
    ["สุพรรณบุรี", 14.4745, 100.1177],
    ["สุราษฎร์ธานี", 9.1382, 99.3215],
    ["สุรินทร์", 14.8818, 103.4936],
    ["หนองคาย", 17.8783, 102.7420],
    ["หนองบัวลำภู", 17.2218, 102.4260],
    ["อ่างทอง", 14.5896, 100.4551],
    ["อำนาจเจริญ", 15.8657, 104.6258],
    ["อุดรธานี", 17.4138, 102.7872],
    ["อุตรดิตถ์", 17.6201, 100.0993],
    ["อุทัยธานี", 15.3835, 100.0246],
    ["อุบลราชธานี", 15.2287, 104.8564]
  ];

  function mod(a, n) { return ((a % n) + n) % n; }
  function fl(x) { return Math.floor(x); }

  // ── ปฏิทิน ────────────────────────────────────────────────────────────────

  /** Julian Day Number ของวันที่เกรกอเรียน (ปี ค.ศ.) */
  function toJdn(y, m, d) {
    var a = fl((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + fl((153 * mm + 2) / 5) + 365 * yy + fl(yy / 4) - fl(yy / 100) + fl(yy / 400) - 32045;
  }
  function fromJdn(j) {
    var a = j + 32044, b = fl((4 * a + 3) / 146097), c = a - fl((146097 * b) / 4);
    var d = fl((4 * c + 3) / 1461), e = c - fl((1461 * d) / 4), m = fl((5 * e + 2) / 153);
    return { year: 100 * b + d - 4800 + fl(m / 10), month: m + 3 - 12 * fl(m / 10), day: e - fl((153 * m + 2) / 5) + 1 };
  }

  /** รับ {year|be, month, day, hour, minute} → ปี ค.ศ. */
  function ceYear(input) {
    if (input.be != null) return input.be - 543;
    return input.year;
  }

  /** ขณะเวลาบนนาฬิกาคัมภีร์ (UTC+06:42) จากเวลานาฬิกาไทย */
  function momentOf(input) {
    var jdn = toJdn(ceYear(input), input.month, input.day);
    var minute = (input.hour || 0) * 60 + (input.minute || 0) - LMT_SHIFT;
    if (minute < 0) { jdn -= 1; minute += DAY; }
    return { jdn: jdn, minute: minute };
  }

  // ── สุริยยาตร์: อาทิตย์ จันทร์ ราหู เกตุ ───────────────────────────────────

  function totalKammacaphon(m) {
    return 800 * (m.jdn - HORAKHUN_JDN - 1) - 373 + fl((m.minute * 800) / DAY);
  }
  function meanSunRaw(K) {
    var k = mod(K, 292207), sign = fl(k / 24350), r = k - sign * 24350, deg = fl(r / 811);
    return (sign * 30 + deg) * 60 + fl((r - deg * 811) / 14) - 3;
  }
  function fold(x) {
    var a = mod(x, FULL), q = fl(a / 5400);
    return { arc: [a, 10800 - a, a - 10800, FULL - a][q], subtract: a < 10800 };
  }
  var SUN_EQ = [0, 35, 67, 94, 116, 129, 134];
  var MOON_EQ = [0, 77, 148, 209, 256, 286, 296];
  function equation(arc, t) {
    var i = fl(arc / 900);
    if (i >= 6) return t[6];
    return t[i] + fl(((arc - i * 900) * (t[i + 1] - t[i])) / 900);
  }
  function sunLongitude(m) {
    var mean = meanSunRaw(totalKammacaphon(m)), f = fold(mean - 4800), e = equation(f.arc, SUN_EQ);
    return mod(f.subtract ? mean - e : mean + e, FULL);
  }
  function moonLongitude(m) {
    var h = m.jdn - HORAKHUN_JDN - 1;
    var n = mod(h * 703 + 650 + fl((m.minute * 703) / DAY), 20760);
    var tithi = fl(n / 692), avoman = n - tithi * 692;
    var mean = tithi * 720 + avoman + fl(avoman / 25) - 40 + meanSunRaw(totalKammacaphon(m));
    var u = mod(h - 621, 3232);
    var apogee = fl(((u * DAY + m.minute) * FULL) / (3232 * DAY)) + 2;
    var f = fold(mean - apogee), e = equation(f.arc, MOON_EQ);
    return mod(f.subtract ? mean - e : mean + e, FULL);
  }
  function solarAccumulation(K) {
    return (fl(K / 292207) - 610) * FULL + meanSunRaw(K) - 23;
  }
  function rahuLongitude(m) {
    var S = solarAccumulation(totalKammacaphon(m));
    return mod(15150 - fl(S / 20) - fl(S / 265), FULL);
  }
  function ketuLongitude(m) {
    var c = mod(m.jdn - HORAKHUN_JDN - 1 - 344, 679);
    return mod(FULL - fl(((c * DAY + m.minute) * FULL) / (679 * DAY)), FULL);
  }

  // ── มานัตต์: อังคาร พุธ พฤหัสบดี ศุกร์ เสาร์ มฤตยู ─────────────────────────

  var SHADOW = [0, 244, 427, 488];
  function shadow(arc) {
    var i = fl(arc / 1800);
    if (i >= 3) return SHADOW[3];
    return SHADOW[i] + ((arc - i * 1800) * (SHADOW[i + 1] - SHADOW[i])) / 1800;
  }
  function quadrant(x) {
    var a = mod(x, FULL), q = fl(a / 5400);
    return { arc: [a, 10800 - a, a - 10800, FULL - a][q], dir: q < 2 ? -1 : 1, coDir: q === 0 || q === 3 ? 1 : -1 };
  }
  function twoCorrections(base, anchor, divisor, against, secondDivisor) {
    var p = quadrant(base - anchor);
    var num1 = fl(shadow(p.arc) * 60);
    var co1 = fl(shadow(5400 - p.arc) + 0.5);
    var d1 = divisor + fl(co1 / 2) * p.coDir;
    var first = base + fl((num1 * 60) / d1) * p.dir;
    var s = quadrant(mod(first, FULL) - against);
    var num2 = fl(shadow(s.arc) * 60);
    var co2 = fl(shadow(5400 - s.arc) + 0.5);
    var d2 = fl(fl(num2 / 60 + 0.5) / 3) + secondDivisor(d1) + co2 * s.coDir;
    return mod(first + fl((num2 * 60) / d2) * s.dir, FULL);
  }
  var OUTER = {
    mars: { mean: function (S) { return fl(S / 2) + fl((S * 16) / 505) + 5420; }, apogee: 7620, divisor: 2700, second: function (d) { return fl((d * 4) / 15); } },
    jupiter: { mean: function (S) { return fl(S / 12) + fl(S / 1032) + 14297; }, apogee: 10320, divisor: 5520, second: function (d) { return fl((d * 3) / 7); } },
    saturn: { mean: function (S) { return fl(S / 30) + fl((S * 6) / 10000) + 11944; }, apogee: 14820, divisor: 3780, second: function (d) { return fl((d * 7) / 6); } },
    uranus: { mean: function (S) { return fl(S / 84) + fl(S / 7224) + 16277; }, apogee: 7440, divisor: 38640, second: function (d) { return fl((d * 3) / 7); } }
  };
  var INNER = {
    mercury: { mean: function (S) { return fl((S * 7) / 46) + S * 4 + 10642; }, apogee: 13200, divisor: 6000, second: 21 * 60 },
    venus: { mean: function (S) { return fl((S * 5) / 3) - fl((S * 10) / 243) + 10944; }, apogee: 4800, divisor: 19200, second: 11 * 60 }
  };
  function planetLongitude(planet, m) {
    var K = totalKammacaphon(m), S = solarAccumulation(K), ravi = mod(meanSunRaw(K) - 23, FULL), p;
    if (INNER[planet]) {
      p = INNER[planet];
      return twoCorrections(ravi, p.apogee, p.divisor, mod(p.mean(S), FULL), function () { return p.second; });
    }
    p = OUTER[planet];
    return twoCorrections(mod(p.mean(S), FULL), p.apogee, p.divisor, ravi, p.second);
  }

  // ── ชื่อและตาราง ──────────────────────────────────────────────────────────

  /** ลำดับไทย: ๑ อาทิตย์ … ๙ เกตุ, ๐ มฤตยู */
  var BODIES = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu', 'uranus'];
  var BODY_TH = { lagna: 'ลัคนา', sun: 'อาทิตย์', moon: 'จันทร์', mars: 'อังคาร', mercury: 'พุธ', jupiter: 'พฤหัสบดี', venus: 'ศุกร์', saturn: 'เสาร์', rahu: 'ราหู', ketu: 'เกตุ', uranus: 'มฤตยู' };
  var BODY_NUM = { lagna: 'ลั', sun: '๑', moon: '๒', mars: '๓', mercury: '๔', jupiter: '๕', venus: '๖', saturn: '๗', rahu: '๘', ketu: '๙', uranus: '๐' };
  var SIGNS = ['เมษ', 'พฤษภ', 'มิถุน', 'กรกฎ', 'สิงห์', 'กันย์', 'ตุล', 'พิจิก', 'ธนู', 'มังกร', 'กุมภ์', 'มีน'];
  var HOUSES = ['ตนุ', 'กดุมภะ', 'สหัชชะ', 'พันธุ', 'ปุตตะ', 'อริ', 'ปัตนิ', 'มรณะ', 'ศุภะ', 'กัมมะ', 'ลาภะ', 'วินาศ'];
  /** ดาวเกษตรประจำราศี (กุมภ์ = ราหู ตามแบบไทย) */
  var SIGN_LORD = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'jupiter'];
  /** ราศีอุจจ์ของดาว */
  var EXALT = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6, rahu: 7 };
  var NAKSHATRA = ['อัศวินี', 'ภรณี', 'กฤติกา', 'โรหิณี', 'มฤคศิระ', 'อารทรา', 'ปุนัพสุ', 'ปุษยะ', 'อาศเลษา', 'มาฆะ', 'ปุพพผลคุนี', 'อุตรผลคุนี', 'หัสตะ', 'จิตรา', 'สวาติ', 'วิสาขะ', 'อนุราธะ', 'เชษฐา', 'มูละ', 'ปุรพาษาฒ', 'อุตราษาฒ', 'ศรวณะ', 'ธนิษฐา', 'ศตภิษัช', 'ปุรพภัทรบท', 'อุตรภัทรบท', 'เรวดี'];
  var NAK_GROUP = ['ทลิทโท', 'มหัทธโน', 'โจโร', 'ภูมิปาโล', 'เทศาตรี', 'เทวี', 'เพชฌฆาต', 'ราชา', 'สมโณ'];
  /** อันโตนาทีสามัญ (นาที) เมษ…มีน รวม 1440 */
  var RISING = [120, 96, 72, 120, 144, 168, 168, 144, 120, 72, 96, 120];
  /** มุมสัมพันธ์: ระยะราศี (นับตัวเองเป็น 1) → ชื่อมุม */
  var ASPECT = { 1: 'กุม', 3: 'โยค', 11: 'โยค', 4: 'ฉาก', 10: 'ฉาก', 5: 'ตรีโกณ', 9: 'ตรีโกณ', 7: 'เล็ง' };

  function longitudeOf(body, m) {
    switch (body) {
      case 'sun': return sunLongitude(m);
      case 'moon': return moonLongitude(m);
      case 'rahu': return rahuLongitude(m);
      case 'ketu': return ketuLongitude(m);
      default: return planetLongitude(body, m);
    }
  }

  /** แตกลิปดาเป็น ราศี/องศา/ลิปดา พร้อมนวางค์ ตรียางค์ ฤกษ์ */
  function describe(arcmin) {
    var l = mod(fl(arcmin), FULL), sign = fl(l / 1800), inSign = l - sign * 1800;
    var navIdx = fl(inSign / 200); // 0–8 (ช่วงละ 3°20')
    var navStart = [0, 9, 6, 3][sign % 4]; // ธาตุไฟ→เมษ ดิน→มังกร ลม→ตุล น้ำ→กรกฎ
    var navSign = (navStart + navIdx) % 12;
    var triIdx = fl(inSign / 600); // 0–2 (ช่วงละ 10°)
    var triSign = (sign + triIdx * 4) % 12;
    var nak = fl(l / 800); // 0–26 (ช่วงละ 13°20')
    return {
      longitude: l, sign: sign, signTh: SIGNS[sign], degree: fl(inSign / 60), minute: inSign % 60,
      text: SIGNS[sign] + ' ' + fl(inSign / 60) + '°' + ('0' + (inSign % 60)).slice(-2) + "'",
      navang: { order: navIdx + 1, sign: navSign, signTh: SIGNS[navSign], lord: SIGN_LORD[navSign] },
      triyang: { order: triIdx + 1, sign: triSign, signTh: SIGNS[triSign], lord: SIGN_LORD[triSign] },
      nakshatra: { order: nak + 1, name: NAKSHATRA[nak], group: NAK_GROUP[nak % 9] }
    };
  }

  /** มาตรฐานดาวพื้นฐาน: เกษตร อุจจ์ ประ นิจ */
  function dignity(body, sign) {
    var out = [];
    if (SIGN_LORD[sign] === body) out.push('เกษตร');
    if (EXALT[body] === sign) out.push('อุจจ์');
    if (SIGN_LORD[(sign + 6) % 12] === body) out.push('ประ');
    if (EXALT[body] != null && (EXALT[body] + 6) % 12 === sign) out.push('นิจ');
    return out;
  }

  /** สมผุสดาว 10 ดวง ณ วันเวลา (เวลานาฬิกาไทย) — ใช้ได้ทั้งดวงกำเนิดและดาวจร */
  function positions(input) {
    var m = momentOf(input), prev = { jdn: m.jdn - 1, minute: m.minute }, out = {};
    for (var i = 0; i < BODIES.length; i++) {
      var b = BODIES[i], lon = longitudeOf(b, m), p = describe(lon);
      p.body = b; p.name = BODY_TH[b]; p.num = BODY_NUM[b];
      p.dignity = dignity(b, p.sign);
      if (b !== 'sun' && b !== 'moon' && b !== 'rahu' && b !== 'ketu') {
        // พักร์: ตำแหน่งถอยหลังเมื่อเทียบกับ 24 ชั่วโมงก่อน
        p.retrograde = mod(lon - longitudeOf(b, prev) + 10800, FULL) - 10800 < 0;
      }
      out[b] = p;
    }
    return out;
  }

  // ── อาทิตย์อุทัย (ดาราศาสตร์จริง ตามพิกัด) ─────────────────────────────────

  /** เวลาอาทิตย์ขึ้น เป็นนาทีหลังเที่ยงคืนตามเวลานาฬิกา (ทศนิยม) */
  function sunriseMinutes(y, mo, d, lat, lon, tz) {
    if (tz == null) tz = 7;
    var rad = Math.PI / 180, jd0 = toJdn(y, mo, d) - 0.5 - tz / 24, t = 360;
    for (var i = 0; i < 3; i++) {
      var T = (jd0 + t / DAY - 2451545.0) / 36525;
      var L0 = mod(280.46646 + T * (36000.76983 + T * 0.0003032), 360);
      var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
      var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
      var Mr = M * rad;
      var C = Math.sin(Mr) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * Mr) * (0.019993 - 0.000101 * T) + Math.sin(3 * Mr) * 0.000289;
      var om = 125.04 - 1934.136 * T;
      var lam = L0 + C - 0.00569 - 0.00478 * Math.sin(om * rad);
      var e0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
      var ob = e0 + 0.00256 * Math.cos(om * rad);
      var dec = Math.asin(Math.sin(ob * rad) * Math.sin(lam * rad));
      var yv = Math.pow(Math.tan((ob / 2) * rad), 2), L0r = L0 * rad;
      var eq = (4 / rad) * (yv * Math.sin(2 * L0r) - 2 * e * Math.sin(Mr) + 4 * e * yv * Math.sin(Mr) * Math.cos(2 * L0r) - 0.5 * yv * yv * Math.sin(4 * L0r) - 1.25 * e * e * Math.sin(2 * Mr));
      var la = lat * rad;
      var ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(la) * Math.cos(dec)) - Math.tan(la) * Math.tan(dec)) / rad;
      t = 720 - 4 * (lon + ha) - eq + tz * 60;
    }
    return t;
  }

  // ── ลัคนา ─────────────────────────────────────────────────────────────────

  /**
   * ลัคนาอันโตนาทีสามัญ แบบ myhora: ตั้งต้นที่สมผุสอาทิตย์ ณ เวลาเกิด นับเวลาจาก
   * อาทิตย์อุทัยจริงของสถานที่เกิด (ปัดเป็นนาที) เกิดก่อนอุทัยนับจากอุทัยของวันก่อนหน้า
   */
  function lagna(input) {
    var y = ceYear(input), lat = input.lat != null ? input.lat : BANGKOK.lat, lon = input.lon != null ? input.lon : BANGKOK.lon;
    var mins = (input.hour || 0) * 60 + (input.minute || 0);
    var rise = Math.round(sunriseMinutes(y, input.month, input.day, lat, lon));
    var elapsed;
    if (mins < rise) {
      var p = fromJdn(toJdn(y, input.month, input.day) - 1);
      rise = Math.round(sunriseMinutes(p.year, p.month, p.day, lat, lon));
      elapsed = mins + DAY - rise;
    } else elapsed = mins - rise;
    var sun = sunLongitude(momentOf(input));
    var sign = fl(sun / 1800), inSign = sun - sign * 1800, t = elapsed;
    var left = ((1800 - inSign) / 1800) * RISING[sign];
    while (t >= left) { t -= left; sign = (sign + 1) % 12; inSign = 0; left = RISING[sign]; }
    var out = describe(sign * 1800 + inSign + (t / RISING[sign]) * 1800);
    out.body = 'lagna'; out.name = BODY_TH.lagna; out.num = BODY_NUM.lagna;
    out.sunrise = ('0' + fl(rise / 60)).slice(-2) + ':' + ('0' + (rise % 60)).slice(-2);
    // ชิดขอบราศีไม่เกิน 2 องศา: เวลาเกิดคลาดราว 5–10 นาทีอาจเปลี่ยนราศี
    var edge = Math.min(out.degree * 60 + out.minute, 1800 - (out.degree * 60 + out.minute));
    out.nearCusp = edge <= 120;
    return out;
  }

  // ── เรือนชะตาและมุมสัมพันธ์ ────────────────────────────────────────────────

  /** ภพของราศี เมื่อนับจากราศีลัคนา */
  function houseOf(sign, lagnaSign) { var i = mod(sign - lagnaSign, 12); return { order: i + 1, name: HOUSES[i] }; }

  /** มุมจากดาว a ไปดาว b (นับราศีของ a เป็น 1) คืน null ถ้าไม่ทำมุมหลัก */
  function aspectBetween(a, b) {
    var count = mod(b.sign - a.sign, 12) + 1, name = ASPECT[count];
    if (!name) return null;
    var orb = Math.abs((a.degree * 60 + a.minute) - (b.degree * 60 + b.minute));
    return { type: name, count: count, orb: orb }; // orb = ระยะห่างองศาในราศี (ลิปดา) ยิ่งน้อยยิ่งสนิท
  }

  /** ผังดวงกำเนิดครบชุด */
  function natalChart(input) {
    // ไม่ทราบเวลาเกิด: ใช้ตำแหน่งดาวตอนเที่ยงวัน และไม่ผูกลัคนา (จันทร์อาจคลาดได้ราว ±7°)
    var hasTime = input.hour != null, list = [], i, j;
    var pos = positions(hasTime ? input : { year: ceYear(input), month: input.month, day: input.day, hour: 12, minute: 0 });
    var lag = hasTime ? lagna(input) : null;
    if (lag) list.push(lag);
    for (i = 0; i < BODIES.length; i++) list.push(pos[BODIES[i]]);
    var houses = null;
    if (lag) {
      houses = [];
      for (i = 0; i < 12; i++) {
        var s = (lag.sign + i) % 12, inHouse = [];
        for (j = 0; j < list.length; j++) if (list[j].sign === s) inHouse.push(list[j].body);
        houses.push({ order: i + 1, name: HOUSES[i], sign: s, signTh: SIGNS[s], lord: SIGN_LORD[s], lordHouse: houseOf(pos[SIGN_LORD[s]].sign, lag.sign), bodies: inHouse });
      }
      for (j = 0; j < list.length; j++) list[j].house = houseOf(list[j].sign, lag.sign);
    }
    var aspects = [];
    for (i = 0; i < list.length; i++) for (j = i + 1; j < list.length; j++) {
      var a = aspectBetween(list[i], list[j]);
      if (a) aspects.push({ a: list[i].body, b: list[j].body, type: a.type, orb: a.orb });
    }
    return { input: input, lagna: lag, bodies: pos, houses: houses, aspects: aspects };
  }

  /** ดาวจร ณ วันเวลา เทียบกับดวงกำเนิด: ภพที่จรเข้า และมุมที่ทำกับดาวเดิม */
  function transitChart(natal, when) {
    var pos = positions(when), targets = [], i, j, out = [];
    if (natal.lagna) targets.push(natal.lagna);
    for (i = 0; i < BODIES.length; i++) targets.push(natal.bodies[BODIES[i]]);
    for (i = 0; i < BODIES.length; i++) {
      var t = pos[BODIES[i]], hits = [];
      for (j = 0; j < targets.length; j++) {
        var a = aspectBetween(t, targets[j]);
        if (a) hits.push({ natal: targets[j].body, type: a.type, orb: a.orb });
      }
      if (natal.lagna) t.house = houseOf(t.sign, natal.lagna.sign);
      t.aspects = hits;
      out.push(t);
    }
    return { when: when, bodies: pos, list: out };
  }

  /**
   * วันที่ดาวย้ายราศี ในช่วง days วันนับจากวันเริ่ม (ตรวจรายวัน ณ เที่ยงวัน)
   * คืน [{body, date:{year,month,day}, from, to}] — date คือวันแรกที่อยู่ราศีใหม่ตอนเที่ยง
   */
  function signChanges(body, start, days) {
    var j0 = toJdn(ceYear(start), start.month, start.day), out = [];
    var prev = fl(longitudeOf(body, { jdn: j0, minute: 720 - LMT_SHIFT }) / 1800);
    for (var k = 1; k <= days; k++) {
      var s = fl(longitudeOf(body, { jdn: j0 + k, minute: 720 - LMT_SHIFT }) / 1800);
      if (s !== prev) out.push({ body: body, date: fromJdn(j0 + k), from: prev, to: s, fromTh: SIGNS[prev], toTh: SIGNS[s] });
      prev = s;
    }
    return out;
  }

  return {
    BODIES: BODIES, BODY_TH: BODY_TH, BODY_NUM: BODY_NUM, SIGNS: SIGNS, HOUSES: HOUSES, SIGN_LORD: SIGN_LORD,
    NAKSHATRA: NAKSHATRA, NAK_GROUP: NAK_GROUP, RISING: RISING, BANGKOK: BANGKOK, PROVINCES: PROVINCES,
    positions: positions, lagna: lagna, natalChart: natalChart, transitChart: transitChart,
    signChanges: signChanges, sunriseMinutes: sunriseMinutes, describe: describe, dignity: dignity,
    houseOf: houseOf, aspectBetween: aspectBetween, toJdn: toJdn, fromJdn: fromJdn
  };
});
