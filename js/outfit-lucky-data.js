// outfit-lucky-data-v2.js
// สีมงคลแต่งตัว — data ละเอียด v2
// Logic: สีเสื้อหลักต้องมงคลต่อกิจกรรม + ไม่กาลกิณีวันเกิด
//        แล้วค่อย coordinate กระเป๋า รองเท้า ลิป ให้แมทช์กัน

// ── 1. สีกาลกิณีตามวันเกิด ──
const GALAGINI = {
  0: ['ฟ้า', 'คราม', 'น้ำเงิน', 'ฟ้าเข้ม'],       // อาทิตย์
  1: ['แดง', 'ส้มแดง', 'แดงเลือดหมู'],             // จันทร์
  2: ['เหลือง', 'ขาว', 'ครีม', 'เหลืองนวล'],       // อังคาร
  3: ['ชมพู', 'โอลด์โรส', 'ชมพูเข้ม', 'บานเย็น'],  // พุธ
  4: ['เขียว', 'เขียวเข้ม', 'เขียวอ่อน'],          // พฤหัส
  5: ['ดำ', 'เทาเข้ม', 'กรมเข้ม'],                 // ศุกร์
  6: ['ส้ม', 'น้ำตาลแดง', 'ส้มเข้ม'],              // เสาร์
};

// ── 2. สีมงคลสำหรับแต่ละกิจกรรม (เรียงลำดับความเหมาะสม) ──
const ACTIVITY_LUCKY_COLORS = {
  work: {
    label: 'ทำงาน/ประชุม',
    purpose: 'เสริมความน่าเชื่อถือ อำนาจ และความสำเร็จค่ะ',
    colors: ['ขาว', 'น้ำเงิน', 'กรม', 'ดำ', 'เทา', 'ครีม', 'น้ำตาล', 'เขียวเข้ม'],
  },
  date: {
    label: 'ไปเดต/พบคนรัก',
    purpose: 'เสริมเสน่ห์ ความรัก และความดึงดูดค่ะ',
    colors: ['ชมพู', 'แดง', 'ส้มแดง', 'บานเย็น', 'ม่วงอ่อน', 'ขาว', 'ครีม'],
  },
  interview: {
    label: 'สัมภาษณ์งาน',
    purpose: 'เสริมความมั่นใจ น่าเชื่อถือ และโชคในการตัดสินใจค่ะ',
    colors: ['ขาว', 'น้ำเงิน', 'ครีม', 'ฟ้าอ่อน', 'เทาอ่อน', 'น้ำตาลอ่อน'],
  },
  party: {
    label: 'ปาร์ตี้/สังสรรค์',
    purpose: 'เสริมความโดดเด่น สนุกสนาน และดึงดูดสายตาค่ะ',
    colors: ['แดง', 'ทอง', 'ม่วง', 'ดำ', 'เขียวมรกต', 'บานเย็น', 'เงิน'],
  },
  temple: {
    label: 'ทำบุญ/ไหว้พระ',
    purpose: 'เสริมบุญบารมี สิริมงคล และจิตใจที่ผ่องใสค่ะ',
    colors: ['ขาว', 'เหลือง', 'ครีม', 'ส้มอ่อน', 'ฟ้าอ่อน', 'เขียวอ่อน'],
  },
  shopping: {
    label: 'ช้อปปิ้ง/เที่ยว',
    purpose: 'เสริมความสดใส สนุก และโชคลาภค่ะ',
    colors: ['เหลือง', 'ส้ม', 'ฟ้า', 'เขียวมิ้นต์', 'ชมพูอ่อน', 'ลาเวนเดอร์', 'ขาว'],
  },
};

// ── 3. Coordinate กระเป๋าตามสีเสื้อ ──
// หลัก: Neutral bag (ดำ ขาว ครีม น้ำตาล ทอง เงิน) เข้ากับทุกสีค่ะ
// หลัก: Analogous = สีใกล้เคียงกัน เช่น เหลือง→ส้ม, ฟ้า→เขียว
// หลัก: Monochromatic = โทนเดียวกัน เช่น ชมพูอ่อน→ชมพูเข้ม
const BAG_MATCH = {
  'ขาว':        { color: 'น้ำตาลอ่อน', alt: 'ทอง',    style: 'structured bag หรือ tote bag' },
  'ครีม':       { color: 'น้ำตาล',     alt: 'ทอง',    style: 'tote bag หรือ shoulder bag' },
  'ดำ':         { color: 'ทอง',        alt: 'เงิน',   style: 'structured bag หรือ clutch' },
  'เทา':        { color: 'ดำ',         alt: 'เงิน',   style: 'structured bag' },
  'เทาอ่อน':   { color: 'ขาว',        alt: 'เงิน',   style: 'shoulder bag' },
  'น้ำเงิน':   { color: 'น้ำตาล',     alt: 'ครีม',   style: 'structured bag หรือ leather bag' },
  'กรม':        { color: 'น้ำตาล',     alt: 'ทอง',    style: 'structured bag' },
  'ฟ้า':        { color: 'ขาว',        alt: 'ครีม',   style: 'shoulder bag หรือ tote' },
  'ฟ้าอ่อน':   { color: 'ขาว',        alt: 'เงิน',   style: 'mini bag หรือ shoulder bag' },
  'แดง':        { color: 'ดำ',         alt: 'ครีม',   style: 'clutch หรือ mini bag' },
  'ส้มแดง':    { color: 'น้ำตาล',     alt: 'ครีม',   style: 'shoulder bag' },
  'ชมพู':       { color: 'ขาว',        alt: 'ทอง',    style: 'mini bag หรือ shoulder bag น่ารัก' },
  'ชมพูอ่อน':  { color: 'ครีม',       alt: 'ขาว',    style: 'mini bag หรือ tote น่ารัก' },
  'บานเย็น':   { color: 'ดำ',         alt: 'เงิน',   style: 'clutch หรือ mini bag' },
  'ม่วง':       { color: 'เงิน',       alt: 'ดำ',     style: 'clutch หรือ shoulder bag' },
  'ม่วงอ่อน':  { color: 'ครีม',       alt: 'เงิน',   style: 'mini bag น่ารัก' },
  'ลาเวนเดอร์': { color: 'ขาว',       alt: 'ครีม',   style: 'mini bag หรือ shoulder bag' },
  'เขียว':      { color: 'น้ำตาล',     alt: 'ครีม',   style: 'shoulder bag หรือ tote' },
  'เขียวมิ้นต์': { color: 'ขาว',      alt: 'ครีม',   style: 'tote bag หรือ mini bag' },
  'เขียวมรกต': { color: 'ทอง',        alt: 'ดำ',     style: 'clutch หรือ mini bag' },
  'เขียวเข้ม': { color: 'น้ำตาล',     alt: 'ทอง',    style: 'structured bag' },
  'เหลือง':    { color: 'น้ำตาล',     alt: 'ขาว',    style: 'shoulder bag หรือ tote' },
  'ส้ม':        { color: 'น้ำตาล',     alt: 'ครีม',   style: 'shoulder bag' },
  'ส้มอ่อน':   { color: 'ครีม',       alt: 'น้ำตาลอ่อน', style: 'tote bag' },
  'ทอง':        { color: 'ดำ',         alt: 'น้ำตาลเข้ม', style: 'clutch หรือ mini bag' },
  'เงิน':       { color: 'ดำ',         alt: 'เทา',    style: 'clutch หรือ mini bag' },
  'น้ำตาล':    { color: 'ครีม',       alt: 'ทอง',    style: 'tote bag หรือ leather bag' },
  'น้ำตาลอ่อน': { color: 'ครีม',     alt: 'ขาว',    style: 'shoulder bag' },
};

// ── 4. รองเท้าตามกิจกรรม + เพศ ──
const SHOES_GUIDE = {
  work: {
    female: [
      { style: 'รองเท้าส้นสูงปลายแหลม (Pointed Heels)', color: 'ดำหรือน้ำตาล', why: 'ดูเป็นมืออาชีพและน่าเชื่อถือสูงสุดค่ะ' },
      { style: 'Loafer หนัง', color: 'ดำหรือน้ำตาล', why: 'สวมสบาย ดูดีมีสไตล์ เหมาะทำงานทั้งวันค่ะ' },
      { style: 'Mary Jane ส้นเตี้ย', color: 'ดำหรือครีม', why: 'น่ารักแต่ยังดูสุภาพค่ะ เทรนด์ฮิต 2025 ค่ะ' },
    ],
    male: [
      { style: 'รองเท้าหนัง Oxford หรือ Derby', color: 'ดำหรือน้ำตาล', why: 'ดูเป็นมืออาชีพและทางการที่สุดค่ะ' },
      { style: 'Loafer หนัง', color: 'น้ำตาลหรือดำ', why: 'ดูดีมีสไตล์ สวมสบายค่ะ' },
    ],
  },
  date: {
    female: [
      { style: 'Mary Jane ส้นกลาง', color: 'ดำ ครีม หรือโทนพาสเทล', why: 'หวานน่ารัก เสริมเสน่ห์ผู้หญิงค่ะ เทรนด์ No.1 ปี 2025 ค่ะ' },
      { style: 'รองเท้าส้นสูง Stiletto', color: 'ดำ ครีม หรือโทนนู้ด', why: 'เซ็กซี่ มั่นใจ เสริมความสูงค่ะ' },
      { style: 'Ballet Flat', color: 'ครีม ดำ หรือพาสเทล', why: 'น่ารักสบาย ใส่เดินได้นานค่ะ เทรนด์ฮิตมากค่ะ' },
      { style: 'Strappy Sandal ส้นสูง', color: 'โทนนู้ดหรือทอง', why: 'หวานเปรี้ยว เสริมบุคลิกค่ะ' },
    ],
    male: [
      { style: 'สนีกเกอร์สะอาดสีขาว', color: 'ขาว', why: 'ดูสดใส clean look เหมาะเดตแบบลำลองค่ะ' },
      { style: 'Loafer หนังลำลอง', color: 'น้ำตาลหรือดำ', why: 'ดูดีมีสไตล์ ไม่เป็นทางการมากค่ะ' },
      { style: 'Chelsea Boot', color: 'น้ำตาลหรือดำ', why: 'ดูเท่ มีสไตล์ค่ะ' },
    ],
  },
  interview: {
    female: [
      { style: 'รองเท้าส้นสูงปลายแหลม (Classic Pump)', color: 'ดำหรือโทนนู้ด', why: 'น่าเชื่อถือ มั่นใจ ดูเป็นมืออาชีพสูงสุดค่ะ' },
      { style: 'Loafer หนัง', color: 'ดำหรือน้ำตาลเข้ม', why: 'ดูดีสุภาพ สวมสบายทั้งวันค่ะ' },
      { style: 'รองเท้าส้นเตี้ยปลายแหลม', color: 'ดำหรือน้ำตาล', why: 'ดูสุภาพเรียบร้อย น่าเชื่อถือค่ะ' },
    ],
    male: [
      { style: 'รองเท้าหนัง Oxford', color: 'ดำ', why: 'ทางการและน่าเชื่อถือที่สุดค่ะ' },
      { style: 'รองเท้าหนัง Derby', color: 'ดำหรือน้ำตาลเข้ม', why: 'ทางการ ดูดีค่ะ' },
    ],
  },
  party: {
    female: [
      { style: 'รองเท้าส้นสูง Block Heel', color: 'ทอง เงิน หรือดำ', why: 'โดดเด่น เซ็กซี่ สนุกค่ะ' },
      { style: 'Strappy Heels', color: 'ทอง เงิน หรือโทนเมทัลลิก', why: 'เปล่งประกาย ดึงดูดสายตาค่ะ' },
      { style: 'Chunky Platform', color: 'ดำหรือโทนสีสัน', why: 'เท่ โดดเด่น เทรนด์มากค่ะ' },
      { style: 'Knee-High Boot', color: 'ดำ', why: 'เซ็กซี่ มีพาวเวอร์ค่ะ' },
    ],
    male: [
      { style: 'สนีกเกอร์แฟชั่น', color: 'ขาว ดำ หรือสีสัน', why: 'เท่ มีสไตล์ เหมาะปาร์ตี้ลำลองค่ะ' },
      { style: 'Chelsea Boot', color: 'ดำหรือน้ำตาล', why: 'ดูดี มีสไตล์ค่ะ' },
      { style: 'Loafer แฟชั่น', color: 'ดำหรือโทนสีสัน', why: 'สมาร์ทแต่ไม่ formal เกินค่ะ' },
    ],
  },
  temple: {
    female: [
      { style: 'Sandal แบน หัวปิด', color: 'ขาว ครีม หรือน้ำตาล', why: 'ถอดง่าย สุภาพ เหมาะวัดมากค่ะ' },
      { style: 'Ballet Flat', color: 'ขาวหรือครีม', why: 'สุภาพ สบาย ถอดง่ายค่ะ' },
      { style: 'Loafer ผ้า', color: 'ขาวหรือครีม', why: 'สุภาพ ถอดสะดวกค่ะ' },
    ],
    male: [
      { style: 'รองเท้าแตะหนัง (Dress Sandal)', color: 'น้ำตาลหรือดำ', why: 'สุภาพ ถอดง่ายค่ะ' },
      { style: 'Loafer', color: 'น้ำตาลหรือดำ', why: 'ถอดง่าย ดูสุภาพค่ะ' },
    ],
  },
  shopping: {
    female: [
      { style: 'สนีกเกอร์', color: 'ขาว พาสเทล หรือสีสัน', why: 'สบายมาก เดินได้ทั้งวันค่ะ' },
      { style: 'Ballet Flat', color: 'ครีม ขาว หรือพาสเทล', why: 'น่ารัก สบาย ใส่เดินช้อปได้นานค่ะ' },
      { style: 'Chunky Sandal', color: 'น้ำตาลหรือขาว', why: 'เท่ สบาย เทรนด์ 2025 ค่ะ' },
    ],
    male: [
      { style: 'สนีกเกอร์', color: 'ขาว ดำ หรือสีสัน', why: 'สบายที่สุด เดินได้ทั้งวันค่ะ' },
      { style: 'รองเท้าผ้าใบ Casual', color: 'ขาวหรือสีสัน', why: 'ลำลอง สบายค่ะ' },
    ],
  },
};

// ── 5. ลิปสติกตามกิจกรรม + สีเสื้อ ──
const LIP_GUIDE = {
  work: {
    desc: 'ลิปโทนนู้ด-ชมพูธรรมชาติ ดูสุภาพและน่าเชื่อถือค่ะ',
    colors: ['นู้ด', 'ชมพูนู้ด', 'โอลด์โรส', 'แดงอิฐ'],
    tip: 'เลือกลิปที่ใกล้เคียงสีริมฝีปากธรรมชาติค่ะ ดูสุภาพแต่ยังสวยค่ะ',
  },
  date: {
    desc: 'ลิปโทนชมพู-แดง เสริมเสน่ห์และความน่ารักค่ะ',
    colors: ['ชมพูเข้ม', 'แดงคลาสสิก', 'โอลด์โรส', 'ชมพูปะการัง'],
    tip: 'ถ้าเสื้อสีสด เลือกลิปโทนนู้ด ถ้าเสื้อสีอ่อน เลือกลิปสีเข้มขึ้นได้ค่ะ',
  },
  interview: {
    desc: 'ลิปโทนนู้ดหรือชมพูอ่อน ดูสะอาดและน่าเชื่อถือค่ะ',
    colors: ['นู้ด', 'ชมพูอ่อน', 'ชมพูนู้ด'],
    tip: 'หลีกเลี่ยงลิปสีเข้มมาก เพราะอาจดูไม่สุภาพในบางที่ค่ะ',
  },
  party: {
    desc: 'ลิปสีกล้าและโดดเด่น เพิ่มความมั่นใจค่ะ',
    colors: ['แดงสด', 'แดงเข้ม', 'ม่วงเบอร์กันดี', 'บานเย็น', 'ชมพูฟูเชีย'],
    tip: 'ถ้าลิปสีเข้ม ลดแต่งตาลงหน่อยค่ะ เน้น focal point ที่ปากค่ะ',
  },
  temple: {
    desc: 'ลิปโทนธรรมชาติหรือสีอ่อน ดูสุภาพเรียบร้อยค่ะ',
    colors: ['นู้ด', 'ชมพูอ่อน', 'ลิปบาล์มใส'],
    tip: 'ไม่ต้องแต่งหนักค่ะ แค่ลิปบาล์มสีอ่อนๆ ก็ดูดีแล้วค่ะ',
  },
  shopping: {
    desc: 'ลิปทิ้นท์หรือสีสดใส ดูสนุกและสดชื่นค่ะ',
    colors: ['ทิ้นท์แดง', 'ทิ้นท์ชมพู', 'ปะการัง', 'ส้มปะการัง'],
    tip: 'ลิปทิ้นท์ติดทนตลอดวันช้อปได้เลยค่ะ ไม่ต้องแต่งซ้ำค่ะ',
  },
};

// ── 6. เล็บตามกิจกรรม ──
const NAIL_GUIDE = {
  work:      { style: 'เล็บสีนู้ดหรือสีธรรมชาติ ยาวพอดี',        tip: 'หลีกเลี่ยงเล็บยาวเกินหรือสีฉูดฉาดค่ะ' },
  date:      { style: 'เล็บสีชมพูหรือแดง ทรงอัลมอนด์หรือโอวัล',  tip: 'Nail art ลายดอกไม้เล็กๆ ก็น่ารักมากค่ะ' },
  interview: { style: 'เล็บสีนู้ดหรือขาวนม ทรงสั้นสะอาด',        tip: 'เล็บสะอาดดูน่าเชื่อถือมากค่ะ' },
  party:     { style: 'เล็บสีเข้มหรือ glitter ทรงอัลมอนด์หรือสติเล็ตโต้', tip: 'Chrome nail หรือ holographic เทรนด์ฮิตปี 2025 ค่ะ' },
  temple:    { style: 'เล็บสีอ่อนหรือเล็บเปล่า ทรงสั้นสะอาด',    tip: 'ดูสุภาพค่ะ' },
  shopping:  { style: 'เล็บสีสดใสหรือพาสเทล',                    tip: 'เล็บสีสนุกๆ เข้ากับลุคช้อปปิ้งค่ะ' },
};

// ── 7. hex สี ──
const COLOR_HEX = {
  'ขาว': '#FFFFFF', 'ครีม': '#FEF3C7', 'นวล': '#FFF8E7',
  'ดำ': '#1A1A2E', 'เทา': '#718096', 'เทาอ่อน': '#CBD5E0',
  'น้ำเงิน': '#2B6CB0', 'กรม': '#1A365D', 'ฟ้า': '#4299E1',
  'ฟ้าอ่อน': '#90CDF4', 'ฟ้าเข้ม': '#2C5282',
  'แดง': '#E53E3E', 'ส้มแดง': '#DD6B20', 'แดงเลือดหมู': '#9B2335',
  'ชมพู': '#ED64A6', 'ชมพูอ่อน': '#FBB6CE', 'ชมพูนู้ด': '#F6AD8B',
  'บานเย็น': '#B83280', 'โอลด์โรส': '#FC8181', 'ชมพูปะการัง': '#FF7F7F',
  'ม่วง': '#9F7AEA', 'ม่วงอ่อน': '#D6BCFA', 'ลาเวนเดอร์': '#B794F4',
  'เขียว': '#48BB78', 'เขียวอ่อน': '#9AE6B4', 'เขียวมิ้นต์': '#81E6D9',
  'เขียวเข้ม': '#276749', 'เขียวมรกต': '#2F855A',
  'เหลือง': '#ECC94B', 'เหลืองทอง': '#F6AD55', 'เหลืองนวล': '#FAF089',
  'ส้ม': '#ED8936', 'ส้มอ่อน': '#FBD38D', 'ส้มเข้ม': '#C05621',
  'ทอง': '#D4AF37', 'เงิน': '#C0C0C0',
  'น้ำตาล': '#92400E', 'น้ำตาลอ่อน': '#D4A574', 'น้ำตาลแดง': '#9C4221',
  'นู้ด': '#D4A574', 'แดงอิฐ': '#B7472A', 'แดงสด': '#FF0000',
  'แดงคลาสสิก': '#C41E3A', 'ปะการัง': '#FF7F50', 'ส้มปะการัง': '#FF6B35',
  'ม่วงเบอร์กันดี': '#800020', 'ชมพูฟูเชีย': '#FF1493',
  'ทิ้นท์แดง': '#DC143C', 'ทิ้นท์ชมพู': '#FF69B4',
};

// ── 8. Function หลัก ──

// คำนวณวันในสัปดาห์จากวัน เดือน ปีค.ศ.
function getDayOfWeek(day, month, yearCE) {
  const d = new Date(yearCE, month - 1, day);
  return d.getDay(); // 0=อาทิตย์, 1=จันทร์, ...
}

// หาสีที่เหมาะกับกิจกรรมและไม่กาลกิณีวันเกิด
function getBestColor(activity, birthDow) {
  const activityColors = ACTIVITY_LUCKY_COLORS[activity].colors;
  const avoid = GALAGINI[birthDow];

  // หาสีแรกที่ไม่อยู่ในกาลกิณี
  const safeColor = activityColors.find(c => !avoid.some(a => c.includes(a) || a.includes(c)));
  return safeColor || activityColors[0]; // ถ้าไม่มีก็ใช้สีแรก
}

// หาสีกระเป๋าที่แมทช์
function getBagColor(shirtColor) {
  return BAG_MATCH[shirtColor] || { color: 'น้ำตาล', alt: 'ครีม', style: 'shoulder bag' };
}

// ── 9. คำนวณ outfit ทั้งหมด ──
function calculateOutfit(day, month, yearCE, activity, gender) {
  const birthDow = getDayOfWeek(day, month, yearCE);
  const todayDow = new Date().getDay();
  const todayColors = TODAY_COLORS[todayDow];
  const avoid = GALAGINI[birthDow];

  // สีเสื้อหลัก
  const mainShirtColor = getBestColor(activity, birthDow);

  // สีเสื้อสำรอง (ถ้าหลักกาลกิณี)
  const actColors = ACTIVITY_LUCKY_COLORS[activity].colors;
  const safeColors = actColors.filter(c => !avoid.some(a => c.includes(a) || a.includes(c)));

  // กระเป๋า
  const bag = getBagColor(mainShirtColor);

  // รองเท้า
  const shoes = SHOES_GUIDE[activity][gender];

  // ลิป (ผญเท่านั้น)
  const lip = gender === 'female' ? LIP_GUIDE[activity] : null;

  // เล็บ (ผญเท่านั้น)
  const nail = gender === 'female' ? NAIL_GUIDE[activity] : null;

  return {
    birthDow,
    todayDow,
    todayEnergy: todayColors.energy,
    avoid,
    mainShirtColor,
    safeColors,
    bag,
    shoes,
    lip,
    nail,
    activityInfo: ACTIVITY_LUCKY_COLORS[activity],
  };
}

// ── TODAY_COLORS (ยังคงใช้จาก v1) ──
const TODAY_COLORS = {
  0: { lucky: ['แดง', 'ชมพูแดง', 'ส้มแดง'], avoid: ['ฟ้า', 'น้ำเงิน'], energy: 'วันแห่งพลังงานสูง เหมาะสร้างความประทับใจค่ะ' },
  1: { lucky: ['เหลือง', 'ครีม', 'ขาวนวล'], avoid: ['แดง'], energy: 'วันแห่งความอ่อนโยน เหมาะพบปะผู้คนค่ะ' },
  2: { lucky: ['ชมพู', 'แดง', 'บานเย็น'], avoid: ['เหลือง', 'ขาว'], energy: 'วันแห่งพลังและความกล้า เหมาะลงมือทำสิ่งใหม่ค่ะ' },
  3: { lucky: ['เขียว', 'เขียวอ่อน', 'เขียวมิ้นต์'], avoid: ['ชมพู'], energy: 'วันแห่งการสื่อสาร เหมาะเจรจาต่อรองค่ะ' },
  4: { lucky: ['ส้ม', 'เหลืองทอง', 'น้ำตาล'], avoid: ['เขียว'], energy: 'วันแห่งโชคลาภ เหมาะลงทุนและเริ่มต้นสิ่งดีๆ ค่ะ' },
  5: { lucky: ['ฟ้า', 'ฟ้าอ่อน', 'ครีม'], avoid: ['ดำ'], energy: 'วันแห่งความงามและเสน่ห์ เหมาะเดตและสังสรรค์ค่ะ' },
  6: { lucky: ['ม่วง', 'ดำ', 'เทา'], avoid: ['ส้ม'], energy: 'วันแห่งความลึกและปัญญา เหมาะเรียนรู้และพัฒนาตัวเองค่ะ' },
};

// ── BIRTHDAY_COLORS (สีมงคลวันเกิด) ──
const BIRTHDAY_COLORS = {
  0: { lucky: ['แดง', 'ส้มแดง', 'ชมพูแดง'], avoid: GALAGINI[0], avoidReason: 'สีฟ้า-น้ำเงินเป็นกาลกิณีของคนวันอาทิตย์ค่ะ' },
  1: { lucky: ['เหลือง', 'ครีม', 'เหลืองทอง'], avoid: GALAGINI[1], avoidReason: 'สีแดงเป็นกาลกิณีของคนวันจันทร์ค่ะ' },
  2: { lucky: ['ชมพู', 'ชมพูเข้ม', 'บานเย็น'], avoid: GALAGINI[2], avoidReason: 'สีเหลือง-ขาวเป็นกาลกิณีของคนวันอังคารค่ะ' },
  3: { lucky: ['เขียว', 'เขียวอ่อน', 'เขียวมิ้นต์'], avoid: GALAGINI[3], avoidReason: 'สีชมพูเป็นกาลกิณีของคนวันพุธค่ะ' },
  4: { lucky: ['ส้ม', 'เหลืองทอง', 'น้ำตาลทอง'], avoid: GALAGINI[4], avoidReason: 'สีเขียวเป็นกาลกิณีของคนวันพฤหัสค่ะ' },
  5: { lucky: ['ฟ้า', 'ฟ้าอ่อน', 'ฟ้าคราม'], avoid: GALAGINI[5], avoidReason: 'สีดำเป็นกาลกิณีของคนวันศุกร์ค่ะ' },
  6: { lucky: ['ม่วง', 'ม่วงเข้ม', 'ดำ'], avoid: GALAGINI[6], avoidReason: 'สีส้มเป็นกาลกิณีของคนวันเสาร์ค่ะ' },
};

// ── ZODIAC ──
function getZodiac(month, day) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { key: 'aries', name: 'เมษ', lucky: ['ทอง', 'แดง', 'ส้ม'] };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { key: 'taurus', name: 'พฤษภ', lucky: ['เขียว', 'เขียวมิ้นต์', 'ครีม'] };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { key: 'gemini', name: 'เมถุน', lucky: ['เหลือง', 'ขาว', 'เงิน'] };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { key: 'cancer', name: 'กรกฎ', lucky: ['ขาว', 'เงิน', 'ฟ้าอ่อน'] };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { key: 'leo', name: 'สิงห์', lucky: ['ทอง', 'ส้มทอง', 'เหลืองทอง'] };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { key: 'virgo', name: 'กันย์', lucky: ['เขียว', 'น้ำตาลอ่อน', 'ครีม'] };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { key: 'libra', name: 'ตุลย์', lucky: ['ชมพู', 'ฟ้าอ่อน', 'ขาว'] };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { key: 'scorpio', name: 'พิจิก', lucky: ['ดำ', 'แดงเข้ม', 'ม่วงเข้ม'] };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { key: 'sagittarius', name: 'ธนู', lucky: ['ม่วง', 'น้ำเงิน', 'ม่วงอ่อน'] };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { key: 'capricorn', name: 'มกร', lucky: ['น้ำตาล', 'เทา', 'ดำ'] };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { key: 'aquarius', name: 'กุมภ์', lucky: ['น้ำเงิน', 'ฟ้า', 'เงิน'] };
  return { key: 'pisces', name: 'มีน', lucky: ['ลาเวนเดอร์', 'ฟ้าอ่อน', 'เขียวมิ้นต์'] };
}
