// oracle-hindu-data.js
// ใช้ var เพื่อให้เป็น global scope ดึงได้จากทุกไฟล์

var HINDU_ORACLE = {
  deities: [
    {
      id: "brahma",
      name: "พระพรหม",
      image: "brahma.png",
      meaning: "พลังแห่งการสร้างสรรค์ จุดเริ่มต้นใหม่ ความคิดสร้างสรรค์กำลังผลิบาน",
      keyword: "การเริ่มต้น",
      weapon_id: "lotus",
      vahana_id: "swan"
    },
    {
      id: "vishnu",
      name: "พระวิษณุ",
      image: "vishnu.png",
      meaning: "พลังแห่งการรักษาสมดุล ปกป้องสิ่งดีงามในชีวิต ความมั่นคงและความสงบ",
      keyword: "การรักษา",
      weapon_id: "chakra",
      vahana_id: "garuda"
    },
    {
      id: "shiva",
      name: "พระอิศวร",
      image: "shiva.png",
      meaning: "พลังแห่งการเปลี่ยนแปลง ทำลายสิ่งเก่าที่ไม่ดี เพื่อเปิดทางให้สิ่งใหม่",
      keyword: "การเปลี่ยนแปลง",
      weapon_id: "trishul",
      vahana_id: "nandi"
    },
    {
      id: "saraswati",
      name: "พระแม่สรัสวดี",
      image: "saraswati.png",
      meaning: "พลังแห่งปัญญาและศิลปะ การเรียนรู้และความคิดสร้างสรรค์กำลังเบ่งบาน",
      keyword: "ปัญญา",
      weapon_id: "veena",
      vahana_id: "swan"
    },
    {
      id: "lakshmi",
      name: "พระแม่ลักษมี",
      image: "lakshmi.png",
      meaning: "พลังแห่งโชคลาภและความอุดมสมบูรณ์ ทรัพย์สินและความสุขกำลังไหลเข้ามา",
      keyword: "โชคลาภ",
      weapon_id: "lotus",
      vahana_id: "owl"
    },
    {
      id: "parvati",
      name: "พระแม่ปารวตี",
      image: "parvati.png",
      meaning: "พลังแห่งความรักและความอดทน ความสัมพันธ์และครอบครัวคือพลังที่แท้จริง",
      keyword: "ความรัก",
      weapon_id: "lotus",
      vahana_id: "lion"
    },
    {
      id: "durga",
      name: "พระแม่ทุรคา",
      image: "durga.png",
      meaning: "พลังแห่งความกล้าหาญ ปราบอุปสรรคทุกอย่างได้ ไม่มีอะไรหยุดเธอได้",
      keyword: "ความกล้า",
      weapon_id: "trishul",
      vahana_id: "lion"
    },
    {
      id: "kali",
      name: "พระแม่กาลี",
      image: "kali.png",
      meaning: "พลังแห่งการปลดปล่อย ตัดสิ่งที่ฉุดรั้งออกไป การเปลี่ยนแปลงที่รุนแรงแต่จำเป็น",
      keyword: "การปลดปล่อย",
      weapon_id: "sword",
      vahana_id: "tiger"
    },
    {
      id: "ganesha",
      name: "พระพิฆเนศ",
      image: "ganesha.png",
      meaning: "พลังแห่งการเปิดทาง อุปสรรคกำลังถูกกำจัด โชคดีและความสำเร็จกำลังมา",
      keyword: "เปิดทาง",
      weapon_id: "ankush",
      vahana_id: "mouse"
    },
    {
      id: "kartikeya",
      name: "พระขันธกุมาร",
      image: "kartikeya.png",
      meaning: "พลังแห่งชัยชนะและความกล้า ลุยไปข้างหน้าอย่างมีเป้าหมาย ชัยชนะอยู่ไม่ไกล",
      keyword: "ชัยชนะ",
      weapon_id: "vel",
      vahana_id: "peacock"
    },
    {
      id: "hanuman",
      name: "พระหนุมาน",
      image: "hanuman.png",
      meaning: "พลังแห่งความจงรักภักดีและกำลังใจ ความทุ่มเทสุดหัวใจจะนำไปสู่ความสำเร็จ",
      keyword: "ความทุ่มเท",
      weapon_id: "gada",
      vahana_id: "cloud"
    },
    {
      id: "indra",
      name: "พระอินทร์",
      image: "indra.png",
      meaning: "พลังแห่งความเป็นผู้นำ อำนาจและอิทธิพลกำลังเพิ่มขึ้น ถึงเวลาแสดงตัวตน",
      keyword: "ความเป็นผู้นำ",
      weapon_id: "vajra",
      vahana_id: "elephant"
    }
  ],

  weapons: [
    { id: "trishul", name: "ตรีศูล", image: "trishul.png", meaning: "เครื่องมือแห่งการตัดสินใจ ตัดสินใจอย่างเด็ดขาดในสามทิศทางของชีวิต", keyword: "การตัดสินใจ" },
    { id: "chakra", name: "จักรสุทรรศน์", image: "chakra.png", meaning: "เครื่องมือแห่งความยุติธรรม สิ่งที่ถูกต้องจะได้รับการปกป้อง ความจริงจะปรากฏ", keyword: "ความยุติธรรม" },
    { id: "vajra", name: "วัชระ", image: "vajra.png", meaning: "เครื่องมือแห่งพลังอันแน่วแน่ ความแข็งแกร่งภายในคือสิ่งที่มีอยู่แล้ว ใช้มันเถอะ", keyword: "พลังภายใน" },
    { id: "lotus", name: "ดอกบัว", image: "lotus.png", meaning: "เครื่องมือแห่งความบริสุทธิ์ใจ ความดีงามจะผลิบานแม้ในสภาพแวดล้อมที่ยาก", keyword: "ความบริสุทธิ์" },
    { id: "veena", name: "พิณวีณา", image: "veena.png", meaning: "เครื่องมือแห่งความสร้างสรรค์ ศิลปะและดนตรีคือทางออกของจิตใจตอนนี้", keyword: "ความสร้างสรรค์" },
    { id: "conch", name: "สังข์", image: "conch.png", meaning: "เครื่องมือแห่งการสื่อสาร พูดความจริงออกมา เสียงของเธอมีพลังมากกว่าที่คิด", keyword: "การสื่อสาร" },
    { id: "ankush", name: "อัณกุศและโมทกะ", image: "ankush.png", meaning: "เครื่องมือแห่งการควบคุมและรางวัล จัดการสิ่งต่างๆ ให้เป็นระเบียบ แล้วจะได้รับผล", keyword: "การจัดการ" },
    { id: "vel", name: "หอกเวล", image: "vel.png", meaning: "เครื่องมือแห่งความมุ่งมั่น โฟกัสไปที่เป้าหมายเดียว แล้วแทงทะลุทุกอุปสรรค", keyword: "ความมุ่งมั่น" },
    { id: "gada", name: "คทา", image: "gada.png", meaning: "เครื่องมือแห่งพลังและอำนาจ ความแข็งแกร่งของเธอยิ่งใหญ่กว่าที่คิด ใช้มันได้เลย", keyword: "พลังอำนาจ" },
    { id: "sword", name: "ดาบและดอกบัว", image: "sword.png", meaning: "เครื่องมือแห่งการปลดปล่อยด้วยความรัก ตัดสิ่งที่เป็นพิษออก แต่ยังคงความเมตตา", keyword: "การปลดปล่อย" },
    { id: "damaru", name: "กลองฑมรุ", image: "damaru.png", meaning: "เครื่องมือแห่งจังหวะชีวิต ทุกอย่างมีเวลาของมัน ตอนนี้คือช่วงฟังจังหวะตัวเอง", keyword: "จังหวะชีวิต" },
    { id: "bow", name: "ธนู", image: "bow.png", meaning: "เครื่องมือแห่งการเล็งเป้า ยิ่งดึงให้ตึงมากเท่าไหร่ ยิ่งไปได้ไกลเท่านั้น", keyword: "การเล็งเป้า" }
  ],

  vahanas: [
    { id: "nandi", name: "โคนนทิ", image: "nandi.png", meaning: "พาหนะแห่งความอดทนและความซื่อสัตย์ เดินหน้าช้าๆ แต่มั่นคง จะถึงที่หมายแน่นอน", keyword: "ความอดทน" },
    { id: "garuda", name: "ครุฑ", image: "garuda.png", meaning: "พาหนะแห่งความเร็วและการมองการณ์ไกล บินสูงขึ้น มองภาพรวม อย่าจมอยู่กับรายละเอียด", keyword: "มองการณ์ไกล" },
    { id: "peacock", name: "นกยูง", image: "peacock.png", meaning: "พาหนะแห่งความงามและความมั่นใจ แสดงตัวตนออกมา ความงามของเธอคือพลัง", keyword: "ความมั่นใจ" },
    { id: "mouse", name: "หนูมูษิกา", image: "mouse.png", meaning: "พาหนะแห่งความเล็กแต่ทรงพลัง ไม่ต้องใหญ่โตก็ทำได้ ความละเอียดรอบคอบคือทางชนะ", keyword: "ความละเอียด" },
    { id: "lion", name: "สิงห์", image: "lion.png", meaning: "พาหนะแห่งความกล้าและศักดิ์ศรี เดินหน้าอย่างองอาจ ไม่มีใครหยุดเธอได้", keyword: "ศักดิ์ศรี" },
    { id: "tiger", name: "เสือดำ", image: "tiger.png", meaning: "พาหนะแห่งพลังในความมืด สัญชาตญาณของเธอแม่นยำ เชื่อใจมันได้เลย", keyword: "สัญชาตญาณ" },
    { id: "swan", name: "หงส์", image: "swan.png", meaning: "พาหนะแห่งปัญญาและสง่างาม แยกแยะสิ่งดีออกจากความวุ่นวาย เลือกเฉพาะสิ่งที่ดีที่สุด", keyword: "ปัญญาแยกแยะ" },
    { id: "owl", name: "นกฮูก", image: "owl.png", meaning: "พาหนะแห่งการมองเห็นในความมืด สิ่งที่คนอื่นมองไม่เห็น เธอเห็นได้ ใช้ความได้เปรียบนี้", keyword: "การมองเห็น" },
    { id: "elephant", name: "ช้างไอราวัต", image: "elephant.png", meaning: "พาหนะแห่งความยิ่งใหญ่และพลัง ทุกก้าวของเธอมีน้ำหนัก ทำสิ่งยิ่งใหญ่ได้แน่นอน", keyword: "ความยิ่งใหญ่" },
    { id: "cow", name: "โคเผือก", image: "cow.png", meaning: "พาหนะแห่งความอุดมสมบูรณ์และความเอื้ออาทร ให้โดยไม่หวังผล แล้วจะได้รับคืนเป็นทวีคูณ", keyword: "ความเอื้ออาทร" },
    { id: "rooster", name: "ไก่แจ้", image: "rooster.png", meaning: "พาหนะแห่งการตื่นรู้และการเริ่มต้น ถึงเวลาตื่นแล้ว อย่าปล่อยให้โอกาสหลุดมือ", keyword: "การตื่นรู้" },
    { id: "cloud", name: "เมฆทอง", image: "cloud.png", meaning: "พาหนะแห่งพลังศักดิ์สิทธิ์ที่ล่องลอยเหนือทุกสิ่ง ไม่มีอุปสรรคใดขวางกั้นได้ พุ่งทะยานสู่เป้าหมายได้เลย", keyword: "ทะยานสูง" }
  ]
};

var HINDU_ORACLE_BACK = "bhindu.png";
