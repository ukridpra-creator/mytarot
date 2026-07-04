function getThaiLunarDate(inputDate) {
  var dateStr = (inputDate instanceof Date)
    ? inputDate.toISOString().slice(0,10)
    : inputDate;

  var checkYear = parseInt(dateStr.slice(0,4));

  // ใช้ timestamp วันไทย UTC+7 ตรงๆ แทน Date object
  function dateToJulian(y, m, d) {
    // Julian Day Number
    var a = Math.floor((14 - m) / 12);
    var yr = y + 4800 - a;
    var mn = m + 12 * a - 3;
    return d + Math.floor((153*mn+2)/5) + 365*yr + Math.floor(yr/4) - Math.floor(yr/100) + Math.floor(yr/400) - 32045;
  }

  function julianToDate(jd) {
    var a = jd + 32044;
    var b = Math.floor((4*a+3)/146097);
    var c = a - Math.floor((146097*b)/4);
    var d2 = Math.floor((4*c+3)/1461);
    var e = c - Math.floor((1461*d2)/4);
    var m2 = Math.floor((5*e+2)/153);
    var day = e - Math.floor((153*m2+2)/5) + 1;
    var month = m2 + 3 - 12*Math.floor(m2/10);
    var year = 100*b + d2 - 4800 + Math.floor(m2/10);
    return { y: year, m: month, d: day };
  }

  function toStr(jd) {
    var dt = julianToDate(jd);
    return dt.y + '-' + String(dt.m).padStart(2,'0') + '-' + String(dt.d).padStart(2,'0');
  }

  function xlmod(a, b) { return a - b * Math.floor(a / b); }

  var arrAtikawanY = [2500,2506,2513,2516,2522,2530,2533,2540,2543,
                      2549,2552,2559,2563,2568,2575,2578,2586,2589,2595];
  var beginYear = 1957;

  // Julian Day ของ 1956-12-03
  var beginJD = dateToJulian(1956, 12, 3);

  // Julian Day ของวันที่ค้นหา
  var parts = dateStr.split('-');
  var targetJD = dateToJulian(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));

  var dayAdd = 0;
  var result = null;

  for (var i = beginYear; i <= checkYear + 1; i++) {
    var isAtikamas = (xlmod(((i - 78) - 0.45222), 2.7118886) < 1) ? 1 : 0;
    var isAtikawan = arrAtikawanY.includes(i + 543) ? 1 : 0;
    var dayInYear = 354;
    if (isAtikamas) dayInYear = 384;
    if (isAtikawan) dayInYear = 355;

    var startJD = beginJD + dayAdd;
    dayAdd += dayInYear;

    // ข้ามปีที่ไม่เกี่ยว
    if (startJD + dayInYear + 60 < targetJD) continue;
    if (startJD > targetJD + 30) break;

    var cUDay = 0, cDDay = 0, currentMonth = 1;
    var doubleMonth = false, doubleMonthEight = '';

    for (var v = 0; v < (dayInYear + 60); v++) {
      var finalDDay = (currentMonth % 2 === 1) ? 14 : 15;
      if (isAtikawan && currentMonth === 7) finalDDay = 15;

      if (cDDay === finalDDay) {
        currentMonth++;
        if (currentMonth === 13) currentMonth = 1;
        if (isAtikamas && currentMonth === 9 && !doubleMonth) {
          currentMonth--;
          doubleMonth = true;
          doubleMonthEight = 'หลัง';
        } else {
          doubleMonthEight = '';
        }
        cUDay = 0;
        cDDay = 0;
      }

      if (cUDay < 15) { cUDay++; }
      else { if (cDDay < finalDDay) cDDay++; }

      var thisJD = startJD + v;

      if (thisJD === targetJD) {
        result = {
          waxing: cDDay === 0,
          day: cDDay > 0 ? cDDay : cUDay,
          month: currentMonth,
          monthDouble: doubleMonthEight,
          text: (cDDay > 0
            ? 'แรม ' + cDDay + ' ค่ำ เดือน ' + currentMonth
            : 'ขึ้น ' + cUDay + ' ค่ำ เดือน ' + currentMonth)
            + (doubleMonthEight ? ' ' + doubleMonthEight : '')
        };
        break;
      }
      if (thisJD > targetJD) break;
    }
    if (result) break;
  }

  return result || { text: 'ไม่พบข้อมูล' };
}

// ─── เทส ───
var tests = [
  { date: '2024-04-15', expect: 'ขึ้น 7 ค่ำ เดือน 5' },
  { date: '2024-01-01', expect: 'แรม 10 ค่ำ เดือน 12' },
  { date: '2024-12-31', expect: '?' },
  { date: '1990-01-15', expect: '?' },
  { date: '1990-09-25', expect: '?' },
  { date: '2000-04-13', expect: '?' },
  { date: '2024-06-22', expect: '?' },
];

tests.forEach(function(t) {
  var r = getThaiLunarDate(t.date);
  var ok = t.expect === '?' ? '' : (r.text.trim() === t.expect.trim() ? ' ✅' : ' ❌ (expect: ' + t.expect + ')');
  console.log(t.date + ' → ' + r.text + ok);
});
