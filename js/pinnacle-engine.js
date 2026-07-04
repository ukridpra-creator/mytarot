// pinnacle-engine.js
// Logic คำนวณ Pinnacle Numbers ครบทุกอย่าง

// ─── REDUCE FUNCTIONS ───

function reduceKeepMaster(n) {
  if (n === 11 || n === 22) return n;
  while (n > 9) {
    n = String(n).split('').reduce(function(a, b) { return a + parseInt(b); }, 0);
    if (n === 11 || n === 22) return n;
  }
  return n;
}

function reduceYear(year) {
  var sum = String(year).split('').reduce(function(a, b) { return a + parseInt(b); }, 0);
  return reduceKeepMaster(sum);
}

// ─── CORE CALCULATIONS ───

function calcLifePath(day, month, year) {
  var d = reduceKeepMaster(day);
  var m = reduceKeepMaster(month);
  var y = reduceYear(year);
  var total = d + m + y;
  return reduceKeepMaster(total);
}

function calcPinnacles(day, month, year) {
  var d = reduceKeepMaster(day);
  var m = reduceKeepMaster(month);
  var y = reduceYear(year);

  var p1 = reduceKeepMaster(m + d);
  var p2 = reduceKeepMaster(d + y);
  var p3 = reduceKeepMaster(p1 + p2);
  var p4 = reduceKeepMaster(m + y);

  return [p1, p2, p3, p4];
}

function calcAgeRanges(lifePath) {
  var lp = lifePath === 11 ? 2 : lifePath === 22 ? 4 : lifePath;
  var end1 = 36 - lp;
  var end2 = end1 + 9;
  var end3 = end2 + 9;
  return [
    { start: 0,      end: end1, label: 'แรกเกิด — อายุ ' + end1 + ' ปี' },
    { start: end1+1, end: end2, label: 'อายุ ' + (end1+1) + ' — ' + end2 + ' ปี' },
    { start: end2+1, end: end3, label: 'อายุ ' + (end2+1) + ' — ' + end3 + ' ปี' },
    { start: end3+1, end: 999,  label: 'อายุ ' + (end3+1) + ' ปีขึ้นไป' }
  ];
}

function getCurrentPinnacle(birthYear, ranges) {
  var curAge = new Date().getFullYear() - birthYear;
  for (var i = 0; i < ranges.length; i++) {
    if (curAge >= ranges[i].start && curAge <= ranges[i].end) return i + 1;
  }
  return 4;
}

function calcPersonalYear(day, month, targetYear) {
  var d = reduceKeepMaster(day);
  var m = reduceKeepMaster(month);
  var y = reduceYear(targetYear);
  return reduceKeepMaster(d + m + y);
}

function calcChallenges(day, month, year) {
  var d = reduceKeepMaster(day);
  var m = reduceKeepMaster(month);
  var y = reduceYear(year);
  var c1 = Math.abs(m - d);
  var c2 = Math.abs(d - y);
  var c3 = Math.abs(c1 - c2);
  var c4 = Math.abs(m - y);
  return [c1, c2, c3, c4];
}

// ─── MAIN FUNCTION ───
function calcAllPinnacle(day, month, year) {
  var lp     = calcLifePath(day, month, year);
  var pins   = calcPinnacles(day, month, year);
  var ranges = calcAgeRanges(lp);
  var curPin = getCurrentPinnacle(year, ranges);
  var pyNow  = calcPersonalYear(day, month, new Date().getFullYear());
  var pyNext = calcPersonalYear(day, month, new Date().getFullYear() + 1);
  var challenges = calcChallenges(day, month, year);

  var d = reduceKeepMaster(day);
  var m = reduceKeepMaster(month);
  var y = reduceYear(year);

  // ─── raw sums ก่อน reduce (เพื่อแสดง เช่น 13 → 4) ───
  var raw0 = m + d;       // P1: month + day
  var raw1 = d + y;       // P2: day + year
  var raw2 = pins[0] + pins[1]; // P3: P1 + P2
  var raw3 = m + y;       // P4: month + year

  return {
    day:        d,
    month:      m,
    year:       y,
    lifePath:   lp,
    pinnacles:  pins,
    ranges:     ranges,
    currentPin: curPin,
    currentAge: new Date().getFullYear() - year,
    personalYearNow:  pyNow,
    personalYearNext: pyNext,
    challenges: challenges,
    // raw sums ก่อน reduce — ใช้แสดง "13 → 4"
    rawSums: [raw0, raw1, raw2, raw3]
  };
}
