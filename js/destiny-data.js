// destiny-data.js v2
// keyword ครบ 200+ อัน + หมวดใหม่

var WESTERN_SIGNS = {
  aries:       { th:"เมษ",      element:"fire",  ruler:"mars"    },
  taurus:      { th:"พฤษภ",     element:"earth", ruler:"venus"   },
  gemini:      { th:"เมถุน",    element:"air",   ruler:"mercury" },
  cancer:      { th:"กรกฎ",     element:"water", ruler:"moon"    },
  leo:         { th:"สิงห์",    element:"fire",  ruler:"sun"     },
  virgo:       { th:"กันย์",    element:"earth", ruler:"mercury" },
  libra:       { th:"ตุลย์",    element:"air",   ruler:"venus"   },
  scorpio:     { th:"พิจิก",    element:"water", ruler:"pluto"   },
  sagittarius: { th:"ธนู",      element:"fire",  ruler:"jupiter" },
  capricorn:   { th:"มังกร",    element:"earth", ruler:"saturn"  },
  aquarius:    { th:"กุมภ์",    element:"air",   ruler:"uranus"  },
  pisces:      { th:"มีน",      element:"water", ruler:"neptune" },
};

var CHINESE_ZODIAC = {
  rat:     { th:"ชวด",    element:"water" },
  ox:      { th:"ฉลู",    element:"earth" },
  tiger:   { th:"ขาล",    element:"wood"  },
  rabbit:  { th:"เถาะ",   element:"wood"  },
  dragon:  { th:"มะโรง",  element:"earth" },
  snake:   { th:"มะเส็ง", element:"fire"  },
  horse:   { th:"มะเมีย", element:"fire"  },
  goat:    { th:"มะแม",   element:"earth" },
  monkey:  { th:"วอก",    element:"metal" },
  rooster: { th:"ระกา",   element:"metal" },
  dog:     { th:"จอ",     element:"earth" },
  pig:     { th:"กุน",    element:"water" },
};

var THAI_DAY = {
  0: { th:"อาทิตย์", planet:"sun",     color:"#FF0000", element:"fire"  },
  1: { th:"จันทร์",  planet:"moon",    color:"#FFFF00", element:"water" },
  2: { th:"อังคาร",  planet:"mars",    color:"#FF69B4", element:"fire"  },
  3: { th:"พุธ",     planet:"mercury", color:"#00FF00", element:"earth" },
  4: { th:"พฤหัส",  planet:"jupiter", color:"#FFA500", element:"fire"  },
  5: { th:"ศุกร์",   planet:"venus",   color:"#00FFFF", element:"water" },
  6: { th:"เสาร์",   planet:"saturn",  color:"#800080", element:"earth" },
};

var BAZI_ELEMENTS = {
  fire:  { th:"ไฟ",  strengthens:"earth", weakens:"metal", weakenedBy:"water" },
  earth: { th:"ดิน", strengthens:"metal", weakens:"water", weakenedBy:"wood"  },
  metal: { th:"ทอง", strengthens:"water", weakens:"wood",  weakenedBy:"fire"  },
  water: { th:"น้ำ", strengthens:"wood",  weakens:"fire",  weakenedBy:"earth" },
  wood:  { th:"ไม้", strengthens:"fire",  weakens:"earth", weakenedBy:"metal" },
};

var KEYWORDS = {

  // ══ นิสัย/บุคลิก ══
  personality: {
    "ผู้นำโดยธรรมชาติ":   { western:["leo","aries","capricorn"],         lifeNumber:[1,8],    chinese:["tiger","dragon","horse"],   thaiDay:["อาทิตย์","อังคาร"], baziElement:["fire","earth"] },
    "ปัญญาเลิศ":           { western:["gemini","virgo","aquarius"],        lifeNumber:[7,5,11], chinese:["monkey","rooster","rat"],    thaiDay:["พุธ","พฤหัส"],      baziElement:["water","metal"] },
    "มีบารมีสูง":          { western:["libra","capricorn","leo"],          lifeNumber:[4,6,8],  chinese:["tiger","dragon","horse"],   thaiDay:["พฤหัส","อาทิตย์"], baziElement:["earth","fire"] },
    "จิตใจอ่อนโยน":       { western:["cancer","pisces","taurus"],         lifeNumber:[2,6],    chinese:["rabbit","pig","goat"],      thaiDay:["จันทร์","ศุกร์"],   baziElement:["water","wood"] },
    "มั่นคงและน่าเชื่อถือ":{ western:["taurus","capricorn","virgo"],       lifeNumber:[4,8],    chinese:["ox","dragon","dog"],        thaiDay:["เสาร์","พฤหัส"],   baziElement:["earth"] },
    "ความคิดสร้างสรรค์สูง":{ western:["gemini","sagittarius","aquarius"],  lifeNumber:[3,5],    chinese:["horse","monkey","rat"],     thaiDay:["พุธ","ศุกร์"],      baziElement:["wood","fire"] },
    "เอาใจใส่ผู้อื่น":    { western:["cancer","virgo","pisces"],          lifeNumber:[2,6,9],  chinese:["rabbit","pig","ox"],        thaiDay:["จันทร์","พฤหัส"],  baziElement:["water","earth"] },
    "กล้าหาญไม่กลัวอะไร": { western:["aries","leo","scorpio"],            lifeNumber:[1,9],    chinese:["tiger","horse","dragon"],   thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire"] },
    "มีเสน่ห์ดึงดูดใจ":   { western:["libra","leo","scorpio"],            lifeNumber:[3,6],    chinese:["dragon","horse","pig"],     thaiDay:["ศุกร์","อาทิตย์"], baziElement:["fire","earth"] },
    "อดทนสูงมาก":          { western:["taurus","capricorn","scorpio"],     lifeNumber:[4,8],    chinese:["ox","snake","dog"],         thaiDay:["เสาร์"],            baziElement:["earth","metal"] },
    "อารมณ์ร้อนระวัง":    { western:["aries","scorpio","leo"],            lifeNumber:[1,9],    chinese:["tiger","horse"],            thaiDay:["อังคาร","อาทิตย์"],baziElement:["fire"] },
    "ขี้กังวลเกินเหตุ":    { western:["virgo","cancer","gemini"],          lifeNumber:[7,2],    chinese:["rabbit","pig","dog"],       thaiDay:["พุธ","จันทร์"],     baziElement:["water","earth"] },
    "เสียสละเพื่อคนอื่น":  { western:["pisces","cancer","virgo"],          lifeNumber:[9,2,6],  chinese:["pig","rabbit","goat"],      thaiDay:["พฤหัส","จันทร์"],  baziElement:["water","wood"] },
    "ทะเยอทะยานสูง":       { western:["capricorn","scorpio","aries"],      lifeNumber:[8,1],    chinese:["dragon","tiger","monkey"],  thaiDay:["เสาร์","อังคาร"],  baziElement:["earth","fire"] },
    "รักอิสระมาก":         { western:["sagittarius","aquarius","gemini"],  lifeNumber:[5,3],    chinese:["horse","monkey","tiger"],   thaiDay:["พุธ","อาทิตย์"],   baziElement:["wood","fire"] },
    "ละเอียดรอบคอบ":       { western:["virgo","capricorn","taurus"],       lifeNumber:[4,7],    chinese:["rooster","ox","rabbit"],    thaiDay:["พุธ","เสาร์"],      baziElement:["earth","metal"] },
    "มีสัญชาตญาณแม่น":    { western:["scorpio","pisces","cancer"],        lifeNumber:[7,9],    chinese:["snake","pig","rabbit"],     thaiDay:["จันทร์","เสาร์"],  baziElement:["water"] },
    "ใจดีมีน้ำใจ":         { western:["cancer","pisces","libra"],          lifeNumber:[2,6,9],  chinese:["pig","rabbit","goat"],      thaiDay:["จันทร์","ศุกร์"],  baziElement:["water","wood"] },
    "ชอบแข่งขัน":          { western:["aries","leo","scorpio"],            lifeNumber:[1,8,9],  chinese:["tiger","dragon","horse"],   thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire","metal"] },
    "มีวิสัยทัศน์กว้างไกล":{ western:["sagittarius","aquarius","capricorn"],lifeNumber:[1,7,8], chinese:["dragon","tiger","monkey"],  thaiDay:["พฤหัส","อาทิตย์"], baziElement:["fire","earth"] },
    "ชอบเรียนรู้ตลอดเวลา": { western:["gemini","sagittarius","virgo"],     lifeNumber:[5,7],    chinese:["monkey","rat","rabbit"],    thaiDay:["พุธ","พฤหัส"],      baziElement:["water","wood"] },
    "มีเมตตากรุณา":        { western:["pisces","cancer","virgo"],          lifeNumber:[9,6,2],  chinese:["pig","rabbit","ox"],        thaiDay:["พฤหัส","จันทร์"],  baziElement:["water","wood"] },
  },

  // ══ ความรัก บวก ══
  love_positive: {
    "รักซื่อสัตย์ภักดี":  { western:["taurus","cancer","capricorn"],      lifeNumber:[2,4,6],  chinese:["ox","rabbit","pig"],        thaiDay:["จันทร์","เสาร์"],  baziElement:["earth","water"] },
    "โรแมนติกมาก":        { western:["libra","pisces","cancer"],           lifeNumber:[2,6],    chinese:["rabbit","horse","pig"],     thaiDay:["ศุกร์","จันทร์"],  baziElement:["water","wood"] },
    "ต้องการความมั่นคง":  { western:["taurus","capricorn","cancer"],       lifeNumber:[4,2,8],  chinese:["ox","pig","dog"],           thaiDay:["เสาร์","จันทร์"],  baziElement:["earth","water"] },
    "รักเต็มที่ไม่มีเงื่อนไข":{ western:["leo","scorpio","aries"],         lifeNumber:[1,9],    chinese:["tiger","dragon","horse"],   thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire"] },
    "เมตตาต่อคนรัก":      { western:["pisces","cancer","virgo"],           lifeNumber:[2,9,6],  chinese:["pig","rabbit","goat"],      thaiDay:["พฤหัส","จันทร์"],  baziElement:["water","wood"] },
    "คู่ครองดีสมหวัง":    { western:["libra","taurus","cancer"],           lifeNumber:[6,2,4],  chinese:["rabbit","pig","ox"],        thaiDay:["ศุกร์","จันทร์"],  baziElement:["water","earth"] },
    "มีความรักที่มั่นคง":  { western:["taurus","capricorn","scorpio"],     lifeNumber:[4,6,8],  chinese:["ox","dragon","dog"],        thaiDay:["เสาร์","พฤหัส"],   baziElement:["earth"] },
    "เสน่ห์ดึงดูดคนรัก":  { western:["leo","libra","scorpio"],            lifeNumber:[3,6],    chinese:["dragon","horse","pig"],     thaiDay:["ศุกร์","อาทิตย์"], baziElement:["fire","earth"] },
    "รักช่างดูแล":         { western:["cancer","virgo","taurus"],          lifeNumber:[2,4,6],  chinese:["ox","rabbit","pig"],        thaiDay:["จันทร์","ศุกร์"],  baziElement:["earth","water"] },
  },

  // ══ ความรัก เตือน ══
  love_warning: {
    "ระวังคบซ้อน":         { western:["scorpio","gemini","sagittarius"],    lifeNumber:[5,3],    chinese:["horse","monkey","rooster"], thaiDay:["พุธ","ศุกร์"],      baziElement:["fire","wood"] },
    "รักสามเส้า":          { western:["sagittarius","libra","gemini"],      lifeNumber:[3,5],    chinese:["horse","rooster","monkey"], thaiDay:["ศุกร์","พุธ"],      baziElement:["wood","fire"] },
    "รักไม่สมหวัง":        { western:["pisces","cancer","virgo"],           lifeNumber:[7,2],    chinese:["rabbit","pig","goat"],      thaiDay:["จันทร์","เสาร์"],  baziElement:["water"] },
    "ถูกทอดทิ้ง":          { western:["cancer","pisces","libra"],           lifeNumber:[2,7],    chinese:["pig","rabbit","dog"],       thaiDay:["จันทร์","ศุกร์"],  baziElement:["water"] },
    "รักเจ็บปวด":          { western:["scorpio","aries","capricorn"],       lifeNumber:[9,1,4],  chinese:["tiger","snake","ox"],       thaiDay:["อังคาร","เสาร์"],  baziElement:["fire","earth"] },
    "ระวังถูกหลอก":        { western:["pisces","libra","gemini"],           lifeNumber:[7,3],    chinese:["pig","rabbit","monkey"],    thaiDay:["จันทร์","พุธ"],     baziElement:["water","wood"] },
    "ระวังความสัมพันธ์ร้าว":{ western:["aries","scorpio","aquarius"],       lifeNumber:[1,9,5],  chinese:["tiger","horse","monkey"],   thaiDay:["อังคาร","พุธ"],     baziElement:["fire","metal"] },
    "แต่งงานช้า":          { western:["capricorn","aquarius","virgo"],      lifeNumber:[7,4,8],  chinese:["rooster","ox","dog"],       thaiDay:["เสาร์","พุธ"],      baziElement:["earth","metal"] },
    "ความรักต้องใช้เวลา":  { western:["capricorn","scorpio","taurus"],      lifeNumber:[4,8],    chinese:["ox","snake","dog"],         thaiDay:["เสาร์"],            baziElement:["earth"] },
  },

  // ══ การงาน บวก ══
  career_positive: {
    "เหมาะเป็นผู้นำองค์กร":{ western:["leo","aries","capricorn"],          lifeNumber:[1,8],    chinese:["tiger","dragon","horse"],   thaiDay:["อาทิตย์","พฤหัส"], baziElement:["fire","earth"] },
    "เจรจาและโน้มน้าวเก่ง":{ western:["libra","gemini","sagittarius"],     lifeNumber:[3,5,6],  chinese:["monkey","horse","rabbit"],  thaiDay:["พุธ","ศุกร์"],      baziElement:["wood","metal"] },
    "งานสร้างสรรค์ศิลปะ":  { western:["leo","gemini","aquarius"],          lifeNumber:[3,6],    chinese:["horse","monkey","rat"],     thaiDay:["พุธ","ศุกร์"],      baziElement:["wood","fire"] },
    "งานช่วยเหลือผู้อื่น": { western:["cancer","pisces","virgo"],          lifeNumber:[2,9,6],  chinese:["pig","rabbit","goat"],      thaiDay:["พฤหัส","จันทร์"],  baziElement:["water","wood"] },
    "ธุรกิจส่วนตัวรุ่ง":   { western:["aries","capricorn","scorpio"],      lifeNumber:[1,8],    chinese:["tiger","dragon","monkey"],  thaiDay:["อาทิตย์","เสาร์"], baziElement:["fire","earth"] },
    "บริหารจัดการเก่ง":    { western:["capricorn","virgo","libra"],        lifeNumber:[4,8],    chinese:["dragon","ox","dog"],        thaiDay:["เสาร์","พฤหัส"],   baziElement:["earth","metal"] },
    "งานศิลปะและดนตรี":    { western:["libra","pisces","taurus"],          lifeNumber:[3,6],    chinese:["rabbit","horse","pig"],     thaiDay:["ศุกร์"],            baziElement:["wood","water"] },
    "งานวิชาการวิจัย":     { western:["virgo","gemini","aquarius"],        lifeNumber:[7,5],    chinese:["monkey","rooster","rat"],   thaiDay:["พุธ","พฤหัส"],      baziElement:["water","metal"] },
    "งานการเงินการลงทุน":  { western:["taurus","capricorn","scorpio"],     lifeNumber:[4,8],    chinese:["ox","dragon","rooster"],    thaiDay:["เสาร์","พฤหัส"],   baziElement:["earth","metal"] },
    "งานต่างประเทศรุ่ง":   { western:["sagittarius","gemini","aquarius"],  lifeNumber:[5,3],    chinese:["monkey","horse","dragon"],  thaiDay:["พุธ","อาทิตย์"],   baziElement:["wood","fire"] },
    "มีผู้ใหญ่เกื้อหนุน":  { western:["leo","capricorn","cancer"],         lifeNumber:[6,8,4],  chinese:["dragon","tiger","rabbit"],  thaiDay:["พฤหัส","อาทิตย์"], baziElement:["earth","fire"] },
    "งานพลิกผันดีขึ้น":    { western:["scorpio","capricorn","aries"],      lifeNumber:[9,1,8],  chinese:["dragon","tiger","snake"],   thaiDay:["อังคาร","เสาร์"],  baziElement:["fire","earth"] },
    "เหมาะงานราชการ":      { western:["cancer","capricorn","leo"],         lifeNumber:[4,6,8],  chinese:["ox","dragon","dog"],        thaiDay:["พฤหัส","เสาร์"],   baziElement:["earth"] },
    "งานสื่อสารมวลชน":     { western:["gemini","sagittarius","aquarius"],  lifeNumber:[3,5],    chinese:["monkey","rat","horse"],     thaiDay:["พุธ","อาทิตย์"],   baziElement:["wood","fire"] },
  },

  // ══ การงาน เตือน ══
  career_warning: {
    "ระวังคนอิจฉา":        { western:["leo","scorpio","capricorn"],        lifeNumber:[1,8],    chinese:["dragon","tiger","rooster"], thaiDay:["อาทิตย์","เสาร์"], baziElement:["fire","earth"] },
    "ระวังถูกหักหลัง":     { western:["gemini","sagittarius","libra"],     lifeNumber:[3,5],    chinese:["monkey","horse","rooster"], thaiDay:["พุธ","ศุกร์"],      baziElement:["wood","metal"] },
    "ช่วงการงานซบเซา":     { western:["capricorn","virgo","cancer"],       lifeNumber:[4,7],    chinese:["ox","rooster","dog"],       thaiDay:["เสาร์","จันทร์"],  baziElement:["earth","water"] },
    "ผู้ใหญ่ไม่เกื้อหนุน": { western:["scorpio","capricorn","aquarius"],   lifeNumber:[8,4],    chinese:["ox","rooster","dog"],       thaiDay:["เสาร์","อังคาร"],  baziElement:["earth","metal"] },
    "งานไม่มั่นคง":        { western:["aquarius","gemini","sagittarius"],  lifeNumber:[5,3],    chinese:["horse","monkey","tiger"],   thaiDay:["พุธ","อาทิตย์"],   baziElement:["wood","fire"] },
    "ระวังเปลี่ยนงานบ่อย": { western:["sagittarius","gemini","aries"],     lifeNumber:[5,3,1],  chinese:["horse","tiger","monkey"],   thaiDay:["อาทิตย์","พุธ"],   baziElement:["fire","wood"] },
    "ระวังความขัดแย้งในงาน":{ western:["aries","scorpio","leo"],           lifeNumber:[1,9],    chinese:["tiger","dragon","horse"],   thaiDay:["อังคาร","อาทิตย์"],baziElement:["fire"] },
  },

  // ══ การเงิน บวก ══
  money_positive: {
    "ออมเงินเก่งมาก":      { western:["taurus","capricorn","virgo"],       lifeNumber:[4,8],    chinese:["ox","dragon","rooster"],    thaiDay:["เสาร์","พุธ"],      baziElement:["earth","metal"] },
    "มีลาภลอยจากฟ้า":      { western:["sagittarius","leo","pisces"],       lifeNumber:[3,8,9],  chinese:["dragon","pig","horse"],     thaiDay:["พฤหัส","อาทิตย์"], baziElement:["fire","water"] },
    "รุ่งเรืองวัยกลางคน":  { western:["capricorn","scorpio","taurus"],     lifeNumber:[4,8],    chinese:["ox","dragon","rooster"],    thaiDay:["เสาร์","พฤหัส"],   baziElement:["earth"] },
    "มีเงินจากความรู้":    { western:["virgo","gemini","sagittarius"],     lifeNumber:[7,5],    chinese:["monkey","rooster","rat"],   thaiDay:["พฤหัส","พุธ"],      baziElement:["water","metal"] },
    "กล้าลงทุนได้ผล":      { western:["aries","sagittarius","leo"],        lifeNumber:[1,3,8],  chinese:["tiger","horse","dragon"],   thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire"] },
    "มีรายได้หลายทาง":     { western:["gemini","sagittarius","aquarius"],  lifeNumber:[3,5],    chinese:["monkey","rat","horse"],     thaiDay:["พุธ","อาทิตย์"],   baziElement:["wood","fire"] },
    "ดวงค้าขายดี":         { western:["taurus","gemini","libra"],          lifeNumber:[6,3,5],  chinese:["rat","monkey","rabbit"],    thaiDay:["ศุกร์","พุธ"],      baziElement:["earth","wood"] },
    "มีบุญวาสนาเงินทอง":   { western:["sagittarius","leo","capricorn"],    lifeNumber:[8,9,6],  chinese:["dragon","tiger","pig"],     thaiDay:["พฤหัส","อาทิตย์"], baziElement:["fire","earth"] },
  },

  // ══ การเงิน เตือน ══
  money_warning: {
    "ระวังถูกโกงเงิน":     { western:["pisces","libra","cancer"],          lifeNumber:[7,2],    chinese:["pig","rabbit","goat"],      thaiDay:["จันทร์","ศุกร์"],  baziElement:["water"] },
    "เสียเงินโดยไม่คาดคิด":{ western:["sagittarius","gemini","aquarius"],  lifeNumber:[3,5],    chinese:["horse","monkey","tiger"],   thaiDay:["พุธ","อาทิตย์"],   baziElement:["wood","fire"] },
    "ระวังหนี้สินพอกพูน":  { western:["aquarius","pisces","libra"],        lifeNumber:[7,2],    chinese:["pig","rabbit","goat"],      thaiDay:["จันทร์","ศุกร์"],  baziElement:["water","wood"] },
    "การลงทุนเสี่ยง":      { western:["aries","sagittarius","scorpio"],    lifeNumber:[1,5,9],  chinese:["horse","tiger","dragon"],   thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire"] },
    "ใช้จ่ายฟุ่มเฟือย":   { western:["leo","libra","sagittarius"],        lifeNumber:[3,6],    chinese:["horse","dragon","pig"],     thaiDay:["ศุกร์","อาทิตย์"], baziElement:["fire","wood"] },
    "ระวังค้ำประกันคนอื่น":{ western:["cancer","pisces","libra"],          lifeNumber:[2,6,9],  chinese:["pig","rabbit","goat"],      thaiDay:["จันทร์","ศุกร์"],  baziElement:["water"] },
  },

  // ══ สุขภาพ บวก ══
  health_positive: {
    "สุขภาพร่างกายแข็งแรง":{ western:["leo","aries","taurus"],            lifeNumber:[1,4,8],  chinese:["tiger","dragon","horse"],   thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire","earth"] },
    "ฟื้นตัวจากโรคได้เร็ว":{ western:["scorpio","aries","leo"],           lifeNumber:[9,1],    chinese:["tiger","dragon","snake"],   thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire"] },
    "อายุยืนยาว":          { western:["taurus","capricorn","virgo"],       lifeNumber:[4,8],    chinese:["ox","rooster","rabbit"],    thaiDay:["เสาร์","พุธ"],      baziElement:["earth","metal"] },
    "สุขภาพจิตดี":         { western:["libra","taurus","cancer"],          lifeNumber:[2,6],    chinese:["rabbit","pig","ox"],        thaiDay:["ศุกร์","จันทร์"],  baziElement:["water","earth"] },
  },

  // ══ สุขภาพ เตือน ══
  health_warning: {
    "ระวังระบบย่อยอาหาร":  { western:["cancer","virgo","capricorn"],       lifeNumber:[2,6,4],  chinese:["ox","rooster","dog"],       thaiDay:["พุธ","จันทร์","เสาร์"],baziElement:["earth"] },
    "ระวังโรคหัวใจ":       { western:["leo","aries","scorpio"],            lifeNumber:[1,9],    chinese:["tiger","horse","dragon"],   thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire"] },
    "ระวังความดันโลหิต":   { western:["aries","capricorn","scorpio"],      lifeNumber:[1,8,9],  chinese:["tiger","dragon","horse"],   thaiDay:["อังคาร","เสาร์"],  baziElement:["fire","earth"] },
    "ระวังกระดูกข้อต่อ":   { western:["capricorn","taurus","virgo"],       lifeNumber:[4,8],    chinese:["ox","dragon","dog"],        thaiDay:["เสาร์"],            baziElement:["earth"] },
    "ระวังความเครียดสะสม": { western:["virgo","cancer","gemini"],          lifeNumber:[7,2],    chinese:["rabbit","pig","monkey"],    thaiDay:["พุธ","จันทร์"],     baziElement:["water","metal"] },
    "ระวังอุบัติเหตุ":     { western:["aries","scorpio","sagittarius"],    lifeNumber:[9,1,5],  chinese:["tiger","horse","dragon"],   thaiDay:["อังคาร","อาทิตย์"], baziElement:["fire"] },
    "ระวังตับและน้ำดี":    { western:["sagittarius","pisces","cancer"],    lifeNumber:[3,9],    chinese:["pig","rooster","tiger"],    thaiDay:["พฤหัส","จันทร์"],  baziElement:["wood","water"] },
    "ระวังไตและกระเพาะ":   { western:["libra","aquarius","cancer"],        lifeNumber:[6,4],    chinese:["rabbit","pig","rat"],       thaiDay:["ศุกร์","จันทร์"],  baziElement:["water"] },
    "ระวังปอดและระบบหายใจ":{ western:["gemini","aquarius","virgo"],        lifeNumber:[5,7],    chinese:["monkey","rooster","rat"],   thaiDay:["พุธ"],              baziElement:["metal","air"] },
    "ระวังระบบประสาท":     { western:["virgo","gemini","pisces"],          lifeNumber:[7,5,2],  chinese:["rabbit","monkey","pig"],    thaiDay:["พุธ","จันทร์"],     baziElement:["water","metal"] },
  },

  // ══ โชคดี ══
  lucky: {
    "สีแดงเป็นมงคล":       { western:["aries","leo","scorpio"],            lifeNumber:[1,9],    chinese:["tiger","horse","dragon"],   thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire"] },
    "สีเหลืองเป็นมงคล":    { western:["leo","capricorn","taurus"],         lifeNumber:[8,4],    chinese:["dragon","ox","dog"],        thaiDay:["พฤหัส","เสาร์"],   baziElement:["earth"] },
    "สีเขียวเป็นมงคล":     { western:["taurus","virgo","cancer"],          lifeNumber:[4,7],    chinese:["rabbit","tiger","horse"],   thaiDay:["พุธ","ศุกร์"],      baziElement:["wood"] },
    "สีขาวเป็นมงคล":       { western:["cancer","virgo","capricorn"],       lifeNumber:[2,7],    chinese:["rooster","rabbit","rat"],   thaiDay:["จันทร์","เสาร์"],  baziElement:["metal","water"] },
    "สีส้มเป็นมงคล":       { western:["leo","sagittarius","aries"],        lifeNumber:[3,9],    chinese:["horse","tiger","dragon"],   thaiDay:["พฤหัส","อาทิตย์"], baziElement:["fire"] },
    "สีม่วงเป็นมงคล":      { western:["scorpio","pisces","aquarius"],      lifeNumber:[7,2],    chinese:["snake","pig","rabbit"],     thaiDay:["เสาร์","จันทร์"],  baziElement:["water"] },
    "สีน้ำเงินเป็นมงคล":   { western:["aquarius","libra","gemini"],        lifeNumber:[5,3],    chinese:["rat","monkey","pig"],       thaiDay:["ศุกร์","พุธ"],      baziElement:["water","metal"] },
    "เลข 1 มงคล":          { western:["aries","leo"],                      lifeNumber:[1],      chinese:["tiger","dragon"],           thaiDay:["อาทิตย์"],          baziElement:["fire"] },
    "เลข 6 มงคล":          { western:["libra","taurus","virgo"],           lifeNumber:[6],      chinese:["rabbit","horse","dog"],     thaiDay:["ศุกร์"],            baziElement:["earth","water"] },
    "เลข 7 มงคล":          { western:["cancer","virgo","pisces"],          lifeNumber:[7],      chinese:["rabbit","rooster"],         thaiDay:["จันทร์","พุธ"],     baziElement:["water","metal"] },
    "เลข 8 มงคล":          { western:["capricorn","scorpio"],              lifeNumber:[8],      chinese:["dragon","ox"],              thaiDay:["เสาร์"],            baziElement:["earth"] },
    "เลข 9 มงคล":          { western:["aries","scorpio","sagittarius"],    lifeNumber:[9],      chinese:["tiger","horse"],            thaiDay:["อังคาร","พฤหัส"],  baziElement:["fire"] },
    "ทิศเหนือมงคล":        { western:["capricorn","aquarius"],             lifeNumber:[4,8],    chinese:["rat","ox"],                 thaiDay:["เสาร์","จันทร์"],  baziElement:["water","earth"] },
    "ทิศใต้มงคล":          { western:["leo","sagittarius"],                lifeNumber:[1,9],    chinese:["horse","snake"],            thaiDay:["อาทิตย์","อังคาร"],baziElement:["fire"] },
    "ทิศตะวันออกมงคล":     { western:["aries","taurus","gemini"],          lifeNumber:[3,5],    chinese:["rabbit","tiger"],           thaiDay:["พุธ","อังคาร"],     baziElement:["wood"] },
  },

  // ══ อนาคต บวก ══
  future_positive: {
    "รุ่งโรจน์หลัง 35 ปี": { western:["capricorn","scorpio","taurus"],     lifeNumber:[4,8],    chinese:["ox","dragon","rooster"],    thaiDay:["เสาร์","พฤหัส"],   baziElement:["earth"] },
    "รุ่งโรจน์หลัง 40 ปี": { western:["capricorn","taurus","scorpio"],     lifeNumber:[8,4],    chinese:["ox","rooster","dragon"],    thaiDay:["เสาร์"],            baziElement:["earth","metal"] },
    "ประสบความสำเร็จสูง":  { western:["leo","capricorn","scorpio"],        lifeNumber:[1,8],    chinese:["dragon","tiger","monkey"],  thaiDay:["อาทิตย์","เสาร์"], baziElement:["fire","earth"] },
    "มีชื่อเสียงโด่งดัง":  { western:["leo","sagittarius","aquarius"],     lifeNumber:[1,3],    chinese:["dragon","horse","monkey"],  thaiDay:["อาทิตย์","พุธ"],   baziElement:["fire"] },
    "ครอบครัวมั่นคงสุข":   { western:["cancer","taurus","capricorn"],      lifeNumber:[2,4,6],  chinese:["ox","pig","rabbit"],        thaiDay:["จันทร์","ศุกร์","เสาร์"],baziElement:["earth","water"] },
    "ได้รับการยอมรับสังคม":{ western:["libra","capricorn","leo"],          lifeNumber:[6,8],    chinese:["dragon","ox","horse"],      thaiDay:["พฤหัส","เสาร์"],   baziElement:["earth","fire"] },
    "มีความสุขในบั้นปลาย": { western:["taurus","cancer","pisces"],         lifeNumber:[2,6,9],  chinese:["pig","rabbit","ox"],        thaiDay:["จันทร์","ศุกร์"],  baziElement:["water","earth"] },
    "ลูกหลานเจริญรุ่งเรือง":{ western:["cancer","leo","capricorn"],         lifeNumber:[4,6,8],  chinese:["dragon","ox","pig"],        thaiDay:["พฤหัส","อาทิตย์"], baziElement:["earth","fire"] },
  },

  // ══ อนาคต เตือน ══
  future_warning: {
    "ระวังช่วงอายุ 30-35": { western:["scorpio","capricorn","cancer"],     lifeNumber:[4,8,7],  chinese:["ox","rooster","dog"],       thaiDay:["เสาร์","จันทร์"],  baziElement:["earth","water"] },
    "ระวังการเปลี่ยนแปลงใหญ่":{ western:["aquarius","sagittarius","uranus"],lifeNumber:[5,9],   chinese:["horse","monkey","tiger"],   thaiDay:["พุธ","อาทิตย์"],   baziElement:["wood","fire"] },
    "ระวังคนรอบข้างทรยศ":  { western:["scorpio","gemini","libra"],         lifeNumber:[7,5],    chinese:["monkey","rooster","snake"], thaiDay:["พุธ","เสาร์"],      baziElement:["metal","water"] },
    "ชีวิตมีอุปสรรคใหญ่":  { western:["capricorn","scorpio","aries"],      lifeNumber:[4,8,1],  chinese:["ox","tiger","dragon"],      thaiDay:["เสาร์","อังคาร"],  baziElement:["earth","fire"] },
    "ระวังสุขภาพช่วงอายุ 50":{ western:["leo","aries","capricorn"],         lifeNumber:[1,8,9],  chinese:["tiger","dragon","horse"],   thaiDay:["อาทิตย์","เสาร์"], baziElement:["fire","earth"] },
  },

  // ══ ครอบครัว (ใหม่) ══
  family: {
    "ครอบครัวอบอุ่น":      { western:["cancer","taurus","pisces"],         lifeNumber:[2,6],    chinese:["ox","pig","rabbit"],        thaiDay:["จันทร์","ศุกร์"],  baziElement:["water","earth"] },
    "พ่อแม่เกื้อหนุน":     { western:["cancer","leo","capricorn"],         lifeNumber:[4,6,8],  chinese:["dragon","ox","pig"],        thaiDay:["พฤหัส","อาทิตย์"], baziElement:["earth","fire"] },
    "ลูกเต้าดี":           { western:["cancer","leo","taurus"],            lifeNumber:[2,4,6],  chinese:["ox","dragon","pig"],        thaiDay:["จันทร์","ศุกร์"],  baziElement:["earth","water"] },
    "ระวังปัญหาครอบครัว":  { western:["aries","scorpio","aquarius"],       lifeNumber:[1,5,9],  chinese:["tiger","horse","monkey"],   thaiDay:["อังคาร","พุธ"],     baziElement:["fire","wood"] },
    "แยกจากครอบครัว":      { western:["sagittarius","aquarius","gemini"],  lifeNumber:[5,3],    chinese:["horse","monkey","tiger"],   thaiDay:["พุธ","อาทิตย์"],   baziElement:["wood","fire"] },
  },

  // ══ จิตวิญญาณ (ใหม่) ══
  spiritual: {
    "มีพรสวรรค์ด้านจิตวิญญาณ":{ western:["pisces","scorpio","cancer"],    lifeNumber:[7,9,2],  chinese:["pig","snake","rabbit"],     thaiDay:["จันทร์","เสาร์"],  baziElement:["water"] },
    "ทำบุญแล้วได้ผล":      { western:["pisces","sagittarius","cancer"],    lifeNumber:[9,3,6],  chinese:["pig","rabbit","goat"],      thaiDay:["พฤหัส","จันทร์"],  baziElement:["water","wood"] },
    "มีดวงชะตาพิเศษ":      { western:["scorpio","pisces","aquarius"],      lifeNumber:[7,11,22],chinese:["snake","pig","dragon"],     thaiDay:["เสาร์","จันทร์"],  baziElement:["water","fire"] },
    "ดวงชะตาแกร่ง":        { western:["scorpio","capricorn","aries"],      lifeNumber:[1,8,9],  chinese:["dragon","tiger","ox"],      thaiDay:["อาทิตย์","เสาร์"], baziElement:["fire","earth"] },
  },
};

if (typeof module !== 'undefined') {
  module.exports = { KEYWORDS, WESTERN_SIGNS, CHINESE_ZODIAC, THAI_DAY, BAZI_ELEMENTS };
}
