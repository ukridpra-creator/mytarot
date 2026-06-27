// destiny-engine.js
// คำนวณ 5 ศาสตร์ + แมทช์ keyword สำหรับ "เจาะดวงชะตา" ฉบับ MyTarot

// ─── 1. ราศีตะวันตก ───
function getWesternSign(day, month) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces";
}

// ─── 2. เลขชีวิต Numerology ───
function getLifeNumber(day, month, year) {
  var sum = String(day).split('').concat(String(month).split('')).concat(String(year).split(''))
    .reduce(function(a, b) { return a + parseInt(b); }, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce(function(a, b) { return a + parseInt(b); }, 0);
  }
  return sum;
}

// เลขชื่อ
function getNameNumber(name) {
  var map = {
    a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
    j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
    s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8
  };
  var clean = name.toLowerCase().replace(/[^a-z]/g, '');
  var sum = clean.split('').reduce(function(a, b) { return a + (map[b] || 0); }, 0);
  while (sum > 9) {
    sum = String(sum).split('').reduce(function(a, b) { return a + parseInt(b); }, 0);
  }
  return sum;
}

// ─── 3. นักษัตรจีน ───
function getChineseZodiac(year) {
  var animals = ["monkey","rooster","dog","pig","rat","ox","tiger","rabbit","dragon","snake","horse","goat"];
  return animals[year % 12];
}

function getChineseElement(year) {
  var elements = ["metal","metal","water","water","wood","wood","fire","fire","earth","earth"];
  return elements[year % 10];
}

// ─── 4. วันเกิดไทย ───
function getThaiDay(year, month, day) {
  var date = new Date(year, month - 1, day);
  var days = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];
  return days[date.getDay()];
}

// ─── 5. ธาตุบาจื้อ ───
function getBaziElements(year, month, day, hour) {
  // Heavenly Stems elements (simplified)
  var stemElements = ["metal","metal","water","water","wood","wood","fire","fire","earth","earth"];
  // Branch elements
  var branchElements = {
    rat:"water", ox:"earth", tiger:"wood", rabbit:"wood",
    dragon:"earth", snake:"fire", horse:"fire", goat:"earth",
    monkey:"metal", rooster:"metal", dog:"earth", pig:"water"
  };

  var yearStem = stemElements[year % 10];
  var yearBranch = branchElements[getChineseZodiac(year)];

  // Month branch (simplified)
  var monthBranches = ["ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig","rat"];
  var monthBranch = monthBranches[month - 1];
  var monthElement = branchElements[monthBranch];

  // Day stem (simplified cycle)
  var dayNum = Math.floor(new Date(year, month-1, day).getTime() / 86400000);
  var dayStem = stemElements[dayNum % 10];

  // Hour branch
  var hourBranches = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
  var hourIdx = Math.floor(hour / 2) % 12;
  var hourElement = branchElements[hourBranches[hourIdx]];

  // นับธาตุที่เด่น
  var count = {};
  [yearStem, yearBranch, monthElement, dayStem, hourElement].forEach(function(e) {
    count[e] = (count[e] || 0) + 1;
  });

  // sort by count
  var sorted = Object.keys(count).sort(function(a, b) { return count[b] - count[a]; });
  return sorted; // ธาตุเด่น เรียงจากมากไปน้อย
}

// ─── MATCH ENGINE ───
function matchKeywords(profile, minMatch) {
  minMatch = minMatch || 2;
  var matched = {};

  Object.keys(KEYWORDS).forEach(function(category) {
    matched[category] = [];

    Object.keys(KEYWORDS[category]).forEach(function(keyword) {
      var kw = KEYWORDS[category][keyword];
      var score = 0;

      // เช็ค western
      if (kw.western && kw.western.indexOf(profile.western) !== -1) score++;

      // เช็ค lifeNumber
      if (kw.lifeNumber && kw.lifeNumber.indexOf(profile.lifeNumber) !== -1) score++;

      // เช็ค chinese
      if (kw.chinese && kw.chinese.indexOf(profile.chinese) !== -1) score++;

      // เช็ค thaiDay
      if (kw.thaiDay && kw.thaiDay.indexOf(profile.thaiDay) !== -1) score++;

      // เช็ค baziElement (เช็คธาตุเด่น 2 อันแรก)
      if (kw.baziElement) {
        var topElements = profile.baziElements.slice(0, 2);
        var hit = topElements.some(function(e) { return kw.baziElement.indexOf(e) !== -1; });
        if (hit) score++;
      }

      if (score >= minMatch) {
        matched[category].push({ keyword: keyword, score: score });
      }
    });

    // sort by score
    matched[category].sort(function(a, b) { return b.score - a.score; });
  });

  return matched;
}

// ─── MAIN FUNCTION ───
function calculateDestiny(name, day, month, year, hour, minute) {
  // คำนวณ 5 ศาสตร์
  var profile = {
    name: name,
    birthday: day + "/" + month + "/" + year,
    time: hour + ":" + (minute < 10 ? "0" + minute : minute),
    western:      getWesternSign(day, month),
    westernTh:    WESTERN_SIGNS[getWesternSign(day, month)].th,
    lifeNumber:   getLifeNumber(day, month, year),
    nameNumber:   getNameNumber(name),
    chinese:      getChineseZodiac(year),
    chineseTh:    CHINESE_ZODIAC[getChineseZodiac(year)].th,
    chineseElem:  getChineseElement(year),
    thaiDay:      getThaiDay(year, month, day),
    baziElements: getBaziElements(year, month, day, hour),
  };

  // แมทช์ keyword
  var matched = matchKeywords(profile, 2);

  // สร้าง prompt สำหรับ Claude
  var prompt = buildPrompt(name, profile, matched);

  return { profile: profile, matched: matched, prompt: prompt };
}

// ─── BUILD PROMPT ───
function buildPrompt(name, profile, matched) {
  var sections = {
    personality:      "นิสัยและบุคลิก",
    love_positive:    "ความรัก (เชิงบวก)",
    love_warning:     "ความรัก (สิ่งที่ต้องระวัง)",
    career_positive:  "การงาน (เชิงบวก)",
    career_warning:   "การงาน (สิ่งที่ต้องระวัง)",
    money_positive:   "การเงิน (เชิงบวก)",
    money_warning:    "การเงิน (สิ่งที่ต้องระวัง)",
    health_positive:  "สุขภาพ (เชิงบวก)",
    health_warning:   "สุขภาพ (สิ่งที่ต้องระวัง)",
    lucky:            "โชคดีประจำชะตา",
    future_positive:  "อนาคต (เชิงบวก)",
    future_warning:   "อนาคต (สิ่งที่ต้องระวัง)",
  };

  var kwText = "";
  Object.keys(sections).forEach(function(cat) {
    if (matched[cat] && matched[cat].length > 0) {
      kwText += "\n" + sections[cat] + ": ";
      kwText += matched[cat].map(function(m) { return m.keyword + "("+m.score+")"; }).join(", ");
    }
  });

  var prompt =
    "คุณคือนักพยากรณ์ของ MyTarot ผู้เชี่ยวชาญโหราศาสตร์ประยุกต์\n" +
    "เขียนคำทำนาย 'เจาะดวงชะตา' ให้ " + name + " ในภาษาไทย\n" +
    "อบอุ่น ลึกซึ้ง ตรงไปตรงมา ไม่บอกว่าใช้ศาสตร์อะไร\n\n" +
    "ข้อมูลดวงชะตา:\n" +
    "- วันเกิด: " + profile.birthday + " เวลา " + profile.time + "\n" +
    "- ราศี: " + profile.westernTh + "\n" +
    "- เลขชีวิต: " + profile.lifeNumber + "\n" +
    "- ปีนักษัตร: " + profile.chineseTh + "\n" +
    "- วันเกิด: " + profile.thaiDay + "\n" +
    "- ธาตุเด่น: " + profile.baziElements.slice(0,2).join(", ") + "\n\n" +
    "keyword ที่ดวงชะตาบ่งบอก (ตัวเลขคือความเชื่อมั่น 2-5):\n" + kwText + "\n\n" +
    "กรุณาเขียนคำทำนายให้ครบ 7 หัวข้อ:\n" +
    "1. 🌟 นิสัยและบุคลิกที่แท้จริง (รวมจุดแข็ง จุดอ่อน)\n" +
    "2. 👶 มาจากไหน — ดวงวัยเด็กถึงวัยรุ่น\n" +
    "3. 🎯 ภารกิจชีวิต — เกิดมาเพื่ออะไร\n" +
    "4. 💕 ความรัก (ตอนนี้ / คู่ที่เหมาะ / ช่วงเวลาดี / ระวัง)\n" +
    "5. 💼 การงาน (อาชีพที่เหมาะ / จุดแข็ง / ช่วงก้าวหน้า / ระวัง)\n" +
    "6. 💰 การเงิน (นิสัยการเงิน / ช่วงรุ่ง / ระวัง)\n" +
    "7. 🌿 สุขภาพ (จุดอ่อน / ระวัง / คำแนะนำ)\n" +
    "8. ✨ โชคดีประจำชะตา (สี / เลข / ทิศ / วัน)\n" +
    "9. ⚡ ดวงปีนี้ 2568\n" +
    "10. 🔮 อนาคต\n\n" +
    "ให้ใช้ keyword ที่มีความเชื่อมั่นสูง (3+) เป็นหลัก\n" +
    "keyword ที่มี (2) ใช้เสริม keyword ที่มี (warning) ให้เตือนอย่างตรงไปตรงมาแต่สุภาพ";

  return prompt;
}

// ─── Export / Global ───
if (typeof module !== 'undefined') {
  module.exports = { calculateDestiny, getWesternSign, getLifeNumber, getChineseZodiac, matchKeywords };
}
