// dragon-data.js
// ไพ่ออราเคิลมังกร — 44 ใบ แบ่งเป็น 4 ธาตุ ธาตุละ 11 ใบ
// รูปไพ่: images/dragon/w1.png ... w44.png (เรียงตามลำดับด้านล่าง)
// หลังไพ่: images/dragon/backdragon.png

var DRAGON_SUITS = {
  fire:  { name: 'Fire Dragon', nameTH: 'มังกรแห่งไฟ', emoji: '🔥', theme: 'พลัง / ความกล้า / ความทะเยอทะยาน / การลงมือทำ', color: '#ef4444' },
  water: { name: 'Water Dragon', nameTH: 'มังกรแห่งน้ำ', emoji: '🌊', theme: 'อารมณ์ / ความรัก / สัญชาตญาณ / การเยียวยา', color: '#3b82f6' },
  wind:  { name: 'Wind Dragon', nameTH: 'มังกรแห่งลม', emoji: '🌪️', theme: 'ความคิด / อิสรภาพ / การเปลี่ยนแปลง / โอกาส', color: '#94a3b8' },
  earth: { name: 'Earth Dragon', nameTH: 'มังกรแห่งดิน', emoji: '🌳', theme: 'เงิน / งาน / ความมั่นคง / ความสำเร็จ / รากฐาน', color: '#10b981' }
};

var DRAGON_CARDS = [
  // ── I. FIRE DRAGON ──
  { id: 1,  img: 'w1.png',  suit: 'fire', emoji: '🔥', nameEN: 'The Spark', nameTH: 'ประกายไฟ',
    meaning: 'จุดเริ่มต้นของแรงบันดาลใจ ความคิดใหม่ ความฝันที่เพิ่งเริ่มเกิด', message: 'ทุกเปลวไฟใหญ่ เริ่มจากประกายเล็ก ๆ' },
  { id: 2,  img: 'w2.png',  suit: 'fire', emoji: '🐉', nameEN: 'The Courage', nameTH: 'ความกล้า',
    meaning: 'ถึงเวลาต้องกล้าเผชิญหน้ากับสิ่งที่กลัว', message: 'คุณกล้ากว่าที่คุณคิด' },
  { id: 3,  img: 'w3.png',  suit: 'fire', emoji: '⚔️', nameEN: 'The Challenge', nameTH: 'บททดสอบ',
    meaning: 'อุปสรรคกำลังเข้ามา แต่จะทำให้คุณแข็งแกร่งขึ้น', message: 'สิ่งที่ขวางทาง อาจกำลังสร้างคุณขึ้นมา' },
  { id: 4,  img: 'w4.png',  suit: 'fire', emoji: '🦁', nameEN: 'The Will', nameTH: 'เจตจำนง',
    meaning: 'อย่ายอมแพ้ ความสำเร็จต้องการความต่อเนื่อง', message: 'ก้าวต่อไป แม้ไม่มีใครมองเห็น' },
  { id: 5,  img: 'w5.png',  suit: 'fire', emoji: '☀️', nameEN: 'The Radiance', nameTH: 'แสงสว่าง',
    meaning: 'การได้รับการยอมรับ ความสำเร็จ ความโดดเด่น', message: 'อย่าซ่อนแสงของตัวเอง' },
  { id: 6,  img: 'w6.png',  suit: 'fire', emoji: '🔥', nameEN: 'The Passion', nameTH: 'ความหลงใหล',
    meaning: 'สิ่งที่ทำให้หัวใจเต้นแรง อาจเป็นเส้นทางที่ควรเดิน', message: 'สิ่งที่คุณรักกำลังเรียกหาคุณ' },
  { id: 7,  img: 'w7.png',  suit: 'fire', emoji: '🌋', nameEN: 'The Eruption', nameTH: 'การปะทุ',
    meaning: 'อารมณ์หรือพลังที่ถูกเก็บไว้นานกำลังระเบิดออกมา', message: 'บางสิ่งต้องถูกปล่อยออกมา' },
  { id: 8,  img: 'w8.png',  suit: 'fire', emoji: '🪶', nameEN: 'The Phoenix Flame', nameTH: 'การเกิดใหม่',
    meaning: 'จบสิ่งเก่าเพื่อเริ่มต้นสิ่งใหม่', message: 'คุณไม่ได้สูญเสียตัวตน คุณกำลังเปลี่ยนแปลง' },
  { id: 9,  img: 'w9.png',  suit: 'fire', emoji: '🏆', nameEN: 'The Victory', nameTH: 'ชัยชนะ',
    meaning: 'ความพยายามกำลังให้ผลลัพธ์', message: 'คุณมาไกลกว่าที่คิด' },
  { id: 10, img: 'w10.png', suit: 'fire', emoji: '🔥', nameEN: 'The Forge', nameTH: 'การหลอมสร้าง',
    meaning: 'ช่วงเวลาที่ยากกำลังสร้างคุณให้แข็งแกร่ง', message: 'แรงกดดันกำลังเปลี่ยนคุณเป็นสิ่งที่แข็งแกร่งกว่าเดิม' },
  { id: 11, img: 'w11.png', suit: 'fire', emoji: '👑', nameEN: 'The Sovereign', nameTH: 'ผู้ครองพลัง',
    meaning: 'ถึงเวลาควบคุมชีวิตตัวเอง ไม่ต้องรอให้ใครอนุญาต', message: 'คุณคือผู้กำหนดเส้นทางของตัวเอง' },

  // ── II. WATER DRAGON ──
  { id: 12, img: 'w12.png', suit: 'water', emoji: '🌊', nameEN: 'The Flow', nameTH: 'สายน้ำ',
    meaning: 'อย่าฝืนทุกอย่าง ปล่อยให้ชีวิตเคลื่อนไปตามจังหวะ', message: 'สิ่งที่ใช่ไม่จำเป็นต้องถูกบังคับ' },
  { id: 13, img: 'w13.png', suit: 'water', emoji: '🌙', nameEN: 'The Intuition', nameTH: 'สัญชาตญาณ',
    meaning: 'คำตอบที่คุณต้องการอาจอยู่ในใจคุณแล้ว', message: 'ฟังเสียงที่เบาที่สุดในใจ' },
  { id: 14, img: 'w14.png', suit: 'water', emoji: '💧', nameEN: 'The Tears', nameTH: 'น้ำตา',
    meaning: 'การปล่อยความเจ็บปวดออกมาไม่ใช่ความอ่อนแอ', message: 'สิ่งที่ไหลออกไป กำลังทำให้คุณเบาลง' },
  { id: 15, img: 'w15.png', suit: 'water', emoji: '💙', nameEN: 'The Healing', nameTH: 'การเยียวยา',
    meaning: 'คุณกำลังฟื้นตัว แม้จะยังไม่รู้สึกว่าดีขึ้น', message: 'การเยียวยาไม่จำเป็นต้องรีบ' },
  { id: 16, img: 'w16.png', suit: 'water', emoji: '🪞', nameEN: 'The Reflection', nameTH: 'ภาพสะท้อน',
    meaning: 'ถึงเวลามองตัวเองอย่างซื่อสัตย์', message: 'สิ่งที่คุณเห็นในโลก อาจกำลังสะท้อนสิ่งที่อยู่ในใจ' },
  { id: 17, img: 'w17.png', suit: 'water', emoji: '💞', nameEN: 'The Connection', nameTH: 'สายสัมพันธ์',
    meaning: 'ความสัมพันธ์สำคัญกำลังเข้ามาหรือกำลังเปลี่ยนแปลง', message: 'ไม่มีใครเดินทางผ่านชีวิตโดยลำพัง' },
  { id: 18, img: 'w18.png', suit: 'water', emoji: '🌊', nameEN: 'The Tide', nameTH: 'กระแสน้ำ',
    meaning: 'สถานการณ์กำลังเปลี่ยนขึ้นลง อย่าตัดสินเร็วเกินไป', message: 'ทุกสิ่งมีจังหวะของมัน' },
  { id: 19, img: 'w19.png', suit: 'water', emoji: '🐚', nameEN: 'The Hidden Pearl', nameTH: 'ไข่มุกที่ซ่อนอยู่',
    meaning: 'คุณค่าหรือโอกาสที่ยังมองไม่เห็น', message: 'สิ่งล้ำค่าอาจซ่อนอยู่ในสิ่งที่ดูธรรมดา' },
  { id: 20, img: 'w20.png', suit: 'water', emoji: '🌫️', nameEN: 'The Mist', nameTH: 'หมอก',
    meaning: 'ยังไม่ใช่เวลาที่จะเห็นคำตอบทั้งหมด', message: 'ไม่จำเป็นต้องเห็นทั้งเส้นทาง แค่เห็นก้าวต่อไปก็พอ' },
  { id: 21, img: 'w21.png', suit: 'water', emoji: '🐉', nameEN: 'The Imugi', nameTH: 'การเติบโต',
    meaning: 'คุณยังไม่ถึงจุดหมาย แต่กำลังเปลี่ยนแปลงอย่างมหาศาล', message: 'อย่าดูถูกตัวเองเพียงเพราะยังไม่กลายเป็นมังกร' },
  { id: 22, img: 'w22.png', suit: 'water', emoji: '🌕', nameEN: 'The Moonlit Water', nameTH: 'ความลับของหัวใจ',
    meaning: 'สิ่งที่ซ่อนอยู่กำลังจะถูกเปิดเผย', message: 'ความจริงมักปรากฏเมื่อใจสงบ' },

  // ── III. WIND DRAGON ──
  { id: 23, img: 'w23.png', suit: 'wind', emoji: '🌬️', nameEN: 'The Breath', nameTH: 'ลมหายใจ',
    meaning: 'หยุดพักก่อนเริ่มต้นใหม่', message: 'คุณไม่จำเป็นต้องวิ่งตลอดเวลา' },
  { id: 24, img: 'w24.png', suit: 'wind', emoji: '🕊️', nameEN: 'The Freedom', nameTH: 'อิสรภาพ',
    meaning: 'ถึงเวลาปลดสิ่งที่ผูกมัดคุณ', message: 'คุณมีสิทธิ์เลือกเส้นทางของตัวเอง' },
  { id: 25, img: 'w25.png', suit: 'wind', emoji: '🌪️', nameEN: 'The Change', nameTH: 'การเปลี่ยนแปลง',
    meaning: 'สิ่งเก่ากำลังเปลี่ยนไป อย่าต่อต้านทุกอย่าง', message: 'การเปลี่ยนแปลงอาจกำลังพาคุณไปสู่สิ่งที่ดีกว่า' },
  { id: 26, img: 'w26.png', suit: 'wind', emoji: '🧭', nameEN: 'The Direction', nameTH: 'ทิศทาง',
    meaning: 'ต้องเลือกว่าจะไปทางไหน', message: 'การไม่เลือก ก็เป็นการเลือกเช่นกัน' },
  { id: 27, img: 'w27.png', suit: 'wind', emoji: '🪁', nameEN: 'The Perspective', nameTH: 'มุมมอง',
    meaning: 'ลองมองปัญหาจากมุมสูง', message: 'เมื่อคุณเปลี่ยนมุมมอง โลกก็เปลี่ยนไป' },
  { id: 28, img: 'w28.png', suit: 'wind', emoji: '🦋', nameEN: 'The Transformation', nameTH: 'การเปลี่ยนร่าง',
    meaning: 'คุณกำลังกลายเป็นคนใหม่', message: 'ตัวตนเก่าของคุณไม่จำเป็นต้องเดินทางต่อไปกับคุณ' },
  { id: 29, img: 'w29.png', suit: 'wind', emoji: '🌩️', nameEN: 'The Storm', nameTH: 'พายุ',
    meaning: 'ความวุ่นวายชั่วคราวกำลังเข้ามา', message: 'ไม่มีพายุใดอยู่ตลอดไป' },
  { id: 30, img: 'w30.png', suit: 'wind', emoji: '🪶', nameEN: 'The Message', nameTH: 'สารจากสายลม',
    meaning: 'ข่าวสาร คำตอบ หรือโอกาสกำลังเดินทางมา', message: 'จงฟังสิ่งที่จักรวาลกำลังพยายามบอกคุณ' },
  { id: 31, img: 'w31.png', suit: 'wind', emoji: '🛤️', nameEN: 'The Crossroads', nameTH: 'ทางแยก',
    meaning: 'คุณกำลังอยู่ในจุดที่ต้องตัดสินใจ', message: 'ทุกเส้นทางสอนบางสิ่งแก่คุณ' },
  { id: 32, img: 'w32.png', suit: 'wind', emoji: '☁️', nameEN: 'The Possibility', nameTH: 'ความเป็นไปได้',
    meaning: 'ยังมีทางเลือกมากกว่าที่คุณคิด', message: 'ประตูที่คุณยังไม่เห็น อาจกำลังรอให้คุณเปิด' },
  { id: 33, img: 'w33.png', suit: 'wind', emoji: '🐉', nameEN: 'The Ascension', nameTH: 'การทะยานขึ้น',
    meaning: 'การก้าวขึ้นสู่ระดับใหม่ในชีวิต', message: 'คุณพร้อมที่จะไปไกลกว่าเดิมแล้ว' },

  // ── IV. EARTH DRAGON ──
  { id: 34, img: 'w34.png', suit: 'earth', emoji: '🌱', nameEN: 'The Seed', nameTH: 'เมล็ดพันธุ์',
    meaning: 'สิ่งเล็ก ๆ ที่เริ่มต้นวันนี้จะเติบโตในอนาคต', message: 'อย่าดูถูกจุดเริ่มต้นเล็ก ๆ' },
  { id: 35, img: 'w35.png', suit: 'earth', emoji: '🪨', nameEN: 'The Foundation', nameTH: 'รากฐาน',
    meaning: 'สร้างพื้นฐานให้มั่นคงก่อนขยายตัว', message: 'สิ่งที่ยิ่งใหญ่ต้องมีรากที่แข็งแรง' },
  { id: 36, img: 'w36.png', suit: 'earth', emoji: '💰', nameEN: 'The Abundance', nameTH: 'ความอุดมสมบูรณ์',
    meaning: 'โอกาสด้านทรัพย์สิน เงินทอง และผลตอบแทน', message: 'คุณคู่ควรกับความอุดมสมบูรณ์' },
  { id: 37, img: 'w37.png', suit: 'earth', emoji: '🏡', nameEN: 'The Security', nameTH: 'ความมั่นคง',
    meaning: 'สร้างความปลอดภัยให้ชีวิต', message: 'ความสงบก็เป็นความสำเร็จรูปแบบหนึ่ง' },
  { id: 38, img: 'w38.png', suit: 'earth', emoji: '⛰️', nameEN: 'The Mountain', nameTH: 'ภูเขา',
    meaning: 'เป้าหมายใหญ่ ต้องใช้เวลาและความอดทน', message: 'ปีนทีละก้าวก็ยังขึ้นถึงยอดได้' },
  { id: 39, img: 'w39.png', suit: 'earth', emoji: '🌳', nameEN: 'The Roots', nameTH: 'ราก',
    meaning: 'กลับไปหาสิ่งสำคัญและตัวตนที่แท้จริง', message: 'คนที่รู้ว่าตัวเองมาจากไหน จะรู้ว่าควรไปที่ไหน' },
  { id: 40, img: 'w40.png', suit: 'earth', emoji: '💎', nameEN: 'The Treasure', nameTH: 'สมบัติ',
    meaning: 'ผลลัพธ์หรือโอกาสอันมีค่า', message: 'สิ่งที่คุณกำลังตามหาอาจอยู่ใกล้กว่าที่คิด' },
  { id: 41, img: 'w41.png', suit: 'earth', emoji: '🏯', nameEN: 'The Gate', nameTH: 'ประตู',
    meaning: 'โอกาสใหม่กำลังเปิด', message: 'เมื่อประตูเปิด จงกล้าที่จะเดินเข้าไป' },
  { id: 42, img: 'w42.png', suit: 'earth', emoji: '🐢', nameEN: 'The Patience', nameTH: 'ความอดทน',
    meaning: 'ยังไม่ถึงเวลาเร่งรีบ', message: 'ช้าไม่ได้แปลว่าไม่ก้าวหน้า' },
  { id: 43, img: 'w43.png', suit: 'earth', emoji: '🌾', nameEN: 'The Harvest', nameTH: 'การเก็บเกี่ยว',
    meaning: 'ได้รับผลลัพธ์จากสิ่งที่เคยทำไว้', message: 'สิ่งที่คุณหว่านไว้กำลังเติบโต' },
  { id: 44, img: 'w44.png', suit: 'earth', emoji: '🐉', nameEN: 'The Dragon', nameTH: 'การบรรลุ',
    meaning: 'การกลายเป็นตัวตนที่แข็งแกร่งที่สุดของตัวเอง', message: 'คุณไม่ได้กำลังค้นหาพลัง คุณกำลังค้นพบว่าคุณมีมันอยู่แล้ว' }
];

// ─── Helper ───
function getDragonCard(id) {
  return DRAGON_CARDS.find(function(c){ return c.id === id; });
}
function drawDragonCards(n) {
  var pool = DRAGON_CARDS.slice();
  var drawn = [];
  for (var i = 0; i < n && pool.length; i++) {
    var idx = Math.floor(Math.random() * pool.length);
    drawn.push(pool.splice(idx, 1)[0]);
  }
  return drawn;
}