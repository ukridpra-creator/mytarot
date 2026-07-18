// fengshui-data.js — คำนวณเลขกัว (Kua Number) และคำแนะนำจัดห้องตามฮวงจุ้ยส่วนบุคคล

const DIRECTION_TH = {
  N: 'ทิศเหนือ', S: 'ทิศใต้', E: 'ทิศตะวันออก', W: 'ทิศตะวันตก',
  NE: 'ทิศตะวันออกเฉียงเหนือ', SE: 'ทิศตะวันออกเฉียงใต้',
  SW: 'ทิศตะวันตกเฉียงใต้', NW: 'ทิศตะวันตกเฉียงเหนือ'
};

const KUA_TABLE = {
  1: { element: 'น้ำ', emoji: '💧', group: 'ตะวันออก',
       lucky: { wealth: 'SE', health: 'E', love: 'S', growth: 'N' },
       unlucky: { mishap: 'W', ghosts: 'NE', killings: 'NW', loss: 'SW' } },
  2: { element: 'ดิน', emoji: '🟤', group: 'ตะวันตก',
       lucky: { wealth: 'NE', health: 'W', love: 'NW', growth: 'SW' },
       unlucky: { mishap: 'SE', ghosts: 'E', killings: 'S', loss: 'N' } },
  3: { element: 'ไม้', emoji: '🌳', group: 'ตะวันออก',
       lucky: { wealth: 'S', health: 'N', love: 'SE', growth: 'E' },
       unlucky: { mishap: 'SW', ghosts: 'NW', killings: 'NE', loss: 'W' } },
  4: { element: 'ไม้', emoji: '🌿', group: 'ตะวันออก',
       lucky: { wealth: 'N', health: 'S', love: 'E', growth: 'SE' },
       unlucky: { mishap: 'NW', ghosts: 'SW', killings: 'W', loss: 'NE' } },
  6: { element: 'ทอง', emoji: '⚪', group: 'ตะวันตก',
       lucky: { wealth: 'W', health: 'NE', love: 'SW', growth: 'NW' },
       unlucky: { mishap: 'N', ghosts: 'SE', killings: 'E', loss: 'S' } },
  7: { element: 'ทอง', emoji: '⚙️', group: 'ตะวันตก',
       lucky: { wealth: 'NW', health: 'SW', love: 'NE', growth: 'W' },
       unlucky: { mishap: 'E', ghosts: 'S', killings: 'SE', loss: 'N' } },
  8: { element: 'ดิน', emoji: '⛰️', group: 'ตะวันตก',
       lucky: { wealth: 'SW', health: 'NW', love: 'W', growth: 'NE' },
       unlucky: { mishap: 'S', ghosts: 'N', killings: 'SE', loss: 'E' } },
  9: { element: 'ไฟ', emoji: '🔥', group: 'ตะวันออก',
       lucky: { wealth: 'E', health: 'SE', love: 'N', growth: 'S' },
       unlucky: { mishap: 'NE', ghosts: 'W', killings: 'SW', loss: 'NW' } }
};

function reduceToSingleDigit(n) {
  while (n > 9) {
    n = String(n).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return n;
}

function calcKua(yearCE, gender) {
  const last2 = yearCE % 100;
  let sum = reduceToSingleDigit(String(last2).split('').reduce((a, b) => a + parseInt(b), 0));
  let kua;
  if (gender === 'male') {
    kua = yearCE >= 2000 ? 9 - sum : 10 - sum;
    if (kua === 0) kua = 9;
    if (kua === 5) kua = 2;
  } else {
    kua = yearCE >= 2000 ? 6 + sum : 5 + sum;
    kua = reduceToSingleDigit(kua);
    if (kua === 5) kua = 8;
  }
  return kua;
}

function getRoomAdvice(info) {
  const d = info.lucky;
  return [
    {
      icon: '🛏️',
      room: 'ห้องนอน',
      dir: DIRECTION_TH[d.health],
      text: `ควรตั้งหัวเตียงให้หันไปทาง${DIRECTION_TH[d.health]} (ทิศสุขภาพของคุณพี่) จะช่วยให้หลับสนิทและร่างกายแข็งแรงขึ้นค่ะ หลีกเลี่ยงการวางเตียงให้ปลายเท้าหันตรงประตูพอดี`
    },
    {
      icon: '🛋️',
      room: 'ห้องรับแขก',
      dir: DIRECTION_TH[d.wealth],
      text: `โซฟาตัวหลักควรหันหน้าไปทาง${DIRECTION_TH[d.wealth]} (ทิศทรัพย์ของคุณพี่) เพื่อดึงดูดโชคลาภเข้าบ้าน หลีกเลี่ยงฉากกั้นตรงทางเข้าค่ะ`
    },
    {
      icon: '💼',
      room: 'ห้องทำงาน',
      dir: DIRECTION_TH[d.growth],
      text: `โต๊ะทำงานควรหันหน้าไปทาง${DIRECTION_TH[d.growth]} (ทิศเติบโตของคุณพี่) ช่วยเสริมสมาธิและความก้าวหน้าในหน้าที่การงานค่ะ`
    },
    {
      icon: '🍳',
      room: 'ห้องครัว',
      dir: DIRECTION_TH[d.wealth],
      text: `เตาไฟควรตั้งให้ผู้ทำอาหารหันหน้าไปทาง${DIRECTION_TH[d.wealth]}เวลาทำอาหารค่ะ จำนวนหัวเตาที่แนะนำคือ 3 หรือ 5 หัวจะเป็นมงคลที่สุด`
    }
  ];
}

function calcFengshui(day, month, yearCE, gender) {
  const kua = calcKua(yearCE, gender);
  const info = KUA_TABLE[kua];
  const rooms = getRoomAdvice(info);
  return { kua, ...info, rooms };
}