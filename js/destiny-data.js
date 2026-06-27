// destiny-data.js
// ตาราง keyword สำหรับ "เจาะดวงชะตา" ฉบับ MyTarot
// แมปกับ 5 ศาสตร์: ราศีตะวันตก / เลขชีวิต / นักษัตรจีน / วันเกิดไทย / ธาตุบาจื้อ

// ─── ราศีตะวันตก ───
var WESTERN_SIGNS = {
  aries:       { th: "แกะ",       element: "fire", ruler: "mars"    },
  taurus:      { th: "พฤษภ",      element: "earth", ruler: "venus"  },
  gemini:      { th: "เมถุน",     element: "air",  ruler: "mercury" },
  cancer:      { th: "กรกฎ",      element: "water", ruler: "moon"   },
  leo:         { th: "สิงห์",     element: "fire", ruler: "sun"     },
  virgo:       { th: "กันย์",     element: "earth", ruler: "mercury"},
  libra:       { th: "ตุลย์",     element: "air",  ruler: "venus"   },
  scorpio:     { th: "แมงป่อง",   element: "water", ruler: "pluto"  },
  sagittarius: { th: "ราศีธนู",   element: "fire", ruler: "jupiter" },
  capricorn:   { th: "มังกร",     element: "earth", ruler: "saturn" },
  aquarius:    { th: "กุมภ์",     element: "air",  ruler: "uranus"  },
  pisces:      { th: "มีน",       element: "water", ruler: "neptune"},
};

// ─── นักษัตรจีน ───
var CHINESE_ZODIAC = {
  rat:     { th: "ชวด",   element: "water" },
  ox:      { th: "ฉลู",   element: "earth" },
  tiger:   { th: "ขาล",   element: "wood"  },
  rabbit:  { th: "เถาะ",  element: "wood"  },
  dragon:  { th: "มะโรง", element: "earth" },
  snake:   { th: "มะเส็ง",element: "fire"  },
  horse:   { th: "มะเมีย",element: "fire"  },
  goat:    { th: "มะแม",  element: "earth" },
  monkey:  { th: "วอก",   element: "metal" },
  rooster: { th: "ระกา",  element: "metal" },
  dog:     { th: "จอ",    element: "earth" },
  pig:     { th: "กุน",   element: "water" },
};

// ─── วันเกิดไทย ───
var THAI_DAY = {
  0: { th: "อาทิตย์", planet: "sun",    color: "#FF0000", element: "fire"  },
  1: { th: "จันทร์",  planet: "moon",   color: "#FFFF00", element: "water" },
  2: { th: "อังคาร",  planet: "mars",   color: "#FF69B4", element: "fire"  },
  3: { th: "พุธ",     planet: "mercury",color: "#00FF00", element: "earth" },
  4: { th: "พฤหัส",  planet: "jupiter",color: "#FFA500", element: "fire"  },
  5: { th: "ศุกร์",   planet: "venus",  color: "#00FFFF", element: "water" },
  6: { th: "เสาร์",   planet: "saturn", color: "#800080", element: "earth" },
};

// ─── ธาตุบาจื้อ ───
var BAZI_ELEMENTS = {
  fire:  { th: "ไฟ",  strengthens: "earth", weakens: "metal", weakenedBy: "water" },
  earth: { th: "ดิน", strengthens: "metal", weakens: "water", weakenedBy: "wood"  },
  metal: { th: "ทอง", strengthens: "water", weakens: "wood",  weakenedBy: "fire"  },
  water: { th: "น้ำ", strengthens: "wood",  weakens: "fire",  weakenedBy: "earth" },
  wood:  { th: "ไม้", strengthens: "fire",  weakens: "earth", weakenedBy: "metal" },
};

// ─── KEYWORD MASTER TABLE ───
// แต่ละ keyword มี: western[], lifeNumber[], chinese[], thaiDay[], baziElement[]
// ถ้าตรง 2+ = เอามาทำนาย

var KEYWORDS = {

  // ══════════════════════════════════
  // 🌟 นิสัย / บุคลิก
  // ══════════════════════════════════
  personality: {
    "ผู้นำ": {
      western:     ["leo", "aries", "capricorn"],
      lifeNumber:  [1, 8],
      chinese:     ["tiger", "dragon", "horse"],
      thaiDay:     ["อาทิตย์", "อังคาร"],
      baziElement: ["fire", "earth"],
    },
    "ปัญญาดี": {
      western:     ["gemini", "virgo", "aquarius"],
      lifeNumber:  [7, 5],
      chinese:     ["monkey", "rooster", "rat"],
      thaiDay:     ["พุธ", "พฤหัส"],
      baziElement: ["water", "metal"],
    },
    "มีบารมี": {
      western:     ["libra", "capricorn", "leo"],
      lifeNumber:  [4, 6, 8],
      chinese:     ["tiger", "dragon", "horse"],
      thaiDay:     ["พฤหัส", "อาทิตย์"],
      baziElement: ["earth", "fire"],
    },
    "อ่อนโยน": {
      western:     ["cancer", "pisces", "taurus"],
      lifeNumber:  [2, 6],
      chinese:     ["rabbit", "pig", "goat"],
      thaiDay:     ["จันทร์", "ศุกร์"],
      baziElement: ["water", "wood"],
    },
    "มั่นคง": {
      western:     ["taurus", "capricorn", "virgo"],
      lifeNumber:  [4, 8],
      chinese:     ["ox", "dragon", "dog"],
      thaiDay:     ["เสาร์", "พฤหัส"],
      baziElement: ["earth"],
    },
    "สร้างสรรค์": {
      western:     ["gemini", "sagittarius", "aquarius"],
      lifeNumber:  [3, 5],
      chinese:     ["horse", "monkey", "rat"],
      thaiDay:     ["พุธ", "ศุกร์"],
      baziElement: ["wood", "fire"],
    },
    "เอาใจใส่": {
      western:     ["cancer", "virgo", "pisces"],
      lifeNumber:  [2, 6, 9],
      chinese:     ["rabbit", "pig", "ox"],
      thaiDay:     ["จันทร์", "พฤหัส"],
      baziElement: ["water", "earth"],
    },
    "กล้าหาญ": {
      western:     ["aries", "leo", "scorpio"],
      lifeNumber:  [1, 9],
      chinese:     ["tiger", "horse", "dragon"],
      thaiDay:     ["อาทิตย์", "อังคาร"],
      baziElement: ["fire"],
    },
    "มีเสน่ห์": {
      western:     ["libra", "leo", "scorpio"],
      lifeNumber:  [3, 6],
      chinese:     ["dragon", "horse", "pig"],
      thaiDay:     ["ศุกร์", "อาทิตย์"],
      baziElement: ["fire", "earth"],
    },
    "อดทน": {
      western:     ["taurus", "capricorn", "scorpio"],
      lifeNumber:  [4, 8],
      chinese:     ["ox", "snake", "dog"],
      thaiDay:     ["เสาร์"],
      baziElement: ["earth", "metal"],
    },
    "หัวร้อน": {
      western:     ["aries", "scorpio", "leo"],
      lifeNumber:  [1, 9],
      chinese:     ["tiger", "horse"],
      thaiDay:     ["อังคาร", "อาทิตย์"],
      baziElement: ["fire"],
    },
    "ขี้กังวล": {
      western:     ["virgo", "cancer", "gemini"],
      lifeNumber:  [7, 2],
      chinese:     ["rabbit", "pig", "dog"],
      thaiDay:     ["พุธ", "จันทร์"],
      baziElement: ["water", "earth"],
    },
    "เสียสละ": {
      western:     ["pisces", "cancer", "virgo"],
      lifeNumber:  [9, 2, 6],
      chinese:     ["pig", "rabbit", "goat"],
      thaiDay:     ["พฤหัส", "จันทร์"],
      baziElement: ["water", "wood"],
    },
    "ทะเยอทะยาน": {
      western:     ["capricorn", "scorpio", "aries"],
      lifeNumber:  [8, 1],
      chinese:     ["dragon", "tiger", "monkey"],
      thaiDay:     ["เสาร์", "อังคาร"],
      baziElement: ["earth", "fire"],
    },
    "ชอบอิสระ": {
      western:     ["sagittarius", "aquarius", "gemini"],
      lifeNumber:  [5, 3],
      chinese:     ["horse", "monkey", "tiger"],
      thaiDay:     ["พุธ", "อาทิตย์"],
      baziElement: ["wood", "fire"],
    },
  },

  // ══════════════════════════════════
  // 💕 ความรัก — เชิงบวก
  // ══════════════════════════════════
  love_positive: {
    "รักซื่อสัตย์": {
      western:     ["taurus", "cancer", "capricorn"],
      lifeNumber:  [2, 4, 6],
      chinese:     ["ox", "rabbit", "pig"],
      thaiDay:     ["จันทร์", "เสาร์"],
      baziElement: ["earth", "water"],
    },
    "โรแมนติก": {
      western:     ["libra", "pisces", "cancer"],
      lifeNumber:  [2, 6],
      chinese:     ["rabbit", "horse", "pig"],
      thaiDay:     ["ศุกร์", "จันทร์"],
      baziElement: ["water", "wood"],
    },
    "ต้องการความมั่นคง": {
      western:     ["taurus", "capricorn", "cancer"],
      lifeNumber:  [4, 2, 8],
      chinese:     ["ox", "pig", "dog"],
      thaiDay:     ["เสาร์", "จันทร์"],
      baziElement: ["earth", "water"],
    },
    "รักเต็มที่": {
      western:     ["leo", "scorpio", "aries"],
      lifeNumber:  [1, 9],
      chinese:     ["tiger", "dragon", "horse"],
      thaiDay:     ["อาทิตย์", "อังคาร"],
      baziElement: ["fire"],
    },
    "เมตตาสูง": {
      western:     ["pisces", "cancer", "virgo"],
      lifeNumber:  [2, 9, 6],
      chinese:     ["pig", "rabbit", "goat"],
      thaiDay:     ["พฤหัส", "จันทร์"],
      baziElement: ["water", "wood"],
    },
  },

  // ══════════════════════════════════
  // 💕 ความรัก — เชิงเตือน
  // ══════════════════════════════════
  love_warning: {
    "ระวังคบซ้อน": {
      western:     ["scorpio", "gemini", "sagittarius"],
      lifeNumber:  [5, 3],
      chinese:     ["horse", "monkey", "rooster"],
      thaiDay:     ["พุธ", "ศุกร์"],
      baziElement: ["fire", "wood"],
    },
    "รักสามเส้า": {
      western:     ["sagittarius", "libra", "gemini"],
      lifeNumber:  [3, 5],
      chinese:     ["horse", "rooster", "monkey"],
      thaiDay:     ["ศุกร์", "พุธ"],
      baziElement: ["wood", "fire"],
    },
    "รักไม่สมหวัง": {
      western:     ["pisces", "cancer", "virgo"],
      lifeNumber:  [7, 2],
      chinese:     ["rabbit", "pig", "goat"],
      thaiDay:     ["จันทร์", "เสาร์"],
      baziElement: ["water"],
    },
    "ถูกทอดทิ้ง": {
      western:     ["cancer", "pisces", "libra"],
      lifeNumber:  [2, 7],
      chinese:     ["pig", "rabbit", "dog"],
      thaiDay:     ["จันทร์", "ศุกร์"],
      baziElement: ["water"],
    },
    "รักเจ็บปวด": {
      western:     ["scorpio", "aries", "capricorn"],
      lifeNumber:  [9, 1, 4],
      chinese:     ["tiger", "snake", "ox"],
      thaiDay:     ["อังคาร", "เสาร์"],
      baziElement: ["fire", "earth"],
    },
    "ระวังถูกหลอก": {
      western:     ["pisces", "libra", "gemini"],
      lifeNumber:  [7, 3],
      chinese:     ["pig", "rabbit", "monkey"],
      thaiDay:     ["จันทร์", "พุธ"],
      baziElement: ["water", "wood"],
    },
  },

  // ══════════════════════════════════
  // 💼 การงาน — เชิงบวก
  // ══════════════════════════════════
  career_positive: {
    "เหมาะเป็นผู้นำ": {
      western:     ["leo", "aries", "capricorn"],
      lifeNumber:  [1, 8],
      chinese:     ["tiger", "dragon", "horse"],
      thaiDay:     ["อาทิตย์", "พฤหัส"],
      baziElement: ["fire", "earth"],
    },
    "เจรจาเก่ง": {
      western:     ["libra", "gemini", "sagittarius"],
      lifeNumber:  [3, 5, 6],
      chinese:     ["monkey", "horse", "rabbit"],
      thaiDay:     ["พุธ", "ศุกร์"],
      baziElement: ["wood", "metal"],
    },
    "งานสร้างสรรค์": {
      western:     ["leo", "gemini", "aquarius"],
      lifeNumber:  [3, 6],
      chinese:     ["horse", "monkey", "rat"],
      thaiDay:     ["พุธ", "ศุกร์"],
      baziElement: ["wood", "fire"],
    },
    "งานช่วยเหลือผู้อื่น": {
      western:     ["cancer", "pisces", "virgo"],
      lifeNumber:  [2, 9, 6],
      chinese:     ["pig", "rabbit", "goat"],
      thaiDay:     ["พฤหัส", "จันทร์"],
      baziElement: ["water", "wood"],
    },
    "ธุรกิจส่วนตัว": {
      western:     ["aries", "capricorn", "scorpio"],
      lifeNumber:  [1, 8],
      chinese:     ["tiger", "dragon", "monkey"],
      thaiDay:     ["อาทิตย์", "เสาร์"],
      baziElement: ["fire", "earth"],
    },
    "บริหารจัดการเก่ง": {
      western:     ["capricorn", "virgo", "libra"],
      lifeNumber:  [4, 8],
      chinese:     ["dragon", "ox", "dog"],
      thaiDay:     ["เสาร์", "พฤหัส"],
      baziElement: ["earth", "metal"],
    },
    "งานศิลปะ": {
      western:     ["libra", "pisces", "taurus"],
      lifeNumber:  [3, 6],
      chinese:     ["rabbit", "horse", "pig"],
      thaiDay:     ["ศุกร์"],
      baziElement: ["wood", "water"],
    },
    "งานวิชาการ": {
      western:     ["virgo", "gemini", "aquarius"],
      lifeNumber:  [7, 5],
      chinese:     ["monkey", "rooster", "rat"],
      thaiDay:     ["พุธ", "พฤหัส"],
      baziElement: ["water", "metal"],
    },
  },

  // ══════════════════════════════════
  // 💼 การงาน — เชิงเตือน
  // ══════════════════════════════════
  career_warning: {
    "ระวังคนอิจฉา": {
      western:     ["leo", "scorpio", "capricorn"],
      lifeNumber:  [1, 8],
      chinese:     ["dragon", "tiger", "rooster"],
      thaiDay:     ["อาทิตย์", "เสาร์"],
      baziElement: ["fire", "earth"],
    },
    "ระวังถูกหักหลัง": {
      western:     ["gemini", "sagittarius", "libra"],
      lifeNumber:  [3, 5],
      chinese:     ["monkey", "horse", "rooster"],
      thaiDay:     ["พุธ", "ศุกร์"],
      baziElement: ["wood", "metal"],
    },
    "ช่วงซบเซา": {
      western:     ["capricorn", "virgo", "cancer"],
      lifeNumber:  [4, 7],
      chinese:     ["ox", "rooster", "dog"],
      thaiDay:     ["เสาร์", "จันทร์"],
      baziElement: ["earth", "water"],
    },
    "ผู้ใหญ่ไม่เกื้อหนุน": {
      western:     ["scorpio", "capricorn", "aquarius"],
      lifeNumber:  [8, 4],
      chinese:     ["ox", "rooster", "dog"],
      thaiDay:     ["เสาร์", "อังคาร"],
      baziElement: ["earth", "metal"],
    },
    "งานไม่มั่นคง": {
      western:     ["aquarius", "gemini", "sagittarius"],
      lifeNumber:  [5, 3],
      chinese:     ["horse", "monkey", "tiger"],
      thaiDay:     ["พุธ", "อาทิตย์"],
      baziElement: ["wood", "fire"],
    },
  },

  // ══════════════════════════════════
  // 💰 การเงิน — เชิงบวก
  // ══════════════════════════════════
  money_positive: {
    "ออมเก่ง": {
      western:     ["taurus", "capricorn", "virgo"],
      lifeNumber:  [4, 8],
      chinese:     ["ox", "dragon", "rooster"],
      thaiDay:     ["เสาร์", "พุธ"],
      baziElement: ["earth", "metal"],
    },
    "มีลาภลอย": {
      western:     ["sagittarius", "leo", "pisces"],
      lifeNumber:  [3, 8, 9],
      chinese:     ["dragon", "pig", "horse"],
      thaiDay:     ["พฤหัส", "อาทิตย์"],
      baziElement: ["fire", "water"],
    },
    "รุ่งวัยกลางคน": {
      western:     ["capricorn", "scorpio", "taurus"],
      lifeNumber:  [4, 8],
      chinese:     ["ox", "dragon", "rooster"],
      thaiDay:     ["เสาร์", "พฤหัส"],
      baziElement: ["earth"],
    },
    "มีเงินจากความรู้": {
      western:     ["virgo", "gemini", "sagittarius"],
      lifeNumber:  [7, 5],
      chinese:     ["monkey", "rooster", "rat"],
      thaiDay:     ["พฤหัส", "พุธ"],
      baziElement: ["water", "metal"],
    },
    "กล้าลงทุน": {
      western:     ["aries", "sagittarius", "leo"],
      lifeNumber:  [1, 3, 8],
      chinese:     ["tiger", "horse", "dragon"],
      thaiDay:     ["อาทิตย์", "อังคาร"],
      baziElement: ["fire"],
    },
  },

  // ══════════════════════════════════
  // 💰 การเงิน — เชิงเตือน
  // ══════════════════════════════════
  money_warning: {
    "ระวังถูกโกง": {
      western:     ["pisces", "libra", "cancer"],
      lifeNumber:  [7, 2],
      chinese:     ["pig", "rabbit", "goat"],
      thaiDay:     ["จันทร์", "ศุกร์"],
      baziElement: ["water"],
    },
    "เสียเงินโดยไม่คาดคิด": {
      western:     ["sagittarius", "gemini", "aquarius"],
      lifeNumber:  [3, 5],
      chinese:     ["horse", "monkey", "tiger"],
      thaiDay:     ["พุธ", "อาทิตย์"],
      baziElement: ["wood", "fire"],
    },
    "ระวังหนี้สิน": {
      western:     ["aquarius", "pisces", "libra"],
      lifeNumber:  [7, 2],
      chinese:     ["pig", "rabbit", "goat"],
      thaiDay:     ["จันทร์", "ศุกร์"],
      baziElement: ["water", "wood"],
    },
    "การลงทุนเสี่ยง": {
      western:     ["aries", "sagittarius", "scorpio"],
      lifeNumber:  [1, 5, 9],
      chinese:     ["horse", "tiger", "dragon"],
      thaiDay:     ["อาทิตย์", "อังคาร"],
      baziElement: ["fire"],
    },
    "ฟุ่มเฟือย": {
      western:     ["leo", "libra", "sagittarius"],
      lifeNumber:  [3, 6],
      chinese:     ["horse", "dragon", "pig"],
      thaiDay:     ["ศุกร์", "อาทิตย์"],
      baziElement: ["fire", "wood"],
    },
  },

  // ══════════════════════════════════
  // 🌿 สุขภาพ — เชิงบวก
  // ══════════════════════════════════
  health_positive: {
    "สุขภาพแข็งแรง": {
      western:     ["leo", "aries", "taurus"],
      lifeNumber:  [1, 4, 8],
      chinese:     ["tiger", "dragon", "horse"],
      thaiDay:     ["อาทิตย์", "อังคาร"],
      baziElement: ["fire", "earth"],
    },
    "ฟื้นตัวเร็ว": {
      western:     ["scorpio", "aries", "leo"],
      lifeNumber:  [9, 1],
      chinese:     ["tiger", "dragon", "snake"],
      thaiDay:     ["อาทิตย์", "อังคาร"],
      baziElement: ["fire"],
    },
  },

  // ══════════════════════════════════
  // 🌿 สุขภาพ — เชิงเตือน
  // ══════════════════════════════════
  health_warning: {
    "ระวังระบบย่อย": {
      western:     ["cancer", "virgo", "capricorn"],
      lifeNumber:  [2, 6, 4],
      chinese:     ["ox", "rooster", "dog"],
      thaiDay:     ["พุธ", "จันทร์", "เสาร์"],
      baziElement: ["earth"],
    },
    "ระวังหัวใจ": {
      western:     ["leo", "aries", "scorpio"],
      lifeNumber:  [1, 9],
      chinese:     ["tiger", "horse", "dragon"],
      thaiDay:     ["อาทิตย์", "อังคาร"],
      baziElement: ["fire"],
    },
    "ระวังความดัน": {
      western:     ["aries", "capricorn", "scorpio"],
      lifeNumber:  [1, 8, 9],
      chinese:     ["tiger", "dragon", "horse"],
      thaiDay:     ["อังคาร", "เสาร์"],
      baziElement: ["fire", "earth"],
    },
    "ระวังกระดูก": {
      western:     ["capricorn", "taurus", "virgo"],
      lifeNumber:  [4, 8],
      chinese:     ["ox", "dragon", "dog"],
      thaiDay:     ["เสาร์"],
      baziElement: ["earth"],
    },
    "ระวังความเครียด": {
      western:     ["virgo", "cancer", "gemini"],
      lifeNumber:  [7, 2],
      chinese:     ["rabbit", "pig", "monkey"],
      thaiDay:     ["พุธ", "จันทร์"],
      baziElement: ["water", "metal"],
    },
    "ระวังอุบัติเหตุ": {
      western:     ["aries", "scorpio", "sagittarius"],
      lifeNumber:  [9, 1, 5],
      chinese:     ["tiger", "horse", "dragon"],
      thaiDay:     ["อังคาร", "อาทิตย์"],
      baziElement: ["fire"],
    },
    "ระวังตับ": {
      western:     ["sagittarius", "pisces", "cancer"],
      lifeNumber:  [3, 9],
      chinese:     ["pig", "rooster", "tiger"],
      thaiDay:     ["พฤหัส", "จันทร์"],
      baziElement: ["wood", "water"],
    },
    "ระวังไต": {
      western:     ["libra", "aquarius", "cancer"],
      lifeNumber:  [6, 4],
      chinese:     ["rabbit", "pig", "rat"],
      thaiDay:     ["ศุกร์", "จันทร์"],
      baziElement: ["water"],
    },
  },

  // ══════════════════════════════════
  // ✨ โชคดี
  // ══════════════════════════════════
  lucky: {
    "สีแดงมงคล": {
      western:     ["aries", "leo", "scorpio"],
      lifeNumber:  [1, 9],
      chinese:     ["tiger", "horse", "dragon"],
      thaiDay:     ["อาทิตย์", "อังคาร"],
      baziElement: ["fire"],
    },
    "สีเหลืองมงคล": {
      western:     ["leo", "capricorn", "taurus"],
      lifeNumber:  [8, 4],
      chinese:     ["dragon", "ox", "dog"],
      thaiDay:     ["พฤหัส", "เสาร์"],
      baziElement: ["earth"],
    },
    "สีเขียวมงคล": {
      western:     ["taurus", "virgo", "cancer"],
      lifeNumber:  [4, 7],
      chinese:     ["rabbit", "tiger", "horse"],
      thaiDay:     ["พุธ", "ศุกร์"],
      baziElement: ["wood"],
    },
    "สีขาวมงคล": {
      western:     ["cancer", "virgo", "capricorn"],
      lifeNumber:  [2, 7],
      chinese:     ["rooster", "rabbit", "rat"],
      thaiDay:     ["จันทร์", "เสาร์"],
      baziElement: ["metal", "water"],
    },
    "สีส้มมงคล": {
      western:     ["leo", "sagittarius", "aries"],
      lifeNumber:  [3, 9],
      chinese:     ["horse", "tiger", "dragon"],
      thaiDay:     ["พฤหัส", "อาทิตย์"],
      baziElement: ["fire"],
    },
    "สีม่วงมงคล": {
      western:     ["scorpio", "pisces", "aquarius"],
      lifeNumber:  [7, 2],
      chinese:     ["snake", "pig", "rabbit"],
      thaiDay:     ["เสาร์", "จันทร์"],
      baziElement: ["water"],
    },
    "เลข 1 มงคล": {
      western:     ["aries", "leo"],
      lifeNumber:  [1],
      chinese:     ["tiger", "dragon"],
      thaiDay:     ["อาทิตย์"],
      baziElement: ["fire"],
    },
    "เลข 4 มงคล": {
      western:     ["taurus", "capricorn"],
      lifeNumber:  [4],
      chinese:     ["ox", "dragon"],
      thaiDay:     ["เสาร์"],
      baziElement: ["earth"],
    },
    "เลข 7 มงคล": {
      western:     ["cancer", "virgo", "pisces"],
      lifeNumber:  [7],
      chinese:     ["rabbit", "rooster"],
      thaiDay:     ["จันทร์", "พุธ"],
      baziElement: ["water", "metal"],
    },
    "เลข 8 มงคล": {
      western:     ["capricorn", "scorpio"],
      lifeNumber:  [8],
      chinese:     ["dragon", "ox"],
      thaiDay:     ["เสาร์"],
      baziElement: ["earth"],
    },
    "เลข 9 มงคล": {
      western:     ["aries", "scorpio", "sagittarius"],
      lifeNumber:  [9],
      chinese:     ["tiger", "horse"],
      thaiDay:     ["อังคาร", "พฤหัส"],
      baziElement: ["fire"],
    },
  },

  // ══════════════════════════════════
  // 🔮 อนาคต — เชิงบวก
  // ══════════════════════════════════
  future_positive: {
    "รุ่งโรจน์หลัง 35": {
      western:     ["capricorn", "scorpio", "taurus"],
      lifeNumber:  [4, 8],
      chinese:     ["ox", "dragon", "rooster"],
      thaiDay:     ["เสาร์", "พฤหัส"],
      baziElement: ["earth"],
    },
    "รุ่งโรจน์หลัง 40": {
      western:     ["capricorn", "taurus", "scorpio"],
      lifeNumber:  [8, 4],
      chinese:     ["ox", "rooster", "dragon"],
      thaiDay:     ["เสาร์"],
      baziElement: ["earth", "metal"],
    },
    "ประสบความสำเร็จสูง": {
      western:     ["leo", "capricorn", "scorpio"],
      lifeNumber:  [1, 8],
      chinese:     ["dragon", "tiger", "monkey"],
      thaiDay:     ["อาทิตย์", "เสาร์"],
      baziElement: ["fire", "earth"],
    },
    "มีชื่อเสียง": {
      western:     ["leo", "sagittarius", "aquarius"],
      lifeNumber:  [1, 3],
      chinese:     ["dragon", "horse", "monkey"],
      thaiDay:     ["อาทิตย์", "พุธ"],
      baziElement: ["fire"],
    },
    "ครอบครัวมั่นคง": {
      western:     ["cancer", "taurus", "capricorn"],
      lifeNumber:  [2, 4, 6],
      chinese:     ["ox", "pig", "rabbit"],
      thaiDay:     ["จันทร์", "ศุกร์", "เสาร์"],
      baziElement: ["earth", "water"],
    },
    "ได้รับการยอมรับ": {
      western:     ["libra", "capricorn", "leo"],
      lifeNumber:  [6, 8],
      chinese:     ["dragon", "ox", "horse"],
      thaiDay:     ["พฤหัส", "เสาร์"],
      baziElement: ["earth", "fire"],
    },
  },

  // ══════════════════════════════════
  // 🔮 อนาคต — เชิงเตือน
  // ══════════════════════════════════
  future_warning: {
    "ระวังช่วงอายุ 30-33": {
      western:     ["scorpio", "capricorn", "cancer"],
      lifeNumber:  [4, 8, 7],
      chinese:     ["ox", "rooster", "dog"],
      thaiDay:     ["เสาร์", "จันทร์"],
      baziElement: ["earth", "water"],
    },
    "ระวังการเปลี่ยนแปลงใหญ่": {
      western:     ["aquarius", "sagittarius", "uranus"],
      lifeNumber:  [5, 9],
      chinese:     ["horse", "monkey", "tiger"],
      thaiDay:     ["พุธ", "อาทิตย์"],
      baziElement: ["wood", "fire"],
    },
    "ระวังคนรอบข้าง": {
      western:     ["scorpio", "gemini", "libra"],
      lifeNumber:  [7, 5],
      chinese:     ["monkey", "rooster", "snake"],
      thaiDay:     ["พุธ", "เสาร์"],
      baziElement: ["metal", "water"],
    },
  },

};

// ─── Export ───
if (typeof module !== 'undefined') {
  module.exports = { KEYWORDS, WESTERN_SIGNS, CHINESE_ZODIAC, THAI_DAY, BAZI_ELEMENTS };
}
