// soulmate-data.js — ระบบทำนายอายุเจอเนื้อคู่ ผสมศาสตร์ไทย (วันเกิด) + เวทิก (ลัคนา/เรือนที่7/ทศา)
// ต้องโหลด astronomy.browser.min.js และ moon-engine.js ก่อน (ใช้ getLahiriAyanamsa, getJD, getMoonSign, SIGNS_TH, NAKSHATRA_NAMES)

// ═══════════════════════════════════════════
// ส่วนที่ 0: รายชื่อจังหวัดไทย + พิกัด (สำหรับคำนวณลัคนา)
// ═══════════════════════════════════════════
var THAI_PROVINCES = [
  {name:'กรุงเทพมหานคร',lat:13.7563,lng:100.5018},{name:'กระบี่',lat:8.0863,lng:98.9063},
  {name:'กาญจนบุรี',lat:14.0227,lng:99.5328},{name:'กาฬสินธุ์',lat:16.4315,lng:103.5060},
  {name:'กำแพงเพชร',lat:16.4828,lng:99.5226},{name:'ขอนแก่น',lat:16.4419,lng:102.8360},
  {name:'จันทบุรี',lat:12.6113,lng:102.1039},{name:'ฉะเชิงเทรา',lat:13.6904,lng:101.0779},
  {name:'ชลบุรี',lat:13.3611,lng:100.9847},{name:'ชัยนาท',lat:15.1851,lng:100.1251},
  {name:'ชัยภูมิ',lat:15.8069,lng:102.0313},{name:'ชุมพร',lat:10.4930,lng:99.1800},
  {name:'เชียงราย',lat:19.9105,lng:99.8406},{name:'เชียงใหม่',lat:18.7883,lng:98.9853},
  {name:'ตรัง',lat:7.5645,lng:99.6240},{name:'ตราด',lat:12.2428,lng:102.5178},
  {name:'ตาก',lat:16.8698,lng:99.1256},{name:'นครนายก',lat:14.2069,lng:101.2130},
  {name:'นครปฐม',lat:13.8199,lng:100.0621},{name:'นครพนม',lat:17.4033,lng:104.7693},
  {name:'นครราชสีมา',lat:14.9799,lng:102.0977},{name:'นครศรีธรรมราช',lat:8.4325,lng:99.9598},
  {name:'นครสวรรค์',lat:15.7047,lng:100.1372},{name:'นนทบุรี',lat:13.8621,lng:100.5144},
  {name:'นราธิวาส',lat:6.4264,lng:101.8230},{name:'น่าน',lat:18.7756,lng:100.7730},
  {name:'บึงกาฬ',lat:18.3609,lng:103.6465},{name:'บุรีรัมย์',lat:14.9950,lng:103.1029},
  {name:'ปทุมธานี',lat:14.0208,lng:100.5250},{name:'ประจวบคีรีขันธ์',lat:11.8126,lng:99.7957},
  {name:'ปราจีนบุรี',lat:14.0509,lng:101.3720},{name:'ปัตตานี',lat:6.8693,lng:101.2500},{name:'พะเยา',lat:19.1664,lng:99.9017},
  {name:'พระนครศรีอยุธยา',lat:14.3532,lng:100.5680},{name:'พังงา',lat:8.4510,lng:98.5310},
  {name:'พัทลุง',lat:7.6167,lng:100.0740},{name:'พิจิตร',lat:16.4429,lng:100.3487},
  {name:'พิษณุโลก',lat:16.8211,lng:100.2659},{name:'เพชรบุรี',lat:13.1119,lng:99.9398},
  {name:'เพชรบูรณ์',lat:16.4192,lng:101.1591},{name:'แพร่',lat:18.1445,lng:100.1405},
  {name:'ภูเก็ต',lat:7.8804,lng:98.3923},{name:'มหาสารคาม',lat:16.1852,lng:103.3006},
  {name:'มุกดาหาร',lat:16.5453,lng:104.7237},{name:'แม่ฮ่องสอน',lat:19.3020,lng:97.9654},
  {name:'ยโสธร',lat:15.7922,lng:104.1451},{name:'ยะลา',lat:6.5411,lng:101.2800},
  {name:'ร้อยเอ็ด',lat:16.0538,lng:103.6520},{name:'ระนอง',lat:9.9528,lng:98.6084},
  {name:'ระยอง',lat:12.6813,lng:101.2816},{name:'ราชบุรี',lat:13.5282,lng:99.8134},
  {name:'ลพบุรี',lat:14.7995,lng:100.6534},{name:'ลำปาง',lat:18.2888,lng:99.4909},
  {name:'ลำพูน',lat:18.5747,lng:99.0087},{name:'เลย',lat:17.4860,lng:101.7220},
  {name:'ศรีสะเกษ',lat:15.1186,lng:104.3220},{name:'สกลนคร',lat:17.1545,lng:104.1348},
  {name:'สงขลา',lat:7.1897,lng:100.5950},{name:'สตูล',lat:6.6238,lng:100.0674},
  {name:'สมุทรปราการ',lat:13.5990,lng:100.5998},{name:'สมุทรสงคราม',lat:13.4098,lng:100.0022},
  {name:'สมุทรสาคร',lat:13.5475,lng:100.2740},{name:'สระแก้ว',lat:13.8241,lng:102.0645},
  {name:'สระบุรี',lat:14.5289,lng:100.9107},{name:'สิงห์บุรี',lat:14.8909,lng:100.3970},
  {name:'สุโขทัย',lat:17.0068,lng:99.8265},{name:'สุพรรณบุรี',lat:14.4744,lng:100.1177},
  {name:'สุราษฎร์ธานี',lat:9.1382,lng:99.3215},{name:'สุรินทร์',lat:14.8818,lng:103.4936},
  {name:'หนองคาย',lat:17.8783,lng:102.7420},{name:'หนองบัวลำภู',lat:17.2046,lng:102.4260},
  {name:'อ่างทอง',lat:14.5896,lng:100.4548},{name:'อำนาจเจริญ',lat:15.8656,lng:104.6259},
  {name:'อุดรธานี',lat:17.4139,lng:102.7859},{name:'อุตรดิตถ์',lat:17.6200,lng:100.0990},
  {name:'อุทัยธานี',lat:15.3835,lng:100.0248},{name:'อุบลราชธานี',lat:15.2287,lng:104.8564}
];


// ที่มา: ตำราทำนายเนื้อคู่จากวันเกิดแบบไทยโบราณ (สรุปเฉพาะช่วงอายุ+ผลลัพธ์ เขียนใหม่ด้วยคำพูดตัวเอง)
var THAI_DAY_MARRIAGE = {
  0: { // อาทิตย์
    male:   [{ age:'21-27 ปี', quality:'good', note:'ช่วงที่ดวงสมพงศ์เอื้ออำนวยมาก มักได้เนื้อคู่ที่เหมาะสมและราบรื่นค่ะ' }],
    female: [{ age:'25-32 ปี', quality:'good', note:'ยิ่งอายุเข้าใกล้ช่วงนี้ยิ่งมีโอกาสเจอคู่ที่เหมาะสมกับดวงชะตามากขึ้นค่ะ' }]
  },
  1: { // จันทร์
    male:   [{ age:'24-29 ปี', quality:'bad', note:'ถ้าตัดสินใจเร็วเกินไปในช่วงนี้ อาจต้องระวังความไม่มั่นคงในชีวิตคู่ค่ะ' }],
    female: [{ age:'21-29 ปี', quality:'good', note:'มักมีโอกาสพบคู่ครองเข้ามาสม่ำเสมอในช่วงนี้ค่ะ' }]
  },
  2: { // อังคาร
    male:   [{ age:'22-26 ปี', quality:'mixed', note:'พอสร้างตัวได้ แต่ยังไม่ใช่ช่วงที่ดีที่สุดค่ะ' },
             { age:'30-36 ปี', quality:'mixed', note:'เป็นช่วงที่ดวงเข้มข้นกว่า อาจต้องแลกกับความเปลี่ยนแปลงครั้งใหญ่ในชีวิตค่ะ' }],
    female: [{ age:'27-32 ปี', quality:'good', note:'เป็นช่วงที่มีคุณภาพ ไม่ต้องกังวลเรื่องถูกทอดทิ้งหลังแต่งงานค่ะ' }]
  },
  3: { // พุธ
    male:   [{ age:'26-32 ปี', quality:'good', note:'เป็นช่วงวัยที่เหมาะสมกับการมีคู่ครองตามดวงชะตาค่ะ' }],
    female: [{ age:'18-23 ปี', quality:'mixed', note:'เกณฑ์แต่งงานเด่นชัด แต่ผลลัพธ์ขึ้นอยู่กับปีเกิดประกอบด้วยค่ะ' },
             { age:'27-28 ปี', quality:'good', note:'เป็นช่วงที่ส่งเสริมการสร้างฐานะร่วมกับคู่ครองได้ดีค่ะ' },
             { age:'31-35 ปี', quality:'good', note:'ช่วงที่เหมาะกับการตัดสินใจมีคู่ครองอย่างจริงจังค่ะ' }]
  },
  4: { // พฤหัสบดี
    male:   [{ age:'30-35 ปี', quality:'good', note:'เป็นช่วงที่จะได้ตั้งหลักฐานะและมีคู่ครองที่ดีเยี่ยมค่ะ' }],
    female: [{ age:'24-29 ปี', quality:'good', note:'เป็นโอกาสชีวิตคู่ที่เหมาะสมมากในช่วงนี้ค่ะ' }]
  },
  5: { // ศุกร์
    male:   [{ age:'23-37 ปี', quality:'mixed', note:'เป็นช่วงกว้างที่มีโอกาสมีคู่ แต่ช่วงที่ดีที่สุดจริงๆ อยู่ในช่วงหลังค่ะ' },
             { age:'31-36 ปี', quality:'good', note:'เป็นช่วงที่คุณภาพดีที่สุดสำหรับการมีคู่ครองค่ะ' }],
    female: [{ age:'19-27 ปี', quality:'good', note:'มักมีคนมาสนใจตั้งแต่อายุยังน้อยเนื่องจากมีเสน่ห์ดึงดูดค่ะ' }]
  },
  6: { // เสาร์
    male:   [{ age:'24-29 ปี', quality:'bad', note:'ถ้าแต่งงานเร็วเกินไปในช่วงนี้ เสี่ยงต่อความไม่มั่นคงของชีวิตคู่ค่ะ' },
             { age:'31-32 ปี', quality:'good', note:'เป็นช่วงที่ดวงชะตาพร้อมสมบูรณ์ที่สุดสำหรับชีวิตคู่ค่ะ' }],
    female: [{ age:'ไม่ระบุชัดเจนในตำรา', quality:'mixed', note:'ตำราไม่ได้ระบุช่วงอายุที่ชัดเจนสำหรับผู้หญิงวันเสาร์ แต่เน้นว่ามักพบรักแบบไม่คาดฝันและฉับพลันค่ะ' }]
  }
};
var THAI_DAY_NAMES = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];

// ═══════════════════════════════════════════
// ส่วนที่ 2: ราศีตะวันตก (Sun sign) — ใช้เป็น fallback ลัคนาถ้าไม่มีเวลาเกิด
// ═══════════════════════════════════════════
var WESTERN_SIGNS_TH = ['เมษ','พฤษภ','มิถุน','กรกฎ','สิงห์','กันย์','ตุลย์','พิจิก','ธนู','มกร','กุมภ์','มีน'];

function getSunSignIndex(month, day) {
  var cutoffs = [20,19,21,20,21,21,23,23,23,23,22,22]; // วันสุดท้ายของแต่ละราศีเดิม (วันตัดของราศีถัดไปเริ่ม)
  var starts  = [
    [3,21],[4,20],[5,21],[6,21],[7,23],[8,23],[9,23],[10,23],[11,22],[12,22],[1,20],[2,19]
  ]; // [เมษ..มีน] วันเริ่มต้นราศี (เดือน,วัน)
  // ใช้ตารางช่วงวันแบบมาตรฐานตะวันตก
  var ranges = [
    {sign:0, from:[3,21], to:[4,19]},   // เมษ
    {sign:1, from:[4,20], to:[5,20]},   // พฤษภ
    {sign:2, from:[5,21], to:[6,20]},   // มิถุน
    {sign:3, from:[6,21], to:[7,22]},   // กรกฎ
    {sign:4, from:[7,23], to:[8,22]},   // สิงห์
    {sign:5, from:[8,23], to:[9,22]},   // กันย์
    {sign:6, from:[9,23], to:[10,22]},  // ตุลย์
    {sign:7, from:[10,23], to:[11,21]}, // พิจิก
    {sign:8, from:[11,22], to:[12,21]}, // ธนู
    {sign:9, from:[12,22], to:[1,19]},  // มกร
    {sign:10, from:[1,20], to:[2,18]},  // กุมภ์
    {sign:11, from:[2,19], to:[3,20]}   // มีน
  ];
  for (var i=0;i<ranges.length;i++){
    var r = ranges[i];
    var afterFrom = (month>r.from[0]) || (month===r.from[0] && day>=r.from[1]);
    var beforeTo  = (month<r.to[0]) || (month===r.to[0] && day<=r.to[1]);
    if (r.from[0] > r.to[0]) { // ข้ามปี (มกร)
      if (afterFrom || beforeTo) return r.sign;
    } else {
      if (afterFrom && beforeTo) return r.sign;
    }
  }
  return 0;
}

// ═══════════════════════════════════════════
// ส่วนที่ 3: คำนวณลัคนา (Ascendant) จริงจากวันเวลา+พิกัดสถานที่เกิด
// ═══════════════════════════════════════════
function getAscendantSign(year, month, day, hour, minute, longitude, latitude) {
  // เวลาไทย UTC+7 → UTC
  var date = new Date(Date.UTC(year, month-1, day, hour-7, minute, 0));

  // Local Sidereal Time (องศา)
  var gstHours = Astronomy.SiderealTime(date); // Greenwich Sidereal Time (ชั่วโมง)
  var lstHours = gstHours + longitude/15;
  var lstDeg = ((lstHours * 15) % 360 + 360) % 360;

  var eps = 23.4393; // ความเอียงแกนโลกโดยประมาณ
  var lstRad = lstDeg * Math.PI/180;
  var latRad = latitude * Math.PI/180;
  var epsRad = eps * Math.PI/180;

  var yComp = -Math.cos(lstRad);
  var xComp = Math.sin(epsRad)*Math.tan(latRad) + Math.cos(epsRad)*Math.sin(lstRad);
  var ascRad = Math.atan2(yComp, xComp);
  var ascTropical = ((ascRad * 180/Math.PI) + 360) % 360;

  // แปลง tropical → sidereal (Lahiri) เพื่อใช้ระบบเวทิก
  var ayn = getLahiriAyanamsa(year, month, day);
  var ascSidereal = ((ascTropical - ayn) % 360 + 360) % 360;

  return Math.floor(ascSidereal / 30); // 0=เมษ ... 11=มีน
}

// ═══════════════════════════════════════════
// ส่วนที่ 4: เจ้าเรือนตามราศี (fixed ตามตำราคลาสสิก)
// ═══════════════════════════════════════════
var SIGN_LORDS = ['อังคาร','ศุกร์','พุธ','จันทร์','อาทิตย์','พุธ','ศุกร์','อังคาร','พฤหัสบดี','เสาร์','เสาร์','พฤหัสบดี'];

// ═══════════════════════════════════════════
// ส่วนที่ 5: ทศา (Vimshottari Dasha) — คำนวณจากนักษัตรจันทร์ตอนเกิดจริง
// ═══════════════════════════════════════════
var DASHA_ORDER = ['เกตุ','ศุกร์','อาทิตย์','จันทร์','อังคาร','ราหู','พฤหัสบดี','เสาร์','พุธ'];
var DASHA_YEARS = { 'เกตุ':7, 'ศุกร์':20, 'อาทิตย์':6, 'จันทร์':10, 'อังคาร':7, 'ราหู':18, 'พฤหัสบดี':16, 'เสาร์':19, 'พุธ':17 };

function calcVimshottariDasha(sidLonMoon, birthYear) {
  var nakshatraSpan = 360/27;
  var nakIdx = Math.min(Math.floor(sidLonMoon / nakshatraSpan), 26); // 0-26
  var startLordIdx = nakIdx % 9;
  var startLord = DASHA_ORDER[startLordIdx];

  var posInNak = sidLonMoon % nakshatraSpan;
  var elapsedFraction = posInNak / nakshatraSpan;
  var remainingFraction = 1 - elapsedFraction;
  var firstDashaYears = DASHA_YEARS[startLord] * remainingFraction;

  var periods = [];
  var ageStart = 0;
  var ageEnd = firstDashaYears;
  periods.push({ lord: startLord, ageStart: ageStart, ageEnd: ageEnd, yearStart: birthYear, yearEnd: birthYear + ageEnd });

  var curIdx = startLordIdx;
  ageStart = ageEnd;
  for (var i=0;i<8;i++){ // ต่อไปอีก 8 ทศา (ครบเกือบชั่วชีวิต ~120 ปี)
    curIdx = (curIdx+1) % 9;
    var lord = DASHA_ORDER[curIdx];
    ageEnd = ageStart + DASHA_YEARS[lord];
    periods.push({ lord: lord, ageStart: ageStart, ageEnd: ageEnd, yearStart: birthYear+ageStart, yearEnd: birthYear+ageEnd });
    ageStart = ageEnd;
  }
  return periods;
}

// ═══════════════════════════════════════════
// ส่วนที่ 6: รวมทุกอย่าง — หาช่วงอายุที่ทศาเอื้อต่อการแต่งงาน
// ═══════════════════════════════════════════
// เกณฑ์: ทศาที่ตรงกับ (เจ้าเรือนที่7) หรือ ศุกร์ หรือ พฤหัสบดี (ตัวแทนความรัก/คู่ครองสากล) ถือว่าเอื้อต่อการแต่งงาน
function findMarriageFavorableDashas(dashaPeriods, seventhLord) {
  var favorableLords = [seventhLord, 'ศุกร์', 'พฤหัสบดี'];
  return dashaPeriods.filter(function(p){
    return favorableLords.indexOf(p.lord) >= 0 && p.ageStart < 60; // สนใจแค่ช่วงวัยที่สมเหตุสมผลสำหรับการแต่งงาน
  });
}

function calcSoulmatePrediction(input) {
  // input: { day, month, year, hour, minute, hasTime, longitude, latitude, gender }
  var result = {};

  // 1) ระบบวันเกิดไทย
  var dateObj = new Date(input.year, input.month-1, input.day);
  var dayOfWeek = dateObj.getDay(); // 0=อาทิตย์
  result.dayOfWeek = THAI_DAY_NAMES[dayOfWeek];
  result.thaiDayData = THAI_DAY_MARRIAGE[dayOfWeek][input.gender === 'male' ? 'male' : 'female'];

  // 2) ลัคนา (เวทิก)
  var lagnaSign;
  if (input.hasTime && input.longitude != null && input.latitude != null) {
    lagnaSign = getAscendantSign(input.year, input.month, input.day, input.hour, input.minute, input.longitude, input.latitude);
    result.lagnaSource = 'คำนวณจากเวลาและสถานที่เกิดจริง';
  } else {
    lagnaSign = getSunSignIndex(input.month, input.day);
    result.lagnaSource = 'ประมาณจากราศีเกิด (ไม่ทราบเวลาเกิดที่แม่นยำ)';
  }
  result.lagnaSign = WESTERN_SIGNS_TH[lagnaSign];

  // 3) เรือนที่ 7 + เจ้าเรือน
  var seventhSignIdx = (lagnaSign + 6) % 12;
  result.seventhSign = WESTERN_SIGNS_TH[seventhSignIdx];
  result.seventhLord = SIGN_LORDS[seventhSignIdx];

  // 4) ทศา (ต้องใช้ตำแหน่งจันทร์จริง)
  var hourForMoon = input.hasTime ? input.hour : 12;
  var minuteForMoon = input.hasTime ? input.minute : 0;
  var moonResult = getMoonSign(input.year, input.month, input.day, hourForMoon, minuteForMoon);
  result.moonNakshatra = moonResult.nakshatra.name;
  var dashaPeriods = calcVimshottariDasha(moonResult.lon, input.year);
  result.dashaPeriods = dashaPeriods;
  result.favorableDashas = findMarriageFavorableDashas(dashaPeriods, result.seventhLord);

  return result;
}
