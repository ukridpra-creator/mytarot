#!/usr/bin/env node
/**
 * patch-native-google-auth.js
 *
 * สแกนหาไฟล์ .html ทั้งหมดในโปรเจกต์ที่มี signInWithPopup(auth, new GoogleAuthProvider())
 * แล้วแก้ให้เรียก native Google Sign-In เมื่อรันในแอป (Capacitor) แต่ยังใช้ signInWithPopup เดิมบนเว็บ
 *
 * วิธีใช้:
 *   node patch-native-google-auth.js --dry-run   ← ดูก่อนว่าจะแก้ไฟล์ไหนบ้าง (ไม่เขียนไฟล์จริง)
 *   node patch-native-google-auth.js             ← แก้ไฟล์จริง
 *
 * รันจาก root ของโปรเจกต์ (โฟลเดอร์ mytarot)
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');

const SKIP_DIRS = new Set(['node_modules', 'android', 'ios', '.git', '.gradle', 'build']);

const CALL_PATTERN = /signInWithPopup\(\s*auth\s*,\s*new GoogleAuthProvider\(\)\s*\)/g;
const NATIVE_MODULE_REL = 'js/native-google-auth.js';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function relImportPath(fromFile) {
  const fromDir = path.dirname(fromFile);
  const target = path.join(ROOT, NATIVE_MODULE_REL);
  let rel = path.relative(fromDir, target).split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!CALL_PATTERN.test(content)) return null;
  CALL_PATTERN.lastIndex = 0;

  const original = content;
  const importPath = relImportPath(file);

  // 1) แทนที่ตัว call expression (ไม่แตะ try/catch เดิม)
  content = content.replace(
    CALL_PATTERN,
    `(window.Capacitor?.isNativePlatform() ? nativeGoogleSignIn(auth, GoogleAuthProvider, signInWithCredential) : signInWithPopup(auth, new GoogleAuthProvider()))`
  );

  // 2) เพิ่ม signInWithCredential เข้า import firebase-auth.js ถ้ายังไม่มี
  content = content.replace(
    /(import\s*\{[^}]*firebase-auth[^}]*\}\s*from\s*'[^']*firebase-auth\.js';)/g,
    (match) => {
      if (match.includes('signInWithCredential')) return match;
      return match.replace(/\}(\s*from)/, ', signInWithCredential }$1');
    }
  );
  // เผื่อ import แยกหลายบรรทัด (import { ... } \n  from '...firebase-auth.js')
  content = content.replace(
    /(import\s*\{[^}]*)\}(\s*\n?\s*from\s*'[^']*firebase-auth\.js';)/g,
    (match, p1, p2) => {
      if (p1.includes('signInWithCredential')) return match;
      return `${p1}, signInWithCredential }${p2}`;
    }
  );

  // 3) เพิ่ม import nativeGoogleSignIn ต่อจาก import firebase-auth.js บรรทัดแรกที่เจอ
  if (!content.includes('native-google-auth.js')) {
    content = content.replace(
      /(<script type="module">\s*\n)/,
      `$1import { nativeGoogleSignIn } from '${importPath}';\n`
    );
  }

  if (content === original) return null;
  return content;
}

const files = walk(ROOT);
const changed = [];

for (const file of files) {
  const patched = patchFile(file);
  if (patched === null) continue;
  changed.push(file);
  if (!DRY_RUN) {
    fs.writeFileSync(file, patched, 'utf8');
  }
}

console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}พบไฟล์ที่ต้องแก้ทั้งหมด ${changed.length} ไฟล์:\n`);
changed.forEach((f) => console.log('  -', path.relative(ROOT, f)));
console.log(DRY_RUN
  ? '\nนี่คือ dry-run เท่านั้น ยังไม่มีไฟล์ไหนถูกเขียนจริง รันโดยไม่ใส่ --dry-run เพื่อแก้จริง'
  : '\nแก้ไฟล์เรียบร้อยแล้ว ตรวจสอบด้วย git diff ก่อน commit');