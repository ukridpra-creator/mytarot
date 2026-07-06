// --------- State ---------
const S = {
  coins: 50,
  day: 1, timer: 0,
  potMix: [], // ส่วนผสมในหม้อ
  egg: null,  // {heat, clean, calm, care}
  dragging: null,
  last: performance.now()
};

const $ = (q)=>document.querySelector(q);
const $$ = (q)=>document.querySelectorAll(q);

// --------- UI refs ---------
const coinsEl = $('#coins');
const dayEl = $('#day');
const logEl = $('#log');
const potEl = $('#pot');
const eggEl = $('#egg');
const lampEl = $('#lamp');
const bars = { heat: $('#heat'), clean: $('#clean'), calm: $('#calm'), care: $('#care') };

// --------- Helpers ---------
const rect = el => el.getBoundingClientRect();
const inBox = (a,b)=>!(a.right<b.left||a.left>b.right||a.bottom<b.top||a.top>b.bottom);
function setLog(t){ logEl.textContent = t; }
function render(){
  coinsEl.textContent = S.coins;
  dayEl.textContent = `Day ${S.day} / 3`;
  if(S.egg){
    for(const k of Object.keys(bars)){ bars[k].value = S.egg[k]; }
  }
}
function addToPot(id, price){
  if(S.coins < price) return setLog('เหรียญไม่พอ');
  S.coins -= price; S.potMix.push(id);
  setLog(`ใส่ ${id} ลงหม้อแล้ว (${S.potMix.length})`);
  pulse(potEl);
  render();
}
function pulse(el){
  el.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],
             {duration:280, easing:'ease-out'});
}

// --------- Drag & Drop (Pointer Events) ---------
let dragData = null;
function onPointerDown(e){
  const t = e.target.closest('.draggable'); if(!t) return;
  dragData = { el:t, dx:e.clientX - t.offsetLeft, dy:e.clientY - t.offsetTop, start: {x:e.clientX,y:e.clientY} };
  t.setPointerCapture(e.pointerId);
  t.style.position = 'absolute'; t.style.zIndex = 10;
}
function onPointerMove(e){
  if(!dragData) return;
  const {el, dx, dy} = dragData;
  el.style.left = (e.clientX - dx) + 'px';
  el.style.top  = (e.clientY - dy) + 'px';

  // ถ้าลาก "ไข่" เข้าใกล้โคมไฟ เพิ่มอุณหภูมิแบบเรียลไทม์
  if(el.id === 'egg' && S.egg){
    const d = distanceCenter(el, lampEl);
    const gain = Math.max(0, 60 - d) / 60 * 0.4; // ต่อเฟรม
    S.egg.heat = clamp01(S.egg.heat + gain);
  }
}
function onPointerUp(e){
  if(!dragData) return;
  const {el} = dragData;
  // วางไอเท็มร้านค้าลงหม้อ
  if(el.classList.contains('item') && inBox(rect(el), rect(potEl))){
    addToPot(el.dataset.id, +el.dataset.price);
    // คืนตำแหน่งเดิม
    el.style.position=''; el.style.left=''; el.style.top=''; el.style.zIndex='';
  }
  dragData = null;
}
function distanceCenter(a,b){
  const ra = rect(a), rb = rect(b);
  const ax = (ra.left+ra.right)/2, ay=(ra.top+ra.bottom)/2;
  const bx = (rb.left+rb.right)/2, by=(rb.top+rb.bottom)/2;
  const dx=ax-bx, dy=ay-by; return Math.hypot(dx,dy);
}
function clamp01(x){ return Math.max(0, Math.min(100, x)); }

// --------- Brew & Egg ---------
$('#brew').addEventListener('click', ()=>{
  if(S.potMix.length===0) return setLog('ยังไม่มีส่วนผสม');
  // คะแนนสูตรง่ายๆ
  const score = S.potMix.reduce((n,id)=> n + ({moonleaf:20, stardust:35, honey:10}[id]||5), 0);
  S.potMix.length = 0;
  S.egg = { heat: 40, clean: 80, calm: 70, care: 60, rarity: score>=60?'rare':(score>=40?'uncommon':'common') };
  eggEl.classList.remove('hidden');
  setLog('ได้ไข่ลึกลับ! ดูแลให้ดี 3 วัน');
  pulse(eggEl);
  render();
});

// --------- Daily decay & interactions ---------
function update(dt){
  if(S.egg){
    // ลดค่าสถานะเล็กน้อยต่อเวลา
    S.egg.heat  = clamp01(S.egg.heat - 3*dt);
    S.egg.clean = clamp01(S.egg.clean - 1.5*dt);
    S.egg.calm  = clamp01(S.egg.calm - 1.0*dt);
    // ห่วงใยเพิ่มช้าๆ ถ้าผู้เล่นลากไข่มาใกล้ตัวละคร/ไอคอนหัวใจ (ยกเว้นยังไม่มี)
  }

  S.timer += dt;
  if(S.timer >= 60){ // 60 วินาที ~ 1 วัน (สำหรับต้นแบบ)
    S.timer = 0; S.day++;
    if(S.day>3 && S.egg){ hatch(); }
  }
}
function hatch(){
  // คะแนนฟักรวม
  const e = S.egg;
  const score = (e.heat + e.clean + e.calm + e.care)/4 + (e.rarity==='rare'?15:e.rarity==='uncommon'?5:0);
  const form = score>=80?'มังกรจิ๋ว'
             : score>=65?'กวางจันทรา'
             : score>=50?'จิ้งจอกสายหมอก'
             : 'สไลม์ประกายดาว';
  setLog(`ไข่ฟักเป็น ${form}! (คะแนน ${Math.round(score)})`);
  // TODO: สลับไปสเตจสัตว์เลี้ยงจริง (หน้าจอดูแลรายวัน/มินิเกม)
  eggEl.classList.add('hidden');
  // ให้รางวัล
  S.coins += 25;
  // รีเซ็ตสำหรับเดโม
  S.day = 1; S.egg = null;
}

// --------- Loop ---------
function loop(ts){
  const dt = Math.min(0.05, (ts - S.last)/1000); S.last = ts;
  update(dt); render();
  requestAnimationFrame(loop);
}

// --------- Init & Events ---------
window.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

render(); requestAnimationFrame(loop);
