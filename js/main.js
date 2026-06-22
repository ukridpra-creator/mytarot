// Navigation
function go(page) {
  const pages = {
    tarot: 'pages/tarot.html',
    numerology: 'pages/numerology.html',
    face: 'pages/face.html',
    palm: 'pages/palm.html',
    iching: 'pages/iching.html',
    rune: 'pages/rune.html',
    saju: 'pages/saju.html',
    thai: 'pages/thai.html',
    western: 'pages/western.html',
    chinese: 'pages/chinese.html',
    vedic: 'pages/vedic.html',
    oracle: 'pages/oracle.html',
    deity: 'pages/deity.html',
    premium: 'pages/premium.html',
  };
  if(pages[page]) window.location.href = pages[page];
}

// Bottom nav
document.querySelectorAll('.nav-item').forEach((item, i) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
  });
});

// Coins (เก็บใน localStorage)
function getCoins() {
  return parseInt(localStorage.getItem('coins') || '500');
}
function setCoins(n) {
  localStorage.setItem('coins', n);
  const badge = document.querySelector('.coin-badge');
  if (badge) badge.textContent = `🪙 ${n} เหรียญ`;
}
function useCoins(amount) {
  const current = getCoins();
  if(current < amount) {
    alert('เหรียญไม่พอค่ะ! กดซื้อเหรียญเพิ่มได้เลย 🪙');
    return false;
  }
  setCoins(current - amount);
  return true;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  setCoins(getCoins());
  
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  
  if (userId) {
    currentUser = {
      name: userName,
      email: userEmail,
      isPremium: false
    };
    updateUserUI();
  }
});
// User Menu
function toggleUserMenu() {
  document.getElementById('userMenu').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}
function closeUserMenu() {
  document.getElementById('userMenu').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

// Mock login (จะเปลี่ยนเป็น Firebase ทีหลัง)
let currentUser = null;

// แก้ loginGoogle ให้ไปหน้า profile แทน
function loginGoogle() {
  window.location.href = 'pages/profile.html';
}

function logout() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  currentUser = null;
  updateUserUI();
  closeUserMenu();
}

function updateUserUI() {
  const guestView = document.getElementById('guestView');
  const loggedView = document.getElementById('loggedView');
  const menuBadge = document.getElementById('menuBadge');

  if(currentUser) {
    guestView.style.display = 'none';
    loggedView.style.display = 'block';
    document.getElementById('menuName').textContent = currentUser.name;
    document.getElementById('menuEmail').textContent = currentUser.email;

    if(currentUser.isPremium) {
      menuBadge.innerHTML = '<span>👑 พรีเมียม</span>';
      menuBadge.classList.add('premium');
    } else {
      menuBadge.innerHTML = '<span>🆓 แพ็กเกจฟรี</span>';
      menuBadge.classList.remove('premium');
    }
  } else {
    guestView.style.display = 'block';
    loggedView.style.display = 'none';
  }
}
// Text to Speech
let isSpeaking = false;

function speakText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    document.querySelectorAll('.btn-speak').forEach(btn => {
      btn.innerHTML = '🔊 ฟังเสียง';
    });
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = 'th-TH';
  utterance.rate = 0.9;
  utterance.pitch = 1;

  utterance.onstart = () => {
    isSpeaking = true;
    document.querySelectorAll('.btn-speak').forEach(btn => {
      btn.innerHTML = '⏹ หยุดเสียง';
    });
  };

  utterance.onend = () => {
    isSpeaking = false;
    document.querySelectorAll('.btn-speak').forEach(btn => {
      btn.innerHTML = '🔊 ฟังเสียง';
    });
  };

  window.speechSynthesis.speak(utterance);
}
function colorizeReading(text) {
  return text
    // ชื่อไพ่ Major Arcana
    .replace(/The Fool/g, '<span style="color:#a855f7;font-weight:700">The Fool</span>')
    .replace(/The Magician/g, '<span style="color:#a855f7;font-weight:700">The Magician</span>')
    .replace(/The High Priestess/g, '<span style="color:#a855f7;font-weight:700">The High Priestess</span>')
    .replace(/The Empress/g, '<span style="color:#a855f7;font-weight:700">The Empress</span>')
    .replace(/The Emperor/g, '<span style="color:#a855f7;font-weight:700">The Emperor</span>')
    .replace(/The Hierophant/g, '<span style="color:#a855f7;font-weight:700">The Hierophant</span>')
    .replace(/The Lovers/g, '<span style="color:#ec4899;font-weight:700">The Lovers</span>')
    .replace(/The Chariot/g, '<span style="color:#a855f7;font-weight:700">The Chariot</span>')
    .replace(/Strength/g, '<span style="color:#f59e0b;font-weight:700">Strength</span>')
    .replace(/The Hermit/g, '<span style="color:#a855f7;font-weight:700">The Hermit</span>')
    .replace(/Wheel of Fortune/g, '<span style="color:#f59e0b;font-weight:700">Wheel of Fortune</span>')
    .replace(/Justice/g, '<span style="color:#3b82f6;font-weight:700">Justice</span>')
    .replace(/The Hanged Man/g, '<span style="color:#a855f7;font-weight:700">The Hanged Man</span>')
    .replace(/Death/g, '<span style="color:#6b7280;font-weight:700">Death</span>')
    .replace(/Temperance/g, '<span style="color:#10b981;font-weight:700">Temperance</span>')
    .replace(/The Devil/g, '<span style="color:#ef4444;font-weight:700">The Devil</span>')
    .replace(/The Tower/g, '<span style="color:#ef4444;font-weight:700">The Tower</span>')
    .replace(/The Star/g, '<span style="color:#60a5fa;font-weight:700">The Star</span>')
    .replace(/The Moon/g, '<span style="color:#818cf8;font-weight:700">The Moon</span>')
    .replace(/The Sun/g, '<span style="color:#fbbf24;font-weight:700">The Sun</span>')
    .replace(/Judgement/g, '<span style="color:#a855f7;font-weight:700">Judgement</span>')
    .replace(/The World/g, '<span style="color:#10b981;font-weight:700">The World</span>')
    // หัวข้อสำคัญ
    .replace(/อดีต/g, '<span style="color:#818cf8;font-weight:700">อดีต</span>')
    .replace(/ปัจจุบัน/g, '<span style="color:#a855f7;font-weight:700">ปัจจุบัน</span>')
    .replace(/อนาคต/g, '<span style="color:#ec4899;font-weight:700">อนาคต</span>')
    .replace(/ความรัก/g, '<span style="color:#ec4899;font-weight:700">ความรัก</span>')
    .replace(/การงาน/g, '<span style="color:#60a5fa;font-weight:700">การงาน</span>')
    .replace(/การเงิน/g, '<span style="color:#f59e0b;font-weight:700">การเงิน</span>')
    .replace(/สุขภาพ/g, '<span style="color:#10b981;font-weight:700">สุขภาพ</span>')
    .replace(/คำแนะนำ/g, '<span style="color:#f59e0b;font-weight:700">คำแนะนำ</span>')
    .replace(/สิ่งที่ต้องระวัง/g, '<span style="color:#ef4444;font-weight:700">⚠️ สิ่งที่ต้องระวัง</span>')
    .replace(/\n/g, '<br>');
}