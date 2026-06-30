// js/checkin.js
// Shared component — include ในทุกหน้า แล้วเรียก setupCheckin(user, apiBase)

(function() {

// ─── INJECT HTML ───
var html = `
<div class="ci-overlay" id="ciOverlay" onclick="if(event.target===this)closeCheckin()">
  <div class="ci-sheet">
    <button class="ci-close" onclick="closeCheckin()">✕</button>

    <div class="ci-badge">🎯 เช็คอินประจำวัน</div>
    <div class="ci-title">รับเหรียญฟรีทุกวัน</div>
    <div class="ci-sub">เช็คอิน 7 วันติดรับโบนัสพิเศษ 👑</div>

    <div class="ci-days" id="ciDays">
      <div class="ci-skel"></div><div class="ci-skel"></div>
      <div class="ci-skel"></div><div class="ci-skel"></div>
      <div class="ci-skel"></div><div class="ci-skel"></div>
      <div class="ci-skel"></div>
    </div>

    <div class="ci-reward-wrap" id="ciRewardWrap">
      <div class="ci-reward-icon" id="ciRewardIcon">🪙</div>
      <div class="ci-reward-amt" id="ciRewardAmt">+10 เหรียญ</div>
      <div class="ci-reward-label" id="ciRewardLabel">กำลังโหลด...</div>
    </div>

    <button class="ci-btn" id="ciBtnDo" onclick="doCheckin()" disabled>🎁 รับเหรียญเลย</button>
    <div class="ci-done-text" id="ciDoneText"></div>
  </div>
</div>

<style>
.ci-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(4px);
  display: none; align-items: center; justify-content: center;
}
.ci-overlay.show { display: flex; }

.ci-sheet {
  background: linear-gradient(160deg, #1e0a3c 0%, #0d0820 100%);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 28px; padding: 28px 20px 32px;
  width: 90%; max-width: 340px;
  text-align: center; position: relative;
  box-shadow: 0 0 60px rgba(124,58,237,0.25), inset 0 1px 0 rgba(212,175,55,0.1);
  animation: ciSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes ciSlideUp {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.ci-close {
  position: absolute; top: 14px; right: 16px;
  font-size: 18px; color: rgba(255,255,255,0.25);
  cursor: pointer; background: none; border: none;
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.ci-close:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }

.ci-badge {
  display: inline-block;
  background: rgba(212,175,55,0.12);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 20px; padding: 4px 14px;
  font-size: 11px; color: #d4af37;
  margin-bottom: 12px; letter-spacing: 1px;
}

.ci-title { font-size: 22px; font-weight: 800; color: white; margin-bottom: 4px; }
.ci-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 20px; }

/* DAYS */
.ci-days { display: flex; gap: 6px; justify-content: center; margin-bottom: 20px; }

.ci-day {
  width: 40px; height: 54px; border-radius: 12px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  font-size: 9px; color: rgba(255,255,255,0.25);
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.03); gap: 3px;
  transition: all 0.3s;
}
.ci-day-icon { font-size: 16px; }

.ci-day.done {
  background: rgba(212,175,55,0.12);
  border-color: rgba(212,175,55,0.35);
  color: #d4af37;
}
.ci-day.today {
  background: linear-gradient(135deg, #7c3aed, #d4af37);
  border: none; color: white;
  transform: scale(1.12);
  box-shadow: 0 4px 20px rgba(124,58,237,0.5);
}

/* SKELETON */
.ci-skel {
  width: 40px; height: 54px; border-radius: 12px;
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);
  background-size: 200% 100%;
  animation: ciSkel 1.2s infinite;
}
@keyframes ciSkel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* REWARD */
.ci-reward-wrap {
  background: rgba(212,175,55,0.06);
  border: 1px solid rgba(212,175,55,0.15);
  border-radius: 18px; padding: 18px; margin-bottom: 20px;
  transition: all 0.3s;
}
.ci-reward-icon { font-size: 44px; margin-bottom: 6px; }
.ci-reward-amt { font-size: 28px; font-weight: 800; color: #fbbf24; }
.ci-reward-label { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; }

/* BUTTON */
.ci-btn {
  width: 100%; padding: 15px; border-radius: 16px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #7c3aed, #d4af37);
  color: white; font-size: 16px; font-weight: 700; font-family: inherit;
  box-shadow: 0 4px 20px rgba(124,58,237,0.4);
  transition: all 0.2s;
}
.ci-btn:active { transform: scale(0.97); }
.ci-btn:disabled {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.25);
  cursor: not-allowed; box-shadow: none;
}

.ci-done-text {
  font-size: 12px; color: rgba(255,255,255,0.3);
  margin-top: 12px; min-height: 18px;
}

/* COIN POP */
@keyframes ciCoinPop {
  0%   { transform: translateX(-50%) scale(0) translateY(0); opacity: 1; }
  60%  { transform: translateX(-50%) scale(1.4) translateY(-60px); opacity: 1; }
  100% { transform: translateX(-50%) scale(1) translateY(-90px); opacity: 0; }
}
.ci-coin-pop {
  position: fixed; left: 50%; bottom: 30%;
  font-size: 26px; font-weight: 800; color: #fbbf24;
  pointer-events: none; z-index: 1100;
  animation: ciCoinPop 1.3s ease-out forwards;
  white-space: nowrap; text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
</style>`;

document.addEventListener('DOMContentLoaded', function() {
  var div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
});

// ─── RENDER DAYS ───
function renderDays(streak, alreadyDone) {
  var icons = ['🪙','🪙','🪙','🪙','🪙','🪙','👑'];
  var html = '';
  for (var i = 0; i < 7; i++) {
    var cls = 'ci-day';
    // วงถึงไหน: today = streak-1 เสมอ, done = ก่อนหน้า today
    var isToday = (i === streak - 1);
    var isDone  = (i < streak - 1);
    if (alreadyDone) {
      // เช็คอินแล้ว: วง done ถึง streak ทั้งหมด ไม่มี today highlight
      isToday = false;
      isDone  = (i < streak);
    }
    if (isDone)  cls += ' done';
    if (isToday) cls += ' today';
    html +=
      '<div class="' + cls + '">' +
      '<div class="ci-day-icon">' + icons[i] + '</div>' +
      '<div>' + (i + 1) + '</div>' +
      '</div>';
  }
  document.getElementById('ciDays').innerHTML = html;
}

// ─── RENDER UI ───
function renderUI(data) {
  var streak  = data.streak || 0;
  var already = data.already || false;
  var displayStreak = already ? streak : Math.min(streak + 1, 7);
  var reward  = displayStreak === 7 ? 50 : 10;

  renderDays(displayStreak, already);

  document.getElementById('ciRewardIcon').textContent  = displayStreak === 7 ? '👑' : '🪙';
  document.getElementById('ciRewardAmt').textContent   = '+' + reward + ' เหรียญ';
  document.getElementById('ciRewardLabel').textContent =
    'วันที่ ' + displayStreak + ' ติดต่อกัน' + (displayStreak === 7 ? ' — โบนัสพิเศษ! 🎉' : '');

  var btn      = document.getElementById('ciBtnDo');
  var doneText = document.getElementById('ciDoneText');

  if (already) {
    btn.disabled    = true;
    btn.textContent = '✅ เช็คอินแล้ววันนี้';
    doneText.textContent = 'กลับมาพรุ่งนี้เพื่อรับเหรียญต่อเนื่อง 🌟';
  } else {
    btn.disabled    = false;
    btn.textContent = '🎁 รับ ' + reward + ' เหรียญเลย';
    doneText.textContent = '';
  }
}

// ─── OPEN ───
window.openCheckin = async function() {
  if (!window.__ciCurrentUser) {
    var modal = document.getElementById('loginRequiredOverlay');
    if (modal) { modal.classList.add('show'); return; }
    if (typeof loginNow === 'function') { loginNow(); return; }
    alert('กรุณาเข้าสู่ระบบก่อนนะคะ 🙏');
    return;
  }

  // เปิด popup ทันที — skeleton แสดงระหว่างรอ
  document.getElementById('ciOverlay').classList.add('show');

  try {
    var idToken = await window.__ciCurrentUser.getIdToken();
    var res = await fetch(window.__ciApiBase + '/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
      body: JSON.stringify({ checkOnly: true })
    });
    var data = await res.json();
    renderUI(data);
  } catch(e) {
    renderUI({ streak: 1, already: false, coins: 0 });
  }
};

// ─── DO CHECKIN ───
window.doCheckin = async function() {
  if (!window.__ciCurrentUser) return;

  var btn = document.getElementById('ciBtnDo');
  btn.disabled    = true;
  btn.textContent = '⏳ กำลังรับเหรียญ...';

  try {
    var idToken = await window.__ciCurrentUser.getIdToken();
    var res = await fetch(window.__ciApiBase + '/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
      body: JSON.stringify({ checkOnly: false })
    });
    var data = await res.json();

    if (data.already) { renderUI(data); return; }

    // coin pop animation
    var pop = document.createElement('div');
    pop.className   = 'ci-coin-pop';
    pop.textContent = '+' + data.reward + ' 🪙';
    document.body.appendChild(pop);
    setTimeout(function() { pop.remove(); }, 1400);

    if (typeof updateCoinUI === 'function') updateCoinUI(data.coins);

    renderUI({ streak: data.streak, already: true, coins: data.coins });

  } catch(e) {
    console.error('checkin error:', e);
    btn.disabled    = false;
    btn.textContent = '🎁 รับเหรียญเลย';
  }
};

// ─── CLOSE ───
window.closeCheckin = function() {
  var el = document.getElementById('ciOverlay');
  if (el) el.classList.remove('show');
};

// ─── SETUP ───
// เรียกหลัง auth ready: setupCheckin(user, '../')
// จะเด้งอัตโนมัติถ้ายังไม่ได้เช็คอินวันนี้
window.setupCheckin = async function(user, apiBase) {
  window.__ciCurrentUser = user;
  window.__ciApiBase     = apiBase || '';

  // เช็คแบบ background — ถ้ายังไม่เช็คอิน เด้งหลัง 1.5 วิ
  try {
    var idToken = await user.getIdToken();
    var res = await fetch(window.__ciApiBase + '/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
      body: JSON.stringify({ checkOnly: true })
    });
    var data = await res.json();
    if (!data.already) {
      setTimeout(function() { window.openCheckin(); }, 1500);
    }
  } catch(e) { /* ไม่เด้งถ้า error */ }
};

})();
