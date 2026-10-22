// js/checkin.js
// Shared component — include ในทุกหน้า แล้วเรียก setupCheckin(user, apiBase)

(function() {

var _ciSrc = (document.currentScript && document.currentScript.src) || '';
var _ciImg = _ciSrc ? _ciSrc.replace(/js\/checkin\.js.*$/, 'images/') : '/images/';

// ─── FIREBASE AUTH (สำหรับ Google login ใน overlay) ───
var _auth = null;
var _GoogleAuthProvider = null;

async function _initAuth() {
  if (_auth) return;
  try {
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const cfg = {
      apiKey:'AIzaSyBMQEsuykNPvV7CsnB36zzmN-wribcd7YM',
      authDomain:'my-tarot67.firebaseapp.com',
      projectId:'my-tarot67',
      storageBucket:'my-tarot67.firebasestorage.app',
      messagingSenderId:'33661162829',
      appId:'1:33661162829:web:9e06a7cd5a00d613785304'
    };
    const app = getApps().length ? getApps()[0] : initializeApp(cfg);
    _auth = getAuth(app);
    _GoogleAuthProvider = GoogleAuthProvider;
    window.__ciSignInWithPopup = async () => {
      if (window.Capacitor?.isNativePlatform()) {
        const { nativeGoogleSignIn } = await import('/js/native-google-auth.js');
        return nativeGoogleSignIn(_auth, GoogleAuthProvider, signInWithCredential);
      }
      return signInWithPopup(_auth, new GoogleAuthProvider());
    };
  } catch(e) { console.error('auth init error', e); }
}

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
    <button class="ci-close" onclick="closeCheckin()" aria-label="ปิด">&times;</button>
    <div class="ci-ribbon"><span>เช็คอินประจำวัน</span></div>
    <div class="ci-streak"><img class="ci-flame" src="${_ciImg}reward/flame.webp" alt=""><span><b id="ciStreakNum">0</b> วันติดต่อกัน</span></div>
    <div class="ci-grid" id="ciDays">
      <div class="ci-skel"></div><div class="ci-skel"></div><div class="ci-skel"></div>
      <div class="ci-skel"></div><div class="ci-skel"></div><div class="ci-skel"></div>
      <div class="ci-skel wide"></div>
    </div>
    <button class="ci-btn" id="ciBtnDo" onclick="doCheckin()" disabled>กำลังโหลด...</button>
    <div class="ci-done-text" id="ciDoneText"></div>
  </div>
</div>

<style>
.login-required-overlay.show { display:flex !important; }
.ci-overlay { position:fixed; inset:0; z-index:1000; background:rgba(5,2,15,0.82); backdrop-filter:blur(5px); display:none; align-items:center; justify-content:center; }
.ci-overlay.show { display:flex; }
.ci-sheet { position:relative; width:92%; max-width:360px; padding:34px 16px 22px; border-radius:26px; text-align:center;
  background: radial-gradient(circle at 50% -10%, rgba(168,85,247,0.45), transparent 55%), radial-gradient(circle at 85% 110%, rgba(236,72,153,0.25), transparent 50%), linear-gradient(170deg,#2a1155 0%,#150a33 55%,#0d0820 100%);
  border:2px solid transparent; background-clip:padding-box; box-shadow:0 0 0 2px #d4a437, 0 0 0 5px rgba(212,164,55,0.18), 0 20px 60px rgba(0,0,0,0.65), 0 0 50px rgba(168,85,247,0.35);
  animation:ciSlideUp .35s cubic-bezier(.2,.9,.3,1.2); }
@keyframes ciSlideUp { from{transform:translateY(40px) scale(.94);opacity:0} to{transform:none;opacity:1} }
.ci-close { position:absolute; top:10px; right:12px; width:30px; height:30px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7); font-size:20px; line-height:26px; cursor:pointer; }
.ci-ribbon { position:absolute; top:-16px; left:50%; transform:translateX(-50%); padding:8px 26px; white-space:nowrap; font-size:15px; font-weight:800; color:#3a1a00; letter-spacing:.5px;
  background:linear-gradient(180deg,#fde68a,#f59e0b 60%,#d97706); border-radius:12px; box-shadow:0 4px 14px rgba(245,158,11,0.5), inset 0 1px 0 rgba(255,255,255,.7); }
.ci-streak { display:flex; align-items:center; justify-content:center; gap:8px; margin:2px 0 12px; font-size:13px; color:rgba(255,255,255,0.75); }
.ci-streak b { font-size:26px; color:#fbbf24; text-shadow:0 0 12px rgba(251,191,36,0.6); }
.ci-flame { width:52px; height:52px; object-fit:contain; animation:ciFlame 1.4s ease-in-out infinite; }
@keyframes ciFlame { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.15) rotate(3deg)} }
.ci-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px; }
.ci-card { position:relative; border-radius:16px; padding:8px 4px 8px; display:flex; flex-direction:column; align-items:center; gap:2px;
  background:linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)); border:1.5px solid rgba(255,255,255,0.12); overflow:hidden; }
.ci-card .ci-dl { font-size:10px; font-weight:700; color:rgba(255,255,255,0.55); letter-spacing:.5px; }
.ci-card img.ci-ic { width:46px; height:46px; object-fit:contain; filter:drop-shadow(0 4px 6px rgba(0,0,0,.45)); }
.ci-card .ci-amt { font-size:13px; font-weight:800; color:#fde68a; }
.ci-card.done { background:linear-gradient(180deg,rgba(212,164,55,0.22),rgba(212,164,55,0.06)); border-color:rgba(212,164,55,0.55); }
.ci-card.done img.ci-ic { opacity:.55; filter:grayscale(.3) drop-shadow(0 2px 4px rgba(0,0,0,.4)); }
.ci-card.done::after { content:'\\2713'; position:absolute; top:5px; right:5px; width:18px; height:18px; border-radius:50%; background:linear-gradient(135deg,#34d399,#059669); color:#fff; font-size:11px; font-weight:800; line-height:18px; box-shadow:0 2px 6px rgba(0,0,0,.4); }
.ci-card.today { border-color:#fbbf24; background:linear-gradient(180deg,rgba(251,191,36,0.35),rgba(168,85,247,0.2)); box-shadow:0 0 0 1px #fbbf24, 0 0 22px rgba(251,191,36,0.55); animation:ciPulse 1.6s ease-in-out infinite; }
.ci-card.today .ci-dl { color:#fff; }
.ci-card.today img.ci-ic { animation:ciBounce 1.2s ease-in-out infinite; }
.ci-card.today::before { content:'วันนี้'; position:absolute; top:0; left:0; padding:2px 8px; border-radius:0 0 10px 0; background:#fbbf24; color:#3a1a00; font-size:9px; font-weight:800; }
@keyframes ciPulse { 0%,100%{box-shadow:0 0 0 1px #fbbf24, 0 0 14px rgba(251,191,36,0.4)} 50%{box-shadow:0 0 0 1px #fbbf24, 0 0 28px rgba(251,191,36,0.8)} }
@keyframes ciBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
.ci-card.wide { grid-column:1 / -1; flex-direction:row; justify-content:center; gap:14px; padding:10px 14px; background:linear-gradient(135deg,rgba(124,58,237,0.35),rgba(212,164,55,0.25)); border-color:rgba(251,191,36,0.6); }
.ci-card.wide img.ci-ic { width:64px; height:64px; }
.ci-card.wide .ci-txt { text-align:left; }
.ci-card.wide .ci-dl { font-size:11px; color:#fde68a; }
.ci-card.wide .ci-amt { font-size:22px; }
.ci-card.wide .ci-sub2 { font-size:10px; color:rgba(255,255,255,0.55); }
.ci-card.wide.today { background:linear-gradient(135deg,rgba(124,58,237,0.5),rgba(251,191,36,0.4)); }
.ci-skel { height:96px; border-radius:16px; background:linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.1),rgba(255,255,255,0.04)); background-size:200% 100%; animation:ciSkel 1.4s infinite; }
.ci-skel.wide { grid-column:1 / -1; height:84px; }
@keyframes ciSkel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.ci-btn { position:relative; overflow:hidden; width:100%; padding:15px; border-radius:16px; border:none; cursor:pointer; font-family:inherit; font-size:17px; font-weight:800; color:#3a1a00; letter-spacing:.5px;
  background:linear-gradient(180deg,#fde68a 0%,#f59e0b 55%,#d97706 100%); box-shadow:0 5px 0 #92400e, 0 10px 24px rgba(245,158,11,0.45); transition:transform .1s, box-shadow .1s; }
.ci-btn:not(:disabled) { animation:ciBtnGlow 1.8s ease-in-out infinite; }
.ci-btn:not(:disabled)::after { content:''; position:absolute; top:0; bottom:0; width:40%; left:-60%; background:linear-gradient(100deg,transparent,rgba(255,255,255,0.65),transparent); transform:skewX(-20deg); animation:ciShine 2.4s ease-in-out infinite; }
@keyframes ciShine { 0%,55%{left:-60%} 100%{left:140%} }
@keyframes ciBtnGlow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.12)} }
.ci-btn:active:not(:disabled) { transform:translateY(4px); box-shadow:0 1px 0 #92400e, 0 4px 12px rgba(245,158,11,0.4); }
.ci-btn:disabled { background:linear-gradient(180deg,#4b4566,#332e4d); color:rgba(255,255,255,0.45); box-shadow:0 4px 0 #1f1b33; cursor:not-allowed; }
.ci-done-text { font-size:12px; color:rgba(255,255,255,0.45); margin-top:12px; min-height:18px; }
.ci-fly { position:fixed; width:30px; height:30px; z-index:1100; pointer-events:none; object-fit:contain; }
.ci-coin-pop { position:fixed; left:50%; bottom:34%; transform:translateX(-50%); font-size:30px; font-weight:900; color:#fde68a; pointer-events:none; z-index:1101; animation:ciCoinPop 1.4s ease-out forwards; white-space:nowrap; text-shadow:0 0 18px rgba(251,191,36,.9), 0 2px 4px rgba(0,0,0,.6); }
@keyframes ciCoinPop { 0%{transform:translateX(-50%) scale(0);opacity:1} 50%{transform:translateX(-50%) translateY(-60px) scale(1.3);opacity:1} 100%{transform:translateX(-50%) translateY(-90px) scale(1);opacity:0} }
img.coin-ic { width:1.15em; height:1.15em; vertical-align:-0.22em; display:inline-block; object-fit:contain; }
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

    // เพิ่มปุ่ม Email ใน guestView ถ้ายังไม่มี และผูก Google btn
    var guestView = document.getElementById('guestView');
    if (guestView) {
      // ผูกปุ่ม Google ใน guestView ให้ใช้ Firebase
      setTimeout(function() {
        guestView.querySelectorAll('button').forEach(function(btn) {
          if (btn.textContent.includes('Google')) {
            btn.onclick = async function() {
              await _initAuth();
              if (window.__ciSignInWithPopup) {
                try { await window.__ciSignInWithPopup(); } catch(e) { console.error(e); }
              } else if (typeof window.__ciGoogleSignIn === 'function') {
                window.__ciGoogleSignIn();
              }
            };
          }
        });
      }, 100);

      if (!guestView.querySelector('[data-email-btn]')) {
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
    }
  }, 0);

  // ถ้าหน้านั้นมี loginRequiredOverlay อยู่แล้ว → เพิ่มปุ่ม Email และผูก Google btn
  var existingOverlay = document.getElementById('loginRequiredOverlay');
  if (existingOverlay) {
    if (!existingOverlay.querySelector('[data-email-btn]')) {
      var loginPath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      var sheet = existingOverlay.querySelector('.login-required-sheet') ||
                  existingOverlay.querySelector('[class*="sheet"]') ||
                  existingOverlay.querySelector('div div');
      if (sheet) {
        var emailBtn = document.createElement('button');
        emailBtn.setAttribute('data-email-btn', '1');
        emailBtn.style.cssText = 'width:100%;margin-top:10px;padding:13px;border-radius:14px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);color:white;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;display:block;';
        emailBtn.textContent = '📧 เข้าสู่ระบบด้วย Email';
        emailBtn.addEventListener('click', function() {
          window.location.href = loginPath + '?return=' + encodeURIComponent(window.location.href);
        });
        var cancelBtn = sheet.querySelector('.btn-cancel-login') || sheet.querySelector('button:last-child');
        if (cancelBtn) sheet.insertBefore(emailBtn, cancelBtn);
        else sheet.appendChild(emailBtn);
      }
    }

    // ผูกปุ่ม Google ทุกปุ่มใน overlay ให้ใช้ Firebase Auth จาก checkin.js
    setTimeout(function() {
      existingOverlay.querySelectorAll('button').forEach(function(btn) {
        if (btn.textContent.includes('Google')) {
          btn.onclick = async function() {
            await _initAuth();
            if (window.__ciSignInWithPopup) {
              try { await window.__ciSignInWithPopup(); } catch(e) { console.error(e); }
            } else if (typeof window.__ciGoogleSignIn === 'function') {
              window.__ciGoogleSignIn();
            }
          };
        }
      });
    }, 100);

  } else {
    // ไม่มี loginRequiredOverlay เลย → inject ใหม่ทั้งหมด
    var loginDiv = document.createElement('div');
    var loginPath2 = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
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

    document.getElementById('ciGoogleBtn').addEventListener('click', async function() {
      await _initAuth();
      if (window.__ciSignInWithPopup) {
        try { await window.__ciSignInWithPopup(); } catch(e) { console.error(e); }
      } else if (typeof window.__ciGoogleSignIn === 'function') {
        window.__ciGoogleSignIn();
      }
    });

    document.getElementById('ciEmailBtn').addEventListener('click', function() {
      window.location.href = loginPath2 + '?return=' + encodeURIComponent(window.location.href);
    });
  }
});

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

// ─── DEFAULT loginNow ───
if (typeof window.loginNow === 'undefined') {
  window.loginNow = function() {
    var modal = document.getElementById('loginRequiredOverlay');
    if (modal) modal.classList.add('show');
  };
}

// ─── RENDER DAYS ───
var CI_ICONS = ['coin','coin','stack','stack','pile','sack','chest'];
function renderDays(streak, alreadyDone) {
  var html = '';
  for (var i = 0; i < 7; i++) {
    var cls = 'ci-card' + (i === 6 ? ' wide' : '');
    var isToday = (i === streak - 1);
    var isDone  = (i < streak - 1);
    if (alreadyDone) { isToday = false; isDone = (i < streak); }
    if (isDone)  cls += ' done';
    if (isToday) cls += ' today';
    var img = '<img class="ci-ic" src="' + _ciImg + 'reward/' + CI_ICONS[i] + '.webp" alt="">';
    if (i === 6) {
      html += '<div class="' + cls + '">' + img + '<div class="ci-txt"><div class="ci-dl">วันที่ 7 โบนัสพิเศษ</div><div class="ci-amt">+50 เหรียญ</div><div class="ci-sub2">เช็คอินครบ 7 วันติด</div></div></div>';
    } else {
      html += '<div class="' + cls + '"><div class="ci-dl">วันที่ ' + (i + 1) + '</div>' + img + '<div class="ci-amt">+10</div></div>';
    }
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
  var sn = document.getElementById('ciStreakNum');
  if (sn) sn.textContent = already ? streak : streak;

  var btn      = document.getElementById('ciBtnDo');
  var doneText = document.getElementById('ciDoneText');

  if (already) {
    btn.disabled    = true;
    btn.textContent = 'เช็คอินแล้ววันนี้';
    doneText.textContent = 'กลับมาพรุ่งนี้เพื่อรับรางวัลต่อเนื่องนะคะ';
  } else {
    btn.disabled    = false;
    btn.textContent = 'รับ ' + reward + ' เหรียญ';
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
  btn.textContent = 'กำลังรับเหรียญ...';

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
    pop.innerHTML   = '+' + data.reward + ' <img class="coin-ic" src="' + _ciImg + 'coin.webp" alt="">';
    document.body.appendChild(pop);
    setTimeout(function() { pop.remove(); }, 1500);
    var br = btn.getBoundingClientRect();
    for (var n = 0; n < 16; n++) {
      (function(n) {
        var c = document.createElement('img');
        c.className = 'ci-fly'; c.src = _ciImg + 'coin.webp';
        c.style.left = (br.left + br.width / 2 - 15) + 'px'; c.style.top = (br.top - 10) + 'px';
        document.body.appendChild(c);
        var dx = (Math.random() - 0.5) * 220, dy = -(120 + Math.random() * 180);
        c.animate([{ transform: 'translate(0,0) scale(.4)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1.1) rotate(' + (Math.random() * 360) + 'deg)', opacity: 1, offset: .6 }, { transform: 'translate(' + (dx * 1.1) + 'px,' + (dy - 40) + 'px) scale(.8)', opacity: 0 }], { duration: 1100 + Math.random() * 400, delay: n * 40, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
        setTimeout(function() { c.remove(); }, 2200);
      })(n);
    }

    if (typeof updateCoinUI === 'function') updateCoinUI(data.coins);
    renderUI({ streak: data.streak, already: true, coins: data.coins });

  } catch(e) {
    console.error('checkin error:', e);
    btn.disabled    = false;
    btn.textContent = 'รับเหรียญเลย';
  }
};

// ─── CLOSE ───
window.closeCheckin = function() {
  var el = document.getElementById('ciOverlay');
  if (el) el.classList.remove('show');
};

// ─── AUTO CLOSE OVERLAY AFTER LOGIN ───
function closeLoginOverlay() {
  var el = document.getElementById('loginRequiredOverlay');
  if (el) el.classList.remove('show');
}
window.__ciCloseLoginOverlay = closeLoginOverlay;

// ─── SETUP ───
window.setupCheckin = async function(user, apiBase, googleSignIn) {
  // 🔒 กันคนที่สมัครด้วยอีเมล/รหัสผ่านแต่ยังไม่กดยืนยันอีเมล ไม่ให้ใช้งานหน้าไหนในเว็บได้เลย
  // (Google login จะมี emailVerified=true ให้อัตโนมัติอยู่แล้ว ไม่โดนเงื่อนไขนี้)
  if (user && user.emailVerified === false) {
    var loginPath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
    window.location.href = loginPath + '?return=' + encodeURIComponent(window.location.href);
    return;
  }

  window.__ciCurrentUser = user;
  window.__ciApiBase     = apiBase || '';
  if (googleSignIn) window.__ciGoogleSignIn = googleSignIn;

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


// ─── COIN EMOJI → IMAGE (ทุกหน้าใช้เหรียญหน้าตาเดียวกัน) ───
(function() {
  var COIN = '\uD83E\uDE99';
  var skip = { SCRIPT:1, STYLE:1, TEXTAREA:1, INPUT:1, TITLE:1, OPTION:1 };
  function swap(node) {
    if (node.nodeType === 3) {
      if (node.nodeValue.indexOf(COIN) === -1) return;
      var p = node.parentNode;
      if (!p || skip[p.nodeName]) return;
      var parts = node.nodeValue.split(COIN), frag = document.createDocumentFragment();
      parts.forEach(function(t, i) {
        if (i > 0) { var im = document.createElement('img'); im.className = 'coin-ic'; im.alt = ''; im.src = _ciImg + 'coin.webp'; frag.appendChild(im); }
        if (t) frag.appendChild(document.createTextNode(t));
      });
      p.replaceChild(frag, node);
    } else if (node.nodeType === 1 && !skip[node.nodeName]) {
      for (var c = node.firstChild; c; ) { var nx = c.nextSibling; swap(c); c = nx; }
    }
  }
  function start() {
    swap(document.body);
    new MutationObserver(function(ms) {
      ms.forEach(function(m) {
        if (m.type === 'characterData') swap(m.target);
        else m.addedNodes.forEach(swap);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
})();