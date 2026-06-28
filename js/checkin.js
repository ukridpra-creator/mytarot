// js/checkin.js
// Shared component — include ในทุกหน้า แล้วเรียก openCheckin()

(function() {

// ─── INJECT HTML ───
var html = `
<div class="ci-overlay" id="ciOverlay" onclick="if(event.target===this)closeCheckin()">
  <div class="ci-sheet">
    <button class="ci-close" onclick="closeCheckin()">✕</button>
    <div class="ci-title">🎯 เช็คอินประจำวัน</div>
    <div class="ci-sub">เช็คอินทุกวันรับเหรียญฟรีค่ะ!</div>

    <div class="ci-days" id="ciDays"></div>

    <div class="ci-reward-icon" id="ciRewardIcon">🪙</div>
    <div class="ci-reward-text" id="ciRewardText">รับ 10 เหรียญ</div>
    <div class="ci-reward-sub" id="ciRewardSub">วันที่ 1 ติดต่อกัน</div>

    <button class="ci-btn" id="ciBtnDo" onclick="doCheckin()">🎁 รับเหรียญ</button>
    <div class="ci-done-text" id="ciDoneText"></div>
  </div>
</div>

<style>
.ci-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.75);
  display: none; align-items: center; justify-content: center;
}
.ci-overlay.show { display: flex; }

.ci-sheet {
  background: linear-gradient(180deg, #1a0e2e, #0d0820);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 24px; padding: 24px 20px 28px;
  width: 90%; max-width: 340px;
  text-align: center; position: relative;
}

.ci-close {
  position: absolute; top: 14px; right: 16px;
  font-size: 20px; color: rgba(255,255,255,0.3);
  cursor: pointer; background: none; border: none;
}

.ci-title {
  font-size: 20px; font-weight: 800; color: #d4af37; margin-bottom: 4px;
}
.ci-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 20px; }

.ci-days { display: flex; gap: 6px; justify-content: center; margin-bottom: 20px; }

.ci-day {
  width: 40px; height: 52px; border-radius: 10px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  font-size: 9px; color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03); gap: 3px;
}
.ci-day-icon { font-size: 18px; }
.ci-day.done {
  background: rgba(212,175,55,0.2);
  border-color: #d4af37; color: #d4af37;
}
.ci-day.today {
  background: linear-gradient(135deg, rgba(124,58,237,0.4), rgba(212,175,55,0.3));
  border-color: #a78bfa; color: white;
  transform: scale(1.1);
}

.ci-reward-icon { font-size: 40px; margin-bottom: 6px; }
.ci-reward-text { font-size: 18px; font-weight: 700; color: white; margin-bottom: 4px; }
.ci-reward-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 20px; }

.ci-btn {
  width: 100%; padding: 14px; border-radius: 16px;
  background: linear-gradient(135deg, #7c3aed, #d4af37);
  border: none; color: white;
  font-size: 16px; font-weight: 700;
  font-family: inherit; cursor: pointer;
  transition: all 0.2s;
}
.ci-btn:active { transform: scale(0.97); }
.ci-btn:disabled {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.3); cursor: not-allowed;
}
.ci-done-text { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 12px; min-height: 18px; }

@keyframes ciCoinPop {
  0%   { transform: translateX(-50%) scale(0) translateY(0); opacity: 1; }
  60%  { transform: translateX(-50%) scale(1.3) translateY(-60px); opacity: 1; }
  100% { transform: translateX(-50%) scale(1) translateY(-80px); opacity: 0; }
}
.ci-coin-pop {
  position: fixed; left: 50%; bottom: 30%;
  font-size: 28px; font-weight: 700; color: #fbbf24;
  pointer-events: none; z-index: 1100;
  animation: ciCoinPop 1.2s ease-out forwards;
  white-space: nowrap;
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
    var isDone = alreadyDone ? i < streak : i < streak - 1;
    var isToday = alreadyDone ? false : i === streak - 1;
    if (isDone) cls += ' done';
    if (isToday) cls += ' today';
    html +=
      '<div class="' + cls + '">' +
      '<div class="ci-day-icon">' + icons[i] + '</div>' +
      '<div>' + (i + 1) + '</div>' +
      '</div>';
  }
  document.getElementById('ciDays').innerHTML = html;
}

// ─── OPEN ───
window.openCheckin = async function() {
  // เช็ค login
  if (!window.__ciCurrentUser) {
    // ใช้ login modal ของหน้านั้นๆ ถ้ามี
    var existingModal = document.getElementById('loginRequiredOverlay');
    if (existingModal) {
      existingModal.classList.add('show');
    } else if (typeof loginNow === 'function') {
      loginNow();
    } else {
      alert('กรุณาเข้าสู่ระบบก่อนนะคะ 🙏');
    }
    return;
  }

  // ดึง streak จาก server ก่อน
  try {
    var idToken = await window.__ciCurrentUser.getIdToken();
    // เช็คสถานะก่อน (GET-like via POST with check=true)
    var res = await fetch(window.__ciApiBase + '/api/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + idToken
      },
      body: JSON.stringify({ checkOnly: true })
    });
    var data = await res.json();
    renderUI(data);
  } catch(e) {
    renderUI({ streak: 0, already: false, coins: 0 });
  }

  document.getElementById('ciOverlay').classList.add('show');
};

function renderUI(data) {
  var streak = data.streak || 0;
  var already = data.already || false;
  var nextStreak = already ? streak : Math.min(streak + 1, 7);
  var reward = nextStreak === 7 ? 50 : 10;

  renderDays(already ? streak : nextStreak, already);

  document.getElementById('ciRewardIcon').textContent = nextStreak === 7 ? '👑' : '🪙';
  document.getElementById('ciRewardText').textContent = 'รับ ' + reward + ' เหรียญ';
  document.getElementById('ciRewardSub').textContent =
    'วันที่ ' + nextStreak + ' ติดต่อกัน' + (nextStreak === 7 ? ' — โบนัสพิเศษ! 🎉' : '');

  var btn = document.getElementById('ciBtnDo');
  var doneText = document.getElementById('ciDoneText');

  if (already) {
    btn.disabled = true;
    btn.textContent = '✅ เช็คอินแล้ววันนี้';
    doneText.textContent = 'กลับมาพรุ่งนี้เพื่อรับเหรียญต่อเนื่อง 🌟';
  } else {
    btn.disabled = false;
    btn.textContent = '🎁 รับ ' + reward + ' เหรียญ';
    doneText.textContent = '';
  }
}

// ─── DO CHECKIN ───
window.doCheckin = async function() {
  if (!window.__ciCurrentUser) return;

  var btn = document.getElementById('ciBtnDo');
  btn.disabled = true;
  btn.textContent = '⏳ กำลังเช็คอิน...';

  try {
    var idToken = await window.__ciCurrentUser.getIdToken();
    var res = await fetch(window.__ciApiBase + '/api/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + idToken
      },
      body: JSON.stringify({ checkOnly: false })
    });

    var data = await res.json();

    if (data.already) {
      renderUI(data);
      return;
    }

    // สำเร็จ!
    var pop = document.createElement('div');
    pop.className = 'ci-coin-pop';
    pop.textContent = '+' + data.reward + ' 🪙';
    document.body.appendChild(pop);
    setTimeout(function() { pop.remove(); }, 1300);

    // update coin UI
    if (typeof updateCoinUI === 'function') {
      updateCoinUI(data.coins);
    }

    renderUI({ streak: data.streak, already: true, coins: data.coins });

  } catch(e) {
    console.error('checkin error:', e);
    btn.disabled = false;
    btn.textContent = '🎁 รับเหรียญ';
  }
};

// ─── CLOSE ───
window.closeCheckin = function() {
  var el = document.getElementById('ciOverlay');
  if (el) el.classList.remove('show');
};

// ─── SETUP (เรียกจากทุกหน้าหลัง auth ready) ───
// ทุกหน้าต้องเรียก: setupCheckin(currentUser, apiBase)
// apiBase = '' สำหรับ root, '../' สำหรับ pages/
window.setupCheckin = function(user, apiBase) {
  window.__ciCurrentUser = user;
  window.__ciApiBase = apiBase || '';
};

})();