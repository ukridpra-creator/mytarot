// oracle-luck-data.js — ระบบไพ่วัดพลังโชคลาภ (Triple Fortune) 30 ใบ, ฟรี ไม่ใช้ API
// คะแนนเต็ม = 100+90+85 = 275 (ทางเลือก A) ปัดเศษ % ตอนแสดงผล

var LUCK_MAX_SCORE = 275;

var LUCK_CARDS = [
  // 🌑 THE TAKERS (ติดลบ)
  { id:1,  name:'THE DEVOURER',     nameTh:'ผู้เขมือบกลืน',      faction:'takers',  score:-50, meaning:'พลังแห่งการเขมือบกลืนทุกสิ่ง เงินทองและโอกาสกำลังถูกดูดหายไปอย่างรุนแรง ควรระวังการสูญเสียครั้งใหญ่ค่ะ' },
  { id:2,  name:'THE DEBT LORD',    nameTh:'เจ้าแห่งหนี้สิน',     faction:'takers',  score:-45, meaning:'ภาระหนี้สินและพันธะที่ต้องชดใช้กำลังกดทับอยู่ ควรวางแผนจัดการหนี้สินอย่างรอบคอบค่ะ' },
  { id:3,  name:'THE VOID',         nameTh:'ความว่างเปล่า',      faction:'takers',  score:-40, meaning:'ความว่างเปล่าและการขาดหายไปของโอกาส สิ่งที่เคยมีอาจเลือนหายไปในช่วงนี้ค่ะ' },
  { id:4,  name:'THE THIEF',        nameTh:'โจร',               faction:'takers',  score:-35, meaning:'ระวังการถูกฉกฉวยผลประโยชน์หรือถูกเอาเปรียบโดยไม่รู้ตัวค่ะ' },
  { id:5,  name:'THE BROKEN VESSEL',nameTh:'ภาชนะแตกร้าว',      faction:'takers',  score:-30, meaning:'ภาชนะที่แตกร้าวไม่สามารถกักเก็บทรัพย์สินไว้ได้เต็มที่ เงินอาจรั่วไหลออกไปเรื่อยๆ ค่ะ' },
  { id:6,  name:'THE HUNGER',       nameTh:'ความหิวโหย',        faction:'takers',  score:-25, meaning:'ความต้องการที่ไม่มีวันเต็มอิ่ม อาจนำไปสู่การใช้จ่ายเกินตัวค่ะ' },
  { id:7,  name:'THE LEAK',         nameTh:'รอยรั่ว',           faction:'takers',  score:-20, meaning:'มีรอยรั่วเล็กๆ ที่ทำให้เงินทองไหลออกทีละนิด ควรตรวจสอบรายจ่ายที่ไม่จำเป็นค่ะ' },
  { id:8,  name:'THE SHADOW',       nameTh:'เงามืด',            faction:'takers',  score:-15, meaning:'มีบางสิ่งที่ซ่อนอยู่เบื้องหลังซึ่งอาจส่งผลลบเล็กน้อยต่อสถานการณ์การเงินค่ะ' },
  { id:9,  name:'THE MOTH',         nameTh:'ผีเสื้อกลางคืน',    faction:'takers',  score:-10, meaning:'การกัดกร่อนเล็กๆ น้อยๆ ที่สะสมไปเรื่อยๆ ควรใส่ใจรายละเอียดเล็กๆ ที่มองข้ามไปค่ะ' },
  { id:10, name:'THE TOLL',         nameTh:'ค่าผ่านทาง',        faction:'takers',  score:-5,  meaning:'มีค่าใช้จ่ายเล็กน้อยที่ต้องจ่ายออกไปเพื่อผ่านด่านบางอย่าง ไม่รุนแรงมากค่ะ' },

  // 🌗 THE WEAVERS (กลาง)
  { id:11, name:'THE BALANCE',      nameTh:'ความสมดุล',         faction:'weavers', score:0,   meaning:'พลังงานอยู่ในจุดสมดุล ยังไม่เอียงไปทางบวกหรือลบ ทุกอย่างขึ้นอยู่กับการตัดสินใจต่อจากนี้ค่ะ' },
  { id:12, name:'THE FIRST THREAD', nameTh:'เส้นด้ายเส้นแรก',    faction:'weavers', score:5,   meaning:'จุดเริ่มต้นเล็กๆ ของโอกาสใหม่กำลังก่อตัวขึ้นค่ะ' },
  { id:13, name:'THE SPARK',        nameTh:'ประกายไฟ',          faction:'weavers', score:10,  meaning:'ประกายความคิดหรือไอเดียเล็กๆ ที่อาจนำไปสู่โอกาสทางการเงินได้ค่ะ' },
  { id:14, name:'THE COMPASS',      nameTh:'เข็มทิศ',           faction:'weavers', score:15,  meaning:'ทิศทางที่ชัดเจนกำลังปรากฏขึ้น ช่วยนำทางการตัดสินใจด้านการเงินค่ะ' },
  { id:15, name:'THE CROSSROADS',   nameTh:'ทางแยก',            faction:'weavers', score:20,  meaning:'ทางแยกสำคัญที่ต้องเลือก การตัดสินใจตอนนี้จะส่งผลต่อโชคลาภในอนาคตค่ะ' },
  { id:16, name:'THE OPENING',      nameTh:'ช่องเปิด',          faction:'weavers', score:25,  meaning:'ช่องทางหรือโอกาสใหม่กำลังเปิดออก พร้อมให้ก้าวเข้าไปค่ะ' },
  { id:17, name:'THE TIDE',         nameTh:'กระแสน้ำ',          faction:'weavers', score:30,  meaning:'กระแสกำลังเปลี่ยนไปในทิศทางที่ดีขึ้น จังหวะเอื้ออำนวยมากขึ้นค่ะ' },
  { id:18, name:'THE WHEEL',        nameTh:'วงล้อ',             faction:'weavers', score:35,  meaning:'วงล้อแห่งโชคชะตากำลังหมุนไปในทางที่เป็นบวก การเปลี่ยนแปลงที่ดีกำลังมาถึงค่ะ' },
  { id:19, name:'THE STAR MAP',     nameTh:'แผนที่ดาว',         faction:'weavers', score:40,  meaning:'มีเส้นทางที่ชัดเจนขึ้นสู่ความสำเร็จทางการเงิน เหมือนมีแผนที่นำทางค่ะ' },
  { id:20, name:'THE FATE WEAVER',  nameTh:'ผู้ถักทอโชคชะตา',   faction:'weavers', score:45,  meaning:'โชคชะตากำลังถักทอเส้นทางที่เอื้อประโยชน์ให้ จังหวะและโอกาสมาบรรจบกันค่ะ' },

  // ☀️ THE GIVERS (บวก)
  { id:21, name:'THE GOLDEN COIN',    nameTh:'เหรียญทอง',           faction:'givers', score:50,  meaning:'เหรียญทองแห่งโชคลาภเริ่มปรากฏ สัญญาณที่ดีด้านการเงินเริ่มชัดเจนค่ะ' },
  { id:22, name:'THE LUCKY FOX',      nameTh:'จิ้งจอกนำโชค',        faction:'givers', score:55,  meaning:'จิ้งจอกนำโชคกำลังนำทางไปสู่โอกาสที่ไม่คาดคิด ความคล่องแคล่วช่วยให้จับโอกาสได้ทันค่ะ' },
  { id:23, name:'THE GOLDEN KEY',     nameTh:'กุญแจทอง',            faction:'givers', score:60,  meaning:'กุญแจทองที่ไขไปสู่ประตูแห่งโอกาสใหม่ทางการเงินค่ะ' },
  { id:24, name:'THE TREASURE KEEPER',nameTh:'ผู้พิทักษ์สมบัติ',    faction:'givers', score:65,  meaning:'ผู้พิทักษ์สมบัติกำลังปกป้องและสะสมทรัพย์สินให้เติบโตอย่างมั่นคงค่ะ' },
  { id:25, name:'THE WINDFALL',       nameTh:'โชคลาภไม่คาดฝัน',     faction:'givers', score:70,  meaning:'โชคลาภที่ไม่คาดฝันกำลังจะเข้ามา อาจได้รับเงินก้อนแบบไม่ทันตั้งตัวค่ะ' },
  { id:26, name:'THE HARVEST',        nameTh:'ฤดูเก็บเกี่ยว',       faction:'givers', score:75,  meaning:'ฤดูกาลเก็บเกี่ยวผลผลิตที่ลงแรงมา ผลตอบแทนกำลังจะออกดอกออกผลค่ะ' },
  { id:27, name:'THE ABUNDANCE',      nameTh:'ความอุดมสมบูรณ์',     faction:'givers', score:80,  meaning:'ความอุดมสมบูรณ์กำลังไหลบ่าเข้ามา โอกาสด้านการเงินเปิดกว้างมากค่ะ' },
  { id:28, name:'THE GOLDEN TREE',    nameTh:'ต้นไม้ทองคำ',         faction:'givers', score:85,  meaning:'ต้นไม้ทองคำที่เติบโตต่อเนื่อง ทรัพย์สินมีแนวโน้มงอกงามในระยะยาวค่ะ' },
  { id:29, name:'THE FORTUNE BRINGER',nameTh:'ผู้นำพาโชคลาภ',       faction:'givers', score:90,  meaning:'ผู้นำพาโชคลาภมาสู่ชีวิต พลังบวกด้านการเงินโดดเด่นมากค่ะ' },
  { id:30, name:'THE GOLDEN EMPEROR', nameTh:'จักรพรรดิทอง',        faction:'givers', score:100, meaning:'จักรพรรดิแห่งทองคำ พลังแห่งความมั่งคั่งสูงสุด โชคลาภและความสำเร็จทางการเงินโดดเด่นที่สุดในสำรับค่ะ' },
];

var LUCK_FACTION_TH = {
  takers:  { label: 'THE TAKERS — เหล่าผู้ช่วงชิง', color: '#ef4444' },
  weavers: { label: 'THE WEAVERS — เหล่าผู้ถักทอ',  color: '#a855f7' },
  givers:  { label: 'THE GIVERS — เหล่าผู้มอบ',      color: '#f59e0b' },
};

// บทบาทของไพ่ตามตำแหน่งที่เปิดได้ (1=พลังหลัก, 2=พลังสนับสนุน/แรงต้าน, 3=ผลลัพธ์)
var LUCK_ROLES = [
  { label: 'พลังหลัก', desc: 'พลังงานหลักของโชคลาภในครั้งนี้' },
  { label: 'พลังสนับสนุนหรือแรงต้าน', desc: 'สิ่งที่กำลังช่วยเพิ่มหรือลดพลังโชคลาภ' },
  { label: 'ผลลัพธ์', desc: 'แนวโน้มสุดท้ายของพลังงาน' },
];

// ระดับพลังโชคลาภตาม %
function getLuckTier(pct) {
  if (pct >= 80) return { label: 'โชคลาภโดดเด่นมาก', color: '#fbbf24' };
  if (pct >= 60) return { label: 'โชคลาภอยู่ในระดับดี', color: '#facc15' };
  if (pct >= 40) return { label: 'มีโอกาส แต่ต้องอาศัยจังหวะ', color: '#84cc16' };
  if (pct >= 20) return { label: 'โชคลาภค่อนข้างอ่อน', color: '#94a3b8' };
  if (pct >= 0)  return { label: 'พลังงานเป็นกลาง/มีแรงต้าน', color: '#94a3b8' };
  return { label: 'พลังงานติดลบ ควรระวัง', color: '#ef4444' };
}

// สีโคลเวอร์เอฟเฟกต์ตามคะแนนของไพ่แต่ละใบ (ไม่ใช่ % รวม)
function getCloverColor(score) {
  if (score < 0) return { emoji: '🍀', color: '#ef4444', name: 'red' };   // ติดลบ = แดง
  if (score <= 50) return { emoji: '🍀', color: '#22c55e', name: 'green' }; // 0-50 = เขียว
  return { emoji: '🍀', color: '#fbbf24', name: 'gold' };                  // 55-100 = ทอง
}

function calcLuckReading(cards) {
  const total = cards.reduce((sum, c) => sum + c.score, 0);
  const pct = Math.round((total / LUCK_MAX_SCORE) * 100);
  const tier = getLuckTier(pct);
  return { total, pct, tier };
}

// สุ่มไพ่ 3 ใบไม่ซ้ำกันจาก 30 ใบ
function drawThreeCards() {
  const shuffled = [...LUCK_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}