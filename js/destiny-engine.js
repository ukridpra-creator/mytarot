// destiny-engine.js v2
// เพิ่ม Personal Year + ดาวจรปีนี้ + ปรับ score system

// ─── 1. ราศีตะวันตก ───
function getWesternSign(day, month) {
  if ((month===3&&day>=21)||(month===4&&day<=19)) return "aries";
  if ((month===4&&day>=20)||(month===5&&day<=20)) return "taurus";
  if ((month===5&&day>=21)||(month===6&&day<=20)) return "gemini";
  if ((month===6&&day>=21)||(month===7&&day<=22)) return "cancer";
  if ((month===7&&day>=23)||(month===8&&day<=22)) return "leo";
  if ((month===8&&day>=23)||(month===9&&day<=22)) return "virgo";
  if ((month===9&&day>=23)||(month===10&&day<=22)) return "libra";
  if ((month===10&&day>=23)||(month===11&&day<=21)) return "scorpio";
  if ((month===11&&day>=22)||(month===12&&day<=21)) return "sagittarius";
  if ((month===12&&day>=22)||(month===1&&day<=19)) return "capricorn";
  if ((month===1&&day>=20)||(month===2&&day<=18)) return "aquarius";
  return "pisces";
}

// ─── 2. เลขชีวิต ───
function reduceNum(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce(function(a,b){return a+parseInt(b);},0);
  }
  return n;
}

function getLifeNumber(day, month, year) {
  var sum = String(day).split('').concat(String(month).split('')).concat(String(year).split(''))
    .reduce(function(a,b){return a+parseInt(b);},0);
  return reduceNum(sum);
}

function getPersonalYear(day, month, currentYear) {
  var sum = String(day).split('').concat(String(month).split('')).concat(String(currentYear).split(''))
    .reduce(function(a,b){return a+parseInt(b);},0);
  return reduceNum(sum);
}

// ─── 3. นักษัตรจีน ───
function getChineseZodiac(year) {
  var animals = ["monkey","rooster","dog","pig","rat","ox","tiger","rabbit","dragon","snake","horse","goat"];
  return animals[((year%12)+12)%12];
}

function getChineseElement(year) {
  var elements = ["metal","metal","water","water","wood","wood","fire","fire","earth","earth"];
  return elements[((year%10)+10)%10];
}

// ─── 4. วันเกิดไทย ───
function getThaiDay(year, month, day) {
  var d = new Date(year, month-1, day);
  return ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"][d.getDay()];
}

// ─── 5. ธาตุบาจื้อ ───
function getBaziElements(year, month, day, hour) {
  var stemEl = ["metal","metal","water","water","wood","wood","fire","fire","earth","earth"];
  var branchEl = {
    rat:"water",ox:"earth",tiger:"wood",rabbit:"wood",dragon:"earth",snake:"fire",
    horse:"fire",goat:"earth",monkey:"metal",rooster:"metal",dog:"earth",pig:"water"
  };
  var monthBranches = ["ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig","rat"];
  var hourBranches  = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];

  var zodiac = getChineseZodiac(year);
  var elements = [
    stemEl[((year%10)+10)%10],
    branchEl[zodiac],
    branchEl[monthBranches[month-1]],
    stemEl[Math.floor(new Date(year,month-1,day).getTime()/86400000)%10],
    branchEl[hourBranches[Math.floor(hour/2)%12]]
  ];

  var count = {};
  elements.forEach(function(e){ count[e]=(count[e]||0)+1; });
  return Object.keys(count).sort(function(a,b){return count[b]-count[a];});
}

// ─── 6. Personal Year Meaning ───
var PERSONAL_YEAR_MEANING = {
  1: "ปีแห่งการเริ่มต้นใหม่ เหมาะเปิดโปรเจกต์หรือธุรกิจใหม่ค่ะ",
  2: "ปีแห่งความสัมพันธ์ ความร่วมมือ เหมาะหาคู่หรือสร้างทีมค่ะ",
  3: "ปีแห่งความสร้างสรรค์ โชคดี เหมาะแสดงความสามารถค่ะ",
  4: "ปีแห่งการสร้างรากฐาน ต้องทำงานหนักแต่มั่นคงค่ะ",
  5: "ปีแห่งการเปลี่ยนแปลง อิสรภาพ มีโอกาสใหม่มากมายค่ะ",
  6: "ปีแห่งครอบครัวและความรับผิดชอบ เหมาะแต่งงานหรือซื้อบ้านค่ะ",
  7: "ปีแห่งการพัฒนาตัวเอง ควรเรียนรู้และพักผ่อนค่ะ",
  8: "ปีแห่งความสำเร็จและการเงิน ดวงธุรกิจแรงมากค่ะ",
  9: "ปีแห่งการสรุปและปล่อยวาง เตรียมตัวสู่รอบใหม่ค่ะ",
  11:"ปีแห่งแรงบันดาลใจสูง มีพลังงานพิเศษจากจักรวาลค่ะ",
  22:"ปีแห่งการสร้างสิ่งยิ่งใหญ่ โอกาสทองในชีวิตค่ะ",
};

// ─── 7. ดาวจรปีนี้ (จาก PLANET_TRANSITS) ───
// sign index: 0=เมษ 1=พฤษภ 2=เมถุน 3=กรกฎ 4=สิงห์ 5=กันย์
//             6=ตุลย์ 7=พิจิก 8=ธนู 9=มังกร 10=กุมภ์ 11=มีน
var SIGN_NAMES = ["เมษ","พฤษภ","เมถุน","กรกฎ","สิงห์","กันย์","ตุลย์","พิจิก","ธนู","มังกร","กุมภ์","มีน"];

function getPlanetTransitThisYear(currentYear) {
  if (typeof PLANET_TRANSITS === 'undefined') return null;
  var data = PLANET_TRANSITS[currentYear];
  if (!data) return null;

  var today = new Date();
  var todayStr = today.toISOString().slice(0,10);

  function getCurrentSign(entries) {
    if (!entries || !entries.length) return null;
    var sign = entries[0].s;
    for (var i=0; i<entries.length; i++) {
      if (entries[i].d <= todayStr) sign = entries[i].s;
      else break;
    }
    return sign;
  }

  return {
    sat:  getCurrentSign(data.sat),
    jup:  getCurrentSign(data.jup),
    rahu: getCurrentSign(data.rahu),
    ketu: getCurrentSign(data.ketu),
    mars: getCurrentSign(data.mars),
  };
}

// ─── 8. คำทำนายดาวจร × ราศีเจ้าชะตา ───
// เช็คว่าดาวจรอยู่ใน house ไหนของราศีเจ้าชะตา
function getTransitHouse(natalSignIdx, transitSignIdx) {
  if (transitSignIdx === null || transitSignIdx === undefined) return null;
  return ((transitSignIdx - natalSignIdx + 12) % 12) + 1;
}

var TRANSIT_MEANINGS = {
  sat: {
    1:  "เสาร์ผ่านลัคนา — ช่วงทดสอบความอดทน ต้องทำงานหนักขึ้นค่ะ",
    4:  "เสาร์ผ่านบ้าน — ระวังปัญหาครอบครัวและที่อยู่อาศัยค่ะ",
    7:  "เสาร์ผ่านคู่ครอง — ความสัมพันธ์ต้องการความใส่ใจมากขึ้นค่ะ",
    10: "เสาร์ผ่านการงาน — โอกาสก้าวหน้าแต่ต้องพิสูจน์ตัวเองค่ะ",
  },
  jup: {
    1:  "พฤหัสผ่านลัคนา — ปีมหามงคล โชคดีทุกด้านค่ะ",
    2:  "พฤหัสผ่านการเงิน — รายได้เพิ่ม โชคลาภมาค่ะ",
    5:  "พฤหัสผ่านความรัก — ดวงรักและบุตรดีมากค่ะ",
    7:  "พฤหัสผ่านคู่ครอง — โอกาสพบรักหรือชีวิตคู่ดีขึ้นค่ะ",
    10: "พฤหัสผ่านการงาน — เลื่อนขั้น ขยายธุรกิจ รุ่งเรืองค่ะ",
    11: "พฤหัสผ่านมิตร — เครือข่ายดีขึ้น มีผู้ช่วยเหลือค่ะ",
  },
  rahu: {
    1:  "ราหูผ่านลัคนา — ปีแห่งการเปลี่ยนแปลงใหญ่ ระวังสุขภาพค่ะ",
    4:  "ราหูผ่านบ้าน — ระวังปัญหาที่ดินและครอบครัวค่ะ",
    7:  "ราหูผ่านคู่ครอง — ความสัมพันธ์ซับซ้อน ระวังคนสามค่ะ",
    10: "ราหูผ่านการงาน — โอกาสใหม่แต่ต้องระวังกับดักค่ะ",
  },
};

function getTransitKeywords(westernSign, transitData) {
  if (!transitData) return [];
  var signIdx = Object.keys(WESTERN_SIGNS).indexOf(westernSign);
  if (signIdx < 0) return [];

  var keywords = [];
  ["sat","jup","rahu"].forEach(function(planet) {
    var tSign = transitData[planet];
    if (tSign === null || tSign === undefined) return;
    var house = getTransitHouse(signIdx, tSign);
    if (TRANSIT_MEANINGS[planet] && TRANSIT_MEANINGS[planet][house]) {
      keywords.push(TRANSIT_MEANINGS[planet][house]);
    }
  });
  return keywords;
}

// ─── 9. MATCH ENGINE ───
function matchKeywords(profile, minMatch) {
  minMatch = minMatch || 2;
  var matched = {};

  Object.keys(KEYWORDS).forEach(function(category) {
    matched[category] = { high: [], medium: [] };

    Object.keys(KEYWORDS[category]).forEach(function(keyword) {
      var kw = KEYWORDS[category][keyword];
      var score = 0;

      if (kw.western     && kw.western.indexOf(profile.western) !== -1)       score++;
      if (kw.lifeNumber  && kw.lifeNumber.indexOf(profile.lifeNumber) !== -1)  score++;
      if (kw.chinese     && kw.chinese.indexOf(profile.chinese) !== -1)        score++;
      if (kw.thaiDay     && kw.thaiDay.indexOf(profile.thaiDay) !== -1)        score++;
      if (kw.baziElement) {
        var top2 = profile.baziElements.slice(0,2);
        if (top2.some(function(e){ return kw.baziElement.indexOf(e) !== -1; })) score++;
      }

      if (score >= 3)        matched[category].high.push({ keyword:keyword, score:score });
      else if (score === 2)  matched[category].medium.push({ keyword:keyword, score:score });
    });

    matched[category].high.sort(function(a,b){return b.score-a.score;});
    matched[category].medium.sort(function(a,b){return b.score-a.score;});
  });

  return matched;
}

// ─── 10. BUILD PROMPT ───
function buildPromptPart1(name, profile, matched, transitKeywords, personalYear) {
  function kwText(cats, maxH, maxM) {
    var h=[], m=[];
    cats.forEach(function(cat){
      if(!matched[cat]) return;
      matched[cat].high.slice(0,maxH||3).forEach(function(k){ h.push(k.keyword+"("+k.score+")"); });
      matched[cat].medium.slice(0,maxM||2).forEach(function(k){ m.push(k.keyword); });
    });
    var out = "";
    if (h.length) out += "หลัก: "+h.join(", ");
    if (m.length) out += " | เสริม: "+m.join(", ");
    return out || "ทั่วไป";
  }

  var currentYear = new Date().getFullYear();
  var currentYearBE = currentYear + 543;

  var transitText = transitKeywords.length
    ? "\nดาวจรปีนี้: "+transitKeywords.join(" | ")
    : "";

  return "คุณคือนักพยากรณ์ของ MyTarot เชี่ยวชาญโหราศาสตร์ประยุกต์\n" +
    "เขียนคำทำนายเจาะดวงชะตาให้ '"+name+"' ภาษาไทย อบอุ่น ลึกซึ้ง ตรงไปตรงมา\n" +
    "ห้ามใช้ # * _ หรือ markdown ทั้งสิ้น เขียนเป็นย่อหน้าธรรมดาเท่านั้น\n\n" +
    "ข้อมูลดวงชะตา:\n" +
    "- ราศี: "+profile.westernTh+"\n" +
    "- เลขชีวิต: "+profile.lifeNumber+"\n" +
    "- ปีนักษัตร: "+profile.chineseTh+"\n" +
    "- วันเกิด: "+profile.thaiDay+"\n" +
    "- ธาตุเด่น: "+profile.baziElements.slice(0,2).join("+")+"\n" +
    "- Personal Year "+currentYearBE+": "+personalYear+" ("+( PERSONAL_YEAR_MEANING[personalYear]||"ปีทั่วไปค่ะ")+")\n" +
    transitText + "\n\n" +
    "keyword ดวงชะตา:\n" +
    "- นิสัย: "+kwText(["personality"])+"\n" +
    "- ความรัก: "+kwText(["love_positive","love_warning"])+"\n" +
    "- การงาน: "+kwText(["career_positive","career_warning"])+"\n\n" +
    "เขียน 5 หัวข้อ ขึ้นต้นด้วย tag เหล่านี้เท่านั้น:\n" +
    "[PERSONALITY]\n[CHILDHOOD]\n[MISSION]\n[LOVE]\n[CAREER]\n\n" +
    "แต่ละหัวข้อ 3-4 ย่อหน้า ละเอียด ลึกซึ้ง ไม่สั้นเกินไป\n" +
    "keyword หลัก(3+)ใช้เป็นแกนหลัก keyword เสริมใช้สนับสนุน keyword warning เตือนตรงๆ สุภาพ";
}

function buildPromptPart2(name, profile, matched, transitKeywords, personalYear) {
  function kwText(cats, maxH, maxM) {
    var h=[], m=[];
    cats.forEach(function(cat){
      if(!matched[cat]) return;
      matched[cat].high.slice(0,maxH||3).forEach(function(k){ h.push(k.keyword+"("+k.score+")"); });
      matched[cat].medium.slice(0,maxM||2).forEach(function(k){ m.push(k.keyword); });
    });
    var out = "";
    if (h.length) out += "หลัก: "+h.join(", ");
    if (m.length) out += " | เสริม: "+m.join(", ");
    return out || "ทั่วไป";
  }

  var currentYear = new Date().getFullYear();
  var currentYearBE = currentYear + 543;
  var nextYearBE = currentYearBE + 1;

  var transitText = transitKeywords.length
    ? "\nดาวจรปีนี้: "+transitKeywords.join(" | ")
    : "";

  return "คุณคือนักพยากรณ์ของ MyTarot เขียนคำทำนายต่อให้ '"+name+"'\n" +
    "ห้ามใช้ # * _ หรือ markdown ทั้งสิ้น เขียนเป็นย่อหน้าธรรมดาเท่านั้น\n\n" +
    "ข้อมูลดวงชะตา: ราศี"+profile.westernTh+" เลขชีวิต"+profile.lifeNumber+
    " ปี"+profile.chineseTh+" วัน"+profile.thaiDay+
    " ธาตุ"+profile.baziElements.slice(0,2).join("+")+"\n" +
    "Personal Year "+currentYearBE+": "+personalYear+"\n" +
    transitText + "\n\n" +
    "keyword:\n" +
    "- การเงิน: "+kwText(["money_positive","money_warning"])+"\n" +
    "- สุขภาพ: "+kwText(["health_positive","health_warning"])+"\n" +
    "- โชคดี: "+kwText(["lucky"])+"\n" +
    "- ครอบครัว: "+kwText(["family"])+"\n" +
    "- จิตวิญญาณ: "+kwText(["spiritual"])+"\n" +
    "- อนาคต: "+kwText(["future_positive","future_warning"])+"\n\n" +
    "เขียน 5 หัวข้อ ขึ้นต้นด้วย tag เหล่านี้เท่านั้น:\n" +
    "[MONEY]\n[HEALTH]\n[LUCKY]\n[THISYEAR]\n[FUTURE]\n\n" +
    "[THISYEAR] ให้พูดถึงดวงปี "+currentYearBE+" และ "+nextYearBE+" โดยอ้างอิง Personal Year "+personalYear+" และดาวจรค่ะ\n" +
    "แต่ละหัวข้อ 3-4 ย่อหน้า ละเอียด ไม่สั้นเกินไป";
}

// ─── 11. MAIN ───
function calculateDestiny(name, day, month, year, hour, minute) {
  var currentYear = new Date().getFullYear();

  var profile = {
    name:         name,
    birthday:     day+"/"+month+"/"+year,
    time:         hour+":"+(minute<10?"0"+minute:minute),
    western:      getWesternSign(day, month),
    westernTh:    WESTERN_SIGNS[getWesternSign(day,month)].th,
    lifeNumber:   getLifeNumber(day, month, year),
    chinese:      getChineseZodiac(year),
    chineseTh:    CHINESE_ZODIAC[getChineseZodiac(year)].th,
    chineseElem:  getChineseElement(year),
    thaiDay:      getThaiDay(year, month, day),
    baziElements: getBaziElements(year, month, day, hour),
    personalYear: getPersonalYear(day, month, currentYear),
  };

  var transitData     = getPlanetTransitThisYear(currentYear);
  var transitKeywords = getTransitKeywords(profile.western, transitData);

  var matched = matchKeywords(profile, 2);

  var prompt1 = buildPromptPart1(name, profile, matched, transitKeywords, profile.personalYear);
  var prompt2 = buildPromptPart2(name, profile, matched, transitKeywords, profile.personalYear);

  return {
    profile:         profile,
    matched:         matched,
    transitData:     transitData,
    transitKeywords: transitKeywords,
    prompt1:         prompt1,
    prompt2:         prompt2,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { calculateDestiny, getWesternSign, getLifeNumber, getChineseZodiac, matchKeywords };
}
