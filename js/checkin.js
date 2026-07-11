// js/checkin.js
// Shared component — include ในทุกหน้า แล้วเรียก setupCheckin(user, apiBase)

(function() {

// ─── IN-APP BROWSER DETECTION ───
(function() {
  var ua = navigator.userAgent || '';
  var isLine     = /Line\//i.test(ua);
  var isTikTok   = /TikTok|Musical/i.test(ua);
  var isFacebook = /FBAN|FBAV|FB_IAB/i.test(ua);
  var isIG       = /Instagram/i.test(ua);
  var isInApp    = isLine || isTikTok || isFacebook || isIG;

  if (!isInApp) return;

  var url = window.location.href;

  if (/Android/i.test(ua)) {
    window.location.href = 'intent://' + url.replace(/https?:\/\//, '') +
      '#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;end';
    return;
  }

  document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;padding:24px;';
    overlay.innerHTML =
      '<div style="background:linear-gradient(160deg,#1e0a3c,#0d0820);border:1px solid rgba(212,175,55,0.3);border-radius:24px;padding:28px 20px;width:100%;max-width:320px;text-align:center;">' +
        '<div style="font-size:48px;margin-bottom:12px;">🌐</div>' +
        '<div style="font-size:18px;font-weight:800;color:white;margin-bottom:8px;">กรุณาเปิดใน Browser ค่ะ</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:20px;line-height:1.6;">เพื่อเข้าสู่ระบบด้วย Google<br>กรุณาเปิดลิงค์ใน Safari หรือ Chrome ค่ะ</div>' +
        '<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px 14px;font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px;word-break:break-all;">' + url + '</div>' +
        '<button id="inAppCopyBtn" style="width:100%;padding:14px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#d4af37);border:none;color:white;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;">📋 คัดลอกลิงค์</button>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.25);margin-top:12px;">แล้วเปิด Safari หรือ Chrome วางลิงค์ค่ะ</div>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('inAppCopyBtn').addEventListener('click', function() {
      navigator.clipboard.writeText(url).then(function() {
        document.getElementById('inAppCopyBtn').textContent = '✅ คัดลอกแล้วค่ะ!';
      }).catch(function() {
        var ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        document.getElementById('inAppCopyBtn').textContent = '✅ คัดลอกแล้วค่ะ!';
      });
    });
  });
})();

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
.login-required-overlay.show { display:flex !important; }
.ci-overlay { position:fixed; inset:0; z-index:1000; background:rgba(0,0,0,0.8); backdrop-filter:blur(4px); display:none; align-items:center; justify-content:center; }
.ci-overlay.show { display:flex; }
.ci-sheet { background:linear-gradient(160deg,#1e0a3c 0%,#0d0820 100%); border:1px solid rgba(212,175,55,0.3); border-radius:28px; padding:28px 20px 32px; width:90%; max-width:340px; text-align:center; position:relative; box-shadow:0 0 60px rgba(124,58,237,0.25),inset 0 1px 0 rgba(212,175,55,0.1); animation:ciSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes ciSlideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
.ci-close { position:absolute; top:14px; right:16px; font-size:18px; color:rgba(255,255,255,0.25); cursor:pointer; background:none; border:none; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
.ci-close:hover { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6); }
.ci-badge { display:inline-block; background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.25); border-radius:20px; padding:4px 14px; font-size:11px; color:#d4af37; margin-bottom:12px; letter-spacing:1px; }
.ci-title { font-size:22px; font-weight:800; color:white; margin-bottom:4px; }
.ci-sub { font-size:12px; color:rgba(255,255,255,0.35); margin-bottom:20px; }
.ci-days { display:flex; gap:6px; justify-content:center; margin-bottom:20px; }
.ci-day { width:40px; height:54px; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:9px; color:rgba(255,255,255,0.25); border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.03); gap:3px; transition:all 0.3s; }
.ci-day-icon { font-size:16px; }
.ci-day.done { background:rgba(212,175,55,0.12); border-color:rgba(212,175,55,0.35); color:#d4af37; }
.ci-day.today { background:linear-gradient(135deg,#7c3aed,#d4af37); border:none; color:white; transform:scale(1.12); box-shadow:0 4px 20px rgba(124,58,237,0.5); }
.ci-skel { width:40px; height:54px; border-radius:12px; background:linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 100%); background-size:200% 100%; animation:ciSkel 1.2s infinite; }
@keyframes ciSkel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.ci-reward-wrap { background:rgba(212,175,55,0.06); border:1px solid rgba(212,175,55,0.15); border-radius:18px; padding:18px; margin-bottom:20px; transition:all 0.3s; }
.ci-reward-icon { font-size:44px; margin-bottom:6px; }
.ci-reward-amt { font-size:28px; font-weight:800; color:#fbbf24; }
.ci-reward-label { font-size:12px; color:rgba(255,255,255,0.35); margin-top:4px; }
.ci-btn { width:100%; padding:15px; border-radius:16px; border:none; cursor:pointer; background:linear-gradient(135deg,#7c3aed,#d4af37); color:white; font-size:16px; font-weight:700; font-family:inherit; box-shadow:0 4px 20px rgba(124,58,237,0.4); transition:all 0.2s; }
.ci-btn:active { transform:scale(0.97); }
.ci-btn:disabled { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.25); cursor:not-allowed; box-shadow:none; }
.ci-done-text { font-size:12px; color:rgba(255,255,255,0.3); margin-top:12px; min-height:18px; }
@keyframes ciCoinPop { 0%{transform:translateX(-50%) scale(0) translateY(0);opacity:1} 60%{transform:translateX(-50%) scale(1.4) translateY(-60px);opacity:1} 100%{transform:translateX(-50%) scale(1) translateY(-90px);opacity:0} }
.ci-coin-pop { position:fixed; left:50%; bottom:30%; font-size:26px; font-weight:800; color:#fbbf24; pointer-events:none; z-index:1100; animation:ciCoinPop 1.3s ease-out forwards; white-space:nowrap; text-shadow:0 2px 8px rgba(0,0,0,0.5); }
</style>`;

document.addEventListener('DOMContentLoaded', function() {
  var div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);

  // override loginNow ทุกหน้าให้เปิด overlay แทน signInWithPopup เสมอ
  setTimeout(function() {
    window.loginNow = function() {
      var modal = document.getElementById('loginRequiredOverlay');
      if (modal) modal.classList.add('show');
    };

    // เพิ่มปุ่ม Email ใน guestView (user menu มุมขวา) ถ้ายังไม่มี
    var guestView = document.getElementById('guestView');
    if (guestView && !guestView.querySelector('[data-email-btn]')) {
      var loginPath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      var emailBtn = document.createElement('button');
      emailBtn.setAttribute('data-email-btn', '1');
      emailBtn.style.cssText = 'width:100%;margin-top:10px;padding:12px;border-radius:14px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);color:white;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;';
      emailBtn.textContent = '📧 เข้าสู่ระบบด้วย Email';
      emailBtn.addEventListener('click', function() {
        window.location.href = loginPath + '?return=' + encodeURIComponent(window.location.href);
      });
      guestView.appendChild(emailBtn);
    }
  }, 0);

  // ถ้าหน้านั้นมี loginRequiredOverlay อยู่แล้ว → เช็คว่ามีปุ่ม Email หรือยัง
  var existingOverlay = document.getElementById('loginRequiredOverlay');
  if (existingOverlay) {
    // ถ้าไม่มีปุ่ม Email → inject เพิ่มเข้าไป
    if (!existingOverlay.querySelector('[data-email-btn]')) {
      var loginPath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      var sheet = existingOverlay.querySelector('.login-required-sheet') || existingOverlay.querySelector('div > div');
      if (sheet) {
        var emailBtn = document.createElement('button');
        emailBtn.setAttribute('data-email-btn', '1');
        emailBtn.style.cssText = 'width:100%;margin-top:10px;padding:13px;border-radius:14px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);color:white;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;';
        emailBtn.textContent = '📧 เข้าสู่ระบบด้วย Email';
        emailBtn.addEventListener('click', function() {
          window.location.href = loginPath + '?return=' + encodeURIComponent(window.location.href);
        });
        // แทรกก่อนปุ่มยกเลิก
        var cancelBtn = sheet.querySelector('.btn-cancel-login');
        if (cancelBtn) {
          sheet.insertBefore(emailBtn, cancelBtn);
        } else {
          sheet.appendChild(emailBtn);
        }
      }
    }
  } else {
    // ไม่มี loginRequiredOverlay เลย → inject ใหม่ทั้งหมด
    var loginDiv = document.createElement('div');
    var base = window.__ciApiBase || '';
    // หา path ที่ถูกต้องสำหรับ login.html
    var loginPath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
    loginDiv.innerHTML =
      '<div class="login-required-overlay" id="loginRequiredOverlay" onclick="if(event.target===this)this.classList.remove(\'show\')" style="position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.75);display:none;align-items:center;justify-content:center;">' +
        '<div style="background:linear-gradient(160deg,#1e0a3c,#0d0820);border:1px solid rgba(212,175,55,0.25);border-radius:24px;padding:32px 20px;width:90%;max-width:320px;text-align:center;">' +
          '<div style="font-size:44px;margin-bottom:12px;">🔮</div>' +
          '<div style="font-size:18px;font-weight:800;color:white;margin-bottom:6px;">รบกวนเข้าสู่ระบบก่อนนะคะ 🙏</div>' +
          '<div style="font-size:13px;color:rgba(255,255,255,0.35);margin-bottom:20px;line-height:1.6;">เข้าสู่ระบบเพื่อบันทึกประวัติดูดวง<br>และเหรียญของคุณอย่างปลอดภัยค่ะ</div>' +
          '<button id="ciGoogleBtn" style="width:100%;padding:14px;border-radius:14px;background:white;border:none;color:#333;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;">' +
            '<img src="https://www.google.com/favicon.ico" width="18"> เข้าสู่ระบบด้วย Google' +
          '</button>' +
          '<button id="ciEmailBtn" style="width:100%;padding:14px;border-radius:14px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);color:white;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;margin-bottom:10px;">' +
            '📧 เข้าสู่ระบบด้วย Email' +
          '</button>' +
          '<button onclick="document.getElementById(\'loginRequiredOverlay\').classList.remove(\'show\')" style="width:100%;padding:10px;border-radius:12px;background:none;border:none;color:rgba(255,255,255,0.3);font-size:13px;font-family:inherit;cursor:pointer;">ยกเลิก</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(loginDiv);

    // Google btn
    document.getElementById('ciGoogleBtn').addEventListener('click', function() {
      document.getElementById('loginRequiredOverlay').classList.remove('show');
      if (typeof window.__ciGoogleSignIn === 'function') window.__ciGoogleSignIn();
    });

    // Email btn
    document.getElementById('ciEmailBtn').addEventListener('click', function() {
      window.location.href = loginPath + '?return=' + encodeURIComponent(window.location.href);
    });
  }
});

// ─── AUTO CLOSE OVERLAY AFTER LOGIN ───
// เรียกจาก onAuthStateChanged ในแต่ละหน้า ผ่าน setupCheckin
function closeLoginOverlay() {
  var el = document.getElementById('loginRequiredOverlay');
  if (el) el.classList.remove('show');
}
window.__ciCloseLoginOverlay = closeLoginOverlay;

// ─── USER MENU ───
window.toggleUserMenu = function() {
  var menu = document.getElementById('userMenu');
  var overlay = document.getElementById('overlay');
  if (menu) menu.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
};
window.closeUserMenu = function() {
  var menu = document.getElementById('userMenu');
  var overlay = document.getElementById('overlay');
  if (menu) menu.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
};

// ─── DEFAULT loginNow — เปิด overlay แทน popup ───
// หน้าที่มี loginNow ของตัวเองจะ override ทับได้ค่ะ
if (typeof window.loginNow === 'undefined') {
  window.loginNow = function() {
    var modal = document.getElementById('loginRequiredOverlay');
    if (modal) modal.classList.add('show');
  };
}

// ─── RENDER DAYS ───
function renderDays(streak, alreadyDone) {
  var icons = ['🪙','🪙','🪙','🪙','🪙','🪙','👑'];
  var html = '';
  for (var i = 0; i < 7; i++) {
    var cls = 'ci-day';
    var isToday = (i === streak - 1);
    var isDone  = (i < streak - 1);
    if (alreadyDone) { isToday = false; isDone = (i < streak); }
    if (isDone)  cls += ' done';
    if (isToday) cls += ' today';
    html += '<div class="' + cls + '"><div class="ci-day-icon">' + icons[i] + '</div><div>' + (i + 1) + '</div></div>';
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
window.setupCheckin = async function(user, apiBase, googleSignIn) {
  window.__ciCurrentUser = user;
  window.__ciApiBase     = apiBase || '';
  if (googleSignIn) window.__ciGoogleSignIn = googleSignIn;

  // ปิด loginRequiredOverlay อัตโนมัติเมื่อ login สำเร็จ
  closeLoginOverlay();

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