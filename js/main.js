// Navigation
function go(page) {
  const pages = {
    tarot: 'pages/tarot.html',
    numerology: 'pages/numerology.html',
    face: 'pages/face.html',
    palm: 'pages/palm.html',
    iching: 'pages/iching.html',
    rune: 'pages/rune.html',
    thai: 'pages/thai.html',
    western: 'pages/western.html',
    chinese: 'pages/chinese.html',
    vedic: 'pages/vedic.html',
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
  return parseInt(localStorage.getItem('coins') || '20');
}
function setCoins(n) {
  localStorage.setItem('coins', n);
  document.querySelector('.coin-badge').textContent = `🪙 ${n} เหรียญ`;
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

function loginGoogle() {
  // Mock data ก่อน จะเปลี่ยนเป็น Firebase ทีหลัง
  currentUser = {
    name: 'Ukrit Prasert',
    email: 'ukrit@gmail.com',
    photo: null,
    isPremium: false
  };
  updateUserUI();
  closeUserMenu();
}

function logout() {
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