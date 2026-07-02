// moon-engine.js
// คำนวณตำแหน่งจันทร์ด้วย astronomy-engine (แม่น ~99%)
// ต้องโหลด astronomy.browser.min.js ก่อนค่ะ

// Lahiri ayanamsa ปี 2000 ≈ 23.85°
function getLahiriAyanamsa(year, month, day) {
  var jd = getJD(year, month, day);
  var t  = (jd - 2451545.0) / 36525.0;
  return 23.85 + t * (50.2611 / 3600);
}

function getJD(year, month, day) {
  var a = Math.floor((14 - month) / 12);
  var y = year + 4800 - a;
  var m = month + 12 * a - 3;
  return day + Math.floor((153*m+2)/5) + 365*y
       + Math.floor(y/4) - Math.floor(y/100)
       + Math.floor(y/400) - 32045;
}

// ── ใช้ astronomy-engine ──
function getMoonSign(year, month, day, hour, minute) {
  hour   = hour   || 0;
  minute = minute || 0;

  // UTC+7 Bangkok → UTC
  var date = new Date(Date.UTC(year, month-1, day, hour-7, minute, 0));

  try {
    // ecliptic longitude (tropical)
    var lon = Astronomy.EclipticLongitude(Astronomy.Body.Moon, date);
    lon = ((lon % 360) + 360) % 360;

    // แปลง tropical → sidereal (Lahiri)
    var ayn = getLahiriAyanamsa(year, month, day);
    var sid = ((lon - ayn) % 360 + 360) % 360;

    return {
      lon:     Math.round(sid * 100) / 100,
      sign:    Math.floor(sid / 30),
      deg:     Math.floor(sid % 30),
      min:     Math.floor((sid % 1) * 60),
      nakshatra: getNakshatra(sid),
    };
  } catch(e) {
    console.error('Moon calc error:', e);
    return null;
  }
}

// 27 นักษัตร (ฤกษ์)
var NAKSHATRA_NAMES = [
  'อัศวินี','ภรณี','กฤติกา','โรหิณี','มฤคศิระ','อารทรา',
  'ปุนัพสุ','ปุษยะ','อาศเลษา','มาฆะ','บุรพผลคุณี','อุตตรผลคุณี',
  'หัสตะ','จิตรา','สวาติ','วิสาขะ','อนุราธะ','เชษฐา',
  'มูละ','บุรพอาษาฒ','อุตตรอาษาฒ','ศรวณะ','ธนิษฐา','ศตภิษัช',
  'บุรพภัทรบท','อุตตรภัทรบท','เรวดี'
];

// 9 หมวดฤกษ์
var NAKSHATRA_GROUPS = [
  'ทลิทโท','ภูมิปาโล','เทศาตรี','เทวี','เพชฌฆาต',
  'มหัทธโน','โจโร','ราชา','สมโณ'
];

// ฤกษ์มงคล
var AUSPICIOUS = ['มหัทธโน','ภูมิปาโล','เทวี','ราชา'];

function getNakshatra(sidLon) {
  // แต่ละฤกษ์กินอาณาเขต 360/27 = 13.333°
  var idx = Math.floor(sidLon / (360/27));
  idx = Math.min(idx, 26);
  var groupIdx = idx % 9;
  var name  = NAKSHATRA_NAMES[idx];
  var group = NAKSHATRA_GROUPS[groupIdx];
  return {
    idx:       idx + 1,
    name:      name,
    group:     group,
    auspicious: AUSPICIOUS.indexOf(group) >= 0,
  };
}

// ── helper สำหรับแสดงผล ──
var SIGNS_TH = ['เมษ','พฤษภ','มิถุน','กรกฏ','สิงห์','กันย์',
                'ตุลย์','พิจิก','ธนู','มกร','กุมภ์','มีน'];

function formatMoon(result) {
  if (!result) return 'คำนวณไม่ได้ค่ะ';
  return SIGNS_TH[result.sign] + ' ' + result.deg + '° ' + result.min + "'";
}