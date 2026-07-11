// js/main.js

// ─── TEXT TO SPEECH ───
let isSpeaking = false;

function speakText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    document.querySelectorAll('.btn-speak').forEach(btn => { btn.innerHTML = '🔊 ฟังเสียง'; });
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = 'th-TH';
  utterance.rate = 0.9;
  utterance.pitch = 1;

  utterance.onstart = () => {
    isSpeaking = true;
    document.querySelectorAll('.btn-speak').forEach(btn => { btn.innerHTML = '⏹ หยุดเสียง'; });
  };
  utterance.onend = () => {
    isSpeaking = false;
    document.querySelectorAll('.btn-speak').forEach(btn => { btn.innerHTML = '🔊 ฟังเสียง'; });
  };

  window.speechSynthesis.speak(utterance);
}

// ─── COLORIZE READING ───
function colorizeReading(text) {
  return text
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