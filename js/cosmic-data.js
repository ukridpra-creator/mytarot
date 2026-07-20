// cosmic-data.js
// ไพ่พลังแห่งจักรวาล 30 ใบ (Planet/Event/Concept 10+10+10) — แยกออกมาจาก oracle-cosmic.html เดิม
var PLANET_CARDS = [
  { id:'p1',  name:'Sun',     deck:'Planet', meaning:'ตัวตน, พลังชีวิต, ความสำเร็จ',         img:'../images/cosmic/p1.png' },
  { id:'p2',  name:'Moon',    deck:'Planet', meaning:'อารมณ์, จิตใต้สำนึก, สัญชาตญาณ',       img:'../images/cosmic/p2.png' },
  { id:'p3',  name:'Mercury', deck:'Planet', meaning:'การสื่อสาร, ความคิด, การเดินทาง',       img:'../images/cosmic/p3.png' },
  { id:'p4',  name:'Venus',   deck:'Planet', meaning:'ความรัก, ความงาม, เงิน',               img:'../images/cosmic/p4.png' },
  { id:'p5',  name:'Mars',    deck:'Planet', meaning:'พลังงาน, ความทะเยอทะยาน, การกระทำ',     img:'../images/cosmic/p5.png' },
  { id:'p6',  name:'Jupiter', deck:'Planet', meaning:'โชค, การเติบโต, โอกาส',                img:'../images/cosmic/p6.png' },
  { id:'p7',  name:'Saturn',  deck:'Planet', meaning:'บทเรียน, กรรม, วินัย',                  img:'../images/cosmic/p7.png' },
  { id:'p8',  name:'Uranus',  deck:'Planet', meaning:'การเปลี่ยนแปลงกะทันหัน, นวัตกรรม',     img:'../images/cosmic/p8.png' },
  { id:'p9',  name:'Neptune', deck:'Planet', meaning:'ความฝัน, จิตวิญญาณ, ความสร้างสรรค์',   img:'../images/cosmic/p9.png' },
  { id:'p10', name:'Pluto',   deck:'Planet', meaning:'การเปลี่ยนแปลงลึก, อำนาจ, การเกิดใหม่', img:'../images/cosmic/p10.png' },
];
var EVENT_CARDS = [
  { id:'e1',  name:'Eclipse',       deck:'Event', meaning:'จุดเปลี่ยน, สิ่งซ่อนเร้น, การเปิดเผย', img:'../images/cosmic/e1.png' },
  { id:'e2',  name:'Supernova',     deck:'Event', meaning:'การระเบิด, พลังงานมหาศาล, เริ่มใหม่',  img:'../images/cosmic/e2.png' },
  { id:'e3',  name:'Black Hole',    deck:'Event', meaning:'ถูกดูด, ความว่างเปล่า, การดูดกลืน',   img:'../images/cosmic/e3.png' },
  { id:'e4',  name:'Collapse',      deck:'Event', meaning:'พังทลาย, ล้มเหลว, ต้องสร้างใหม่',     img:'../images/cosmic/e4.png' },
  { id:'e5',  name:'Collision',     deck:'Event', meaning:'การปะทะ, ความขัดแย้ง, เปลี่ยนทิศ',   img:'../images/cosmic/e5.png' },
  { id:'e6',  name:'Meteor Shower', deck:'Event', meaning:'หลายเรื่องถาโถม, โอกาสหลายทาง',      img:'../images/cosmic/e6.png' },
  { id:'e7',  name:'Comet',         deck:'Event', meaning:'เข้ามาเร็ว, โอกาสชั่วคราว',          img:'../images/cosmic/e7.png' },
  { id:'e8',  name:'Nebula',        deck:'Event', meaning:'ยังไม่ชัด, กำลังก่อตัว',             img:'../images/cosmic/e8.png' },
  { id:'e9',  name:'Solar Flare',   deck:'Event', meaning:'พลังพุ่ง, รุนแรง, ระวังอารมณ์',      img:'../images/cosmic/e9.png' },
  { id:'e10', name:'Expansion',     deck:'Event', meaning:'ขยาย, เติบโต, ออกจาก comfort zone', img:'../images/cosmic/e10.png' },
];
var CONCEPT_CARDS = [
  { id:'c1',  name:'Time',        deck:'Concept', meaning:'เวลา, จังหวะ, ความอดทน',               img:'../images/cosmic/c1.png' },
  { id:'c2',  name:'Space',       deck:'Concept', meaning:'ระยะ, ช่องว่าง, โอกาส',               img:'../images/cosmic/c2.png' },
  { id:'c3',  name:'Energy',      deck:'Concept', meaning:'พลัง, แรงขับ, ความมีชีวิตชีวา',         img:'../images/cosmic/c3.png' },
  { id:'c4',  name:'Balance',     deck:'Concept', meaning:'สมดุล, กลาง, ความเท่าเทียม',           img:'../images/cosmic/c4.png' },
  { id:'c5',  name:'Chaos',       deck:'Concept', meaning:'วุ่นวาย, คุมไม่ได้, พลังสร้างสรรค์',   img:'../images/cosmic/c5.png' },
  { id:'c6',  name:'Order',       deck:'Concept', meaning:'เป็นระบบ, ควบคุม, ความชัดเจน',         img:'../images/cosmic/c6.png' },
  { id:'c7',  name:'Creation',    deck:'Concept', meaning:'เริ่ม, สร้าง, ศักยภาพใหม่',            img:'../images/cosmic/c7.png' },
  { id:'c8',  name:'Destruction', deck:'Concept', meaning:'ทำลาย, จบ, เพื่อเริ่มใหม่',            img:'../images/cosmic/c8.png' },
  { id:'c9',  name:'Infinity',    deck:'Concept', meaning:'ไม่สิ้นสุด, ต่อเนื่อง, นิรันดร์',       img:'../images/cosmic/c9.png' },
  { id:'c10', name:'Void',        deck:'Concept', meaning:'ว่างเปล่า, ไม่มี, พื้นที่ใหม่',         img:'../images/cosmic/c10.png' },
];