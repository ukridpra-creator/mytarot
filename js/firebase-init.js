import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';


const firebaseConfig = {
  apiKey: "AIzaSyBMQEsuykNPvV7CsnB36zzmN-wribcd7YM",
  authDomain: "my-tarot67.firebaseapp.com",
  projectId: "my-tarot67",
  storageBucket: "my-tarot67.firebasestorage.app",
  messagingSenderId: "33661162829",
  appId: "1:33661162829:web:9e06a7cd5a00d613785304"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, indexedDBLocalPersistence).catch(() => setPersistence(auth, browserLocalPersistence));
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window.updateCoinUI = function(coins) {
  var badge = document.querySelector('.coin-badge');
  if (badge) badge.textContent = '🪙 ' + coins + ' เหรียญ';
};

function setAvatarDisplay(avatar) {
  var avatarEl = document.getElementById('avatarEl');
  if (!avatarEl) return;
  if (avatar && avatar.includes('.png')) {
    avatarEl.innerHTML = '<img src="' + avatar.replace('../','') + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
  } else { avatarEl.textContent = avatar || '👤'; }
}

onAuthStateChanged(auth, async user => {
  if (user) {
    try {
      var snap = await getDoc(doc(db, 'users', user.uid));
      var data = snap.exists() ? snap.data() : {};
      updateCoinUI(data.coins !== undefined ? data.coins : 0);
      setAvatarDisplay(data.avatar || '');
      document.getElementById('guestView').style.display = 'none';
      document.getElementById('loggedView').style.display = 'block';
      document.getElementById('menuName').textContent = data.displayName || user.displayName || '';
      document.getElementById('menuEmail').textContent = user.email;
      if (typeof setupCheckin === 'function') setupCheckin(user, '');
    } catch(e) { console.error(e); }
  } else {
  setAvatarDisplay('');
  document.querySelector('.coin-badge').textContent = '🪙 0 เหรียญ';
  document.getElementById('guestView').style.display = 'block';
  document.getElementById('loggedView').style.display = 'none';
}
});




  
window.__fb = {
  loginGoogle: async function() { try { await signInWithPopup(auth, provider); closeUserMenu(); } catch(e) { console.error(e); } },
  loginNow: async function() { try { await signInWithPopup(auth, provider); } catch(e) { console.error(e); } },
  logout: async function() { await signOut(auth); closeUserMenu(); updateCoinUI(0); }
};
