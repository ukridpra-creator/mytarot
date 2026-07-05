// purple-star-engine.js v2
// ปรับสูตรให้กระจายดาวทั่วถึงกว่าค่ะ

var PALACES = [
  { id:0,  nameTH:'ชีวิต',       nameEN:'Life',      desc:'บุคลิก ตัวตน ร่างกายโดยรวม' },
  { id:1,  nameTH:'พี่น้อง',     nameEN:'Siblings',  desc:'ความสัมพันธ์กับพี่น้องและเพื่อนฝูง' },
  { id:2,  nameTH:'คู่ครอง',     nameEN:'Spouse',    desc:'ความรัก การแต่งงาน คู่ชีวิต' },
  { id:3,  nameTH:'บุตร',        nameEN:'Children',  desc:'บุตรหลาน ลูกศิษย์ คนรุ่นหลัง' },
  { id:4,  nameTH:'ทรัพย์สิน',  nameEN:'Wealth',    desc:'การเงิน รายได้ ทรัพย์สมบัติ' },
  { id:5,  nameTH:'การงาน',      nameEN:'Career',    desc:'อาชีพ ชื่อเสียง ความก้าวหน้า' },
  { id:6,  nameTH:'การเดินทาง', nameEN:'Travel',    desc:'การย้ายถิ่น ต่างประเทศ การเปลี่ยนแปลง' },
  { id:7,  nameTH:'มิตรสหาย',   nameEN:'Friends',   desc:'บริวาร ลูกน้อง ผู้ช่วยเหลือ' },
  { id:8,  nameTH:'บ้าน',        nameEN:'Property',  desc:'บ้านและที่ดิน อสังหาริมทรัพย์' },
  { id:9,  nameTH:'โชคลาภ',     nameEN:'Fortune',   desc:'บุญบารมี โชคลาภ ดวงลึกๆ' },
  { id:10, nameTH:'สุขภาพ',      nameEN:'Health',    desc:'ร่างกาย จิตใจ โรคภัย' },
  { id:11, nameTH:'บิดามารดา',   nameEN:'Parents',   desc:'พ่อแม่ ผู้ใหญ่ ครูอาจารย์' },
];

var MAIN_STARS = [
  { id:'ziwei',    nameTH:'ดาวจักรพรรดิ',   element:'earth', power:5,
    meaning:'ดาวบารมีสูงสุด มีความเป็นผู้นำ โดดเด่นและเป็นที่เคารพนับถือค่ะ' },
  { id:'tianji',   nameTH:'ดาวปัญญา',        element:'wood',  power:4,
    meaning:'ดาวสติปัญญาและกลยุทธ์ คิดเร็ว วางแผนเก่ง มีไหวพริบปฏิภาณดีค่ะ' },
  { id:'taiyang',  nameTH:'ดาวอาทิตย์',      element:'fire',  power:5,
    meaning:'ดาวชื่อเสียงและความสำเร็จ ส่องสว่างในสังคม เป็นที่ยอมรับค่ะ' },
  { id:'wuqu',     nameTH:'ดาวการเงิน',      element:'metal', power:4,
    meaning:'ดาวทรัพย์สมบัติและความมั่งคั่ง บริหารการเงินเก่ง มีความมุ่งมั่นค่ะ' },
  { id:'tiantong', nameTH:'ดาวสุขสันต์',     element:'water', power:3,
    meaning:'ดาวความสุขและความสงบสุข ชีวิตราบรื่น มีความสุขกับสิ่งรอบข้างค่ะ' },
  { id:'lianzhen', nameTH:'ดาวซื่อตรง',      element:'fire',  power:3,
    meaning:'ดาวความซื่อสัตย์และหลักการ มีความมุ่งมั่นแต่อาจดื้อรั้นบ้างค่ะ' },
  { id:'tianfu',   nameTH:'ดาวมั่งคั่ง',     element:'earth', power:4,
    meaning:'ดาวทรัพย์สินและความอุดมสมบูรณ์ มักมีฐานะดีและออมเงินเก่งค่ะ' },
  { id:'taiyin',   nameTH:'ดาวจันทร์',       element:'water', power:4,
    meaning:'ดาวความงามและความรัก มีเสน่ห์ อ่อนโยน ดวงรักและครอบครัวดีค่ะ' },
  { id:'tanlang',  nameTH:'ดาวเสน่ห์',       element:'wood',  power:3,
    meaning:'ดาวความต้องการและพรสวรรค์ ศิลปะ ดนตรี เสน่ห์ดึงดูดใจสูงค่ะ' },
  { id:'jumen',    nameTH:'ดาวสื่อสาร',      element:'water', power:3,
    meaning:'ดาวการพูดและการสื่อสาร พูดเก่ง โน้มน้าวใจเก่ง แต่ระวังคำพูดค่ะ' },
  { id:'tianxiang',nameTH:'ดาวผู้ช่วย',      element:'water', power:4,
    meaning:'ดาวการช่วยเหลือและเสียสละ มนุษยสัมพันธ์ดี มีคนช่วยเหลือเสมอค่ะ' },
  { id:'tianliang',nameTH:'ดาวผู้พิทักษ์',  element:'earth', power:4,
    meaning:'ดาวคุ้มครองและรักษา มีบุญบารมี ผ่านอุปสรรคได้เสมอค่ะ' },
  { id:'qisha',    nameTH:'ดาวนักรบ',        element:'metal', power:3,
    meaning:'ดาวความกล้าและการต่อสู้ มีพลังสูง เผชิญอุปสรรคได้แต่ต้องระวังค่ะ' },
  { id:'pojun',    nameTH:'ดาวเปลี่ยนแปลง', element:'water', power:3,
    meaning:'ดาวการเปลี่ยนแปลงและสร้างใหม่ ชีวิตพลิกผัน มักพบการเริ่มต้นใหม่ค่ะ' },
];

var SUPPORT_STARS = [
  { id:'zuofu',    nameTH:'ดาวผู้ช่วยซ้าย',   meaning:'เสริมบารมี มีผู้ช่วยเหลือจากทางซ้าย' },
  { id:'youbi',    nameTH:'ดาวผู้ช่วยขวา',    meaning:'เสริมกำลัง มีผู้สนับสนุนจากทางขวา' },
  { id:'wenqu',    nameTH:'ดาววรรณกรรม',      meaning:'พรสวรรค์ด้านศิลปะ การเขียน ดนตรี' },
  { id:'wenchang', nameTH:'ดาวการศึกษา',       meaning:'โชคดีด้านการเรียน การสอบ วิชาการ' },
  { id:'huagai',   nameTH:'ดาวฉลาด',           meaning:'มีความคิดสร้างสรรค์ ชอบความเป็นตัวเอง' },
];

// ─── คำนวณ Heavenly Stem จากปี ───
function getYearStem(year) {
  return ((year - 4) % 10 + 10) % 10; // 0-9
}

// ─── คำนวณ Life Palace จากชั่วโมงและเดือน ───
function getLifePalace(month, hour) {
  var hourBranch = Math.floor(((hour + 1) % 24) / 2) % 12;
  // Life Palace = (14 - month - hourBranch) % 12
  return ((14 - month - hourBranch) % 12 + 12) % 12;
}

// ─── คำนวณ Zi Wei Position จากวันเกิด ───
function getZiweiPos(day, month, year) {
  var stem = getYearStem(year);
  // กลุ่มปี stem 0,1 = ฉลู ปี stem 2,3 = ขาล ฯลฯ
  var stemGroup = Math.floor(stem / 2); // 0-4
  
  // สูตร simplified: นับจากวันเดือน
  var base = (day + month * 2) % 12;
  // ปรับตาม stem group
  var pos = (base + stemGroup * 2) % 12;
  return pos;
}

// ─── วาง 14 ดาวหลัก ───
function placeMainStars(ziweiPos) {
  var stars = {};
  
  // Zi Wei Group — วางต่อเนื่องทวนเข็ม (ข้ามช่องว่าง)
  var zwGroup = [
    ['ziwei',    0],
    ['tianji',   1],  // ข้ามไป 1
    ['taiyang',  3],  // ข้ามไป 3
    ['wuqu',     4],
    ['tiantong', 5],
    ['lianzhen', 8],  // ข้ามไปอีก
  ];
  
  zwGroup.forEach(function(item) {
    var pos = (ziweiPos + item[1]) % 12;
    if (!stars[pos]) stars[pos] = [];
    stars[pos].push(item[0]);
  });

  // Tian Fu Group — วางย้อนทิศ
  var tfPos = (ziweiPos + 4) % 12; // Tian Fu
  var tfGroup = [
    ['tianfu',    0],
    ['taiyin',    1],
    ['tanlang',   2],
    ['jumen',     3],
    ['tianxiang', 4],
    ['tianliang', 5],
  ];

  tfGroup.forEach(function(item) {
    var pos = (tfPos - item[1] + 12) % 12;
    if (!stars[pos]) stars[pos] = [];
    stars[pos].push(item[0]);
  });

  // Qi Sha — อยู่ตรงข้าม Tian Fu
  var qishaPos = (tfPos + 6) % 12;
  if (!stars[qishaPos]) stars[qishaPos] = [];
  stars[qishaPos].push('qisha');

  // Po Jun — อยู่ตรงข้าม Zi Wei
  var pojunPos = (ziweiPos + 6) % 12;
  if (!stars[pojunPos]) stars[pojunPos] = [];
  stars[pojunPos].push('pojun');

  return stars;
}

// ─── วางดาวเสริม ───
function placeSupportStars(day, month, year) {
  var stars = {};
  // Zuo Fu, You Bi คำนวณจากเดือน
  var zuofuPos = (month + 1) % 12;
  var youbiPos = (12 - month) % 12;
  // Wen Qu, Wen Chang คำนวณจากชั่วโมง/วัน
  var wenquPos  = (day + 3) % 12;
  var wenchangPos = (10 - (day % 12) + 12) % 12;
  var huagaiPos = ((year % 12) + 4) % 12;

  [['zuofu',zuofuPos],['youbi',youbiPos],['wenqu',wenquPos],
   ['wenchang',wenchangPos],['huagai',huagaiPos]].forEach(function(item){
    if (!stars[item[1]]) stars[item[1]] = [];
    stars[item[1]].push(item[0]);
  });

  return stars;
}

// ─── MAIN ───
function calcPurpleStar(day, month, year, hour) {
  var lifePalaceBase = getLifePalace(month, hour);
  var ziweiPos = getZiweiPos(day, month, year);
  var mainStarMap = placeMainStars(ziweiPos);
  var suppStarMap = placeSupportStars(day, month, year);
  var stem = getYearStem(year);

  // รวมดาว
  var allStars = {};
  for (var p = 0; p < 12; p++) {
    allStars[p] = [];
    if (mainStarMap[p]) allStars[p] = allStars[p].concat(mainStarMap[p]);
    if (suppStarMap[p]) allStars[p] = allStars[p].concat(suppStarMap[p]);
  }

  // สร้าง 12 palace โดยหมุนให้ Life Palace = index 0
  var palaces = [];
  for (var i = 0; i < 12; i++) {
    var realPos = (lifePalaceBase + i) % 12;
    var starIds = allStars[realPos] || [];
    var mainS = starIds.filter(function(s){ return MAIN_STARS.find(function(m){return m.id===s;}); });
    var suppS = starIds.filter(function(s){ return SUPPORT_STARS.find(function(m){return m.id===s;}); });
    palaces.push({
      ...PALACES[i],
      position: realPos,
      starIds:  starIds,
      mainStarIds: mainS,
      suppStarIds: suppS,
      mainStarData: mainS.map(function(sid){ return MAIN_STARS.find(function(m){return m.id===sid;}); }).filter(Boolean),
      suppStarData: suppS.map(function(sid){ return SUPPORT_STARS.find(function(m){return m.id===sid;}); }).filter(Boolean),
    });
  }

  return {
    day, month, year, hour,
    stem, lifePalaceBase, ziweiPos, palaces,
    lifeStars: palaces[0].mainStarData,
    careerStars: palaces[5].mainStarData,
    wealthStars: palaces[4].mainStarData,
    loveStars: palaces[2].mainStarData,
  };
}

// ─── เทส ───
var r = calcPurpleStar(25, 9, 1986, 14);
console.log('Life Palace base:', r.lifePalaceBase, '| Zi Wei pos:', r.ziweiPos, '| Stem:', r.stem);
console.log('');

var hasMain = 0;
r.palaces.forEach(function(p, i) {
  var mNames = p.mainStarData.map(function(s){return s.nameTH;});
  var sNames = p.suppStarData.map(function(s){return s.nameTH;});
  var all = mNames.concat(sNames);
  if(mNames.length > 0) hasMain++;
  console.log(i+'. '+p.nameTH+': '+(all.length?all.join(', '):'(ว่าง)'));
});
console.log('');
console.log('Palace มีดาวหลัก:', hasMain, '/ 12');
console.log('ดาวหลักในพระราชวังชีวิต:', r.lifeStars.map(function(s){return s.nameTH;}).join(', ')||'(ว่าง)');
console.log('ดาวหลักในพระราชวังการงาน:', r.careerStars.map(function(s){return s.nameTH;}).join(', ')||'(ว่าง)');
console.log('ดาวหลักในพระราชวังทรัพย์สิน:', r.wealthStars.map(function(s){return s.nameTH;}).join(', ')||'(ว่าง)');
console.log('ดาวหลักในพระราชวังคู่ครอง:', r.loveStars.map(function(s){return s.nameTH;}).join(', ')||'(ว่าง)');

if (typeof module !== 'undefined') module.exports = { calcPurpleStar, PALACES, MAIN_STARS, SUPPORT_STARS };
