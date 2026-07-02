// thai-engine.js
// รวม: ลัคนา + จันทร์ + ฤกษ์นักษัตร
// ต้องโหลด astronomy.browser.min.js ก่อนค่ะ
// กรุงเทพ UTC+6:42 (สุริยยาตร์)

var BANGKOK_LAT = 13.7525;
var BANGKOK_LON = 100.494;

function _deg2rad(d) { return d * Math.PI / 180; }
function _rad2deg(r) { return r * 180 / Math.PI; }
function _norm360(x) { return ((x % 360) + 360) % 360; }
function _jcentury(jd) { return (jd - 2451545.0) / 36525.0; }

function _obliquity(t) {
  return 23.439291111 - 0.013004167*t - 0.000000164*t*t + 0.000000504*t*t*t;
}

function _lst(jd_val, lon) {
  var t = _jcentury(jd_val);
  var theta = 280.46061837 + 360.98564736629*(jd_val-2451545.0) + 0.000387933*t*t - t*t*t/38710000;
  return _norm360(theta + lon);
}

function _ayanamsa(t) {
  return 23.85 + t * (50.2611 / 3600);
}

// แปลงวันเวลา UTC → Julian Day
function _toJD(year, month, day, hourUTC, minute) {
  var a = Math.floor((14-month)/12);
  var y = year + 4800 - a;
  var m = month + 12*a - 3;
  var jd = day + Math.floor((153*m+2)/5) + 365*y
         + Math.floor(y/4) - Math.floor(y/100)
         + Math.floor(y/400) - 32045;
  return jd + (hourUTC-12)/24 + minute/1440;
}

// แปลงเวลา BKK สุริยยาตร์ (UTC+6:42) → UTC
function _bkkToUTC(year, month, day, hour, minute) {
  var totalMin = hour*60 + minute - (6*60+42);
  var d = day;
  if (totalMin < 0) { totalMin += 24*60; d -= 1; }
  return { year:year, month:month, day:d, hour:Math.floor(totalMin/60), min:totalMin%60 };
}

// ─── LAGNA (ลัคนา) ───
// year, month, day = CE | hour, minute = BKK time
function calcLagna(year, month, day, hour, minute, lat, lon) {
  lat = lat !== undefined ? lat : BANGKOK_LAT;
  lon = lon !== undefined ? lon : BANGKOK_LON;

  var utc = _bkkToUTC(year, month, day, hour, minute);
  var jd_val = _toJD(utc.year, utc.month, utc.day, utc.hour, utc.min);
  var t = _jcentury(jd_val);

  var eps   = _obliquity(t);
  var lst   = _lst(jd_val, lon);
  var eps_r = _deg2rad(eps);
  var lat_r = _deg2rad(lat);
  var ramc_r= _deg2rad(lst);

  var asc_r = Math.atan2(
    Math.cos(ramc_r),
    -(Math.sin(ramc_r)*Math.cos(eps_r) + Math.tan(lat_r)*Math.sin(eps_r))
  );
  var asc_trop = _norm360(_rad2deg(asc_r));
  var ayn      = _ayanamsa(t);
  var asc_sid  = _norm360(asc_trop - ayn);

  var signIdx = Math.floor(asc_sid / 30);
  var deg     = asc_sid % 30;
  return {
    lon:      asc_sid,
    sign:     signIdx,
    deg:      Math.floor(deg),
    min:      Math.floor((deg % 1) * 60),
    tropical: asc_trop,
    ayanamsa: ayn,
  };
}

// ─── MOON (จันทร์) ───
function getMoonSign(year, month, day, hour, minute) {
  hour   = hour   || 0;
  minute = minute || 0;

  // BKK UTC+7 → UTC (จันทร์ใช้ UTC+7 ปกติ)
  var hourUTC = hour - 7;
  var dayUTC  = day;
  if (hourUTC < 0) { hourUTC += 24; dayUTC -= 1; }

  var date = new Date(Date.UTC(year, month-1, dayUTC, hourUTC, minute, 0));

  try {
    var lon_trop = Astronomy.EclipticLongitude(Astronomy.Body.Moon, date);
    lon_trop = _norm360(lon_trop);

    var jd_val = _toJD(year, month, day, hourUTC, minute);
    var t      = _jcentury(jd_val);
    var ayn    = _ayanamsa(t);
    var lon_sid= _norm360(lon_trop - ayn);

    var signIdx = Math.floor(lon_sid / 30);
    var deg     = lon_sid % 30;
    var nak     = _getNakshatra(lon_sid);

    return {
      lon:       lon_sid,
      sign:      signIdx,
      deg:       Math.floor(deg),
      min:       Math.floor((deg % 1) * 60),
      nakshatra: nak,
    };
  } catch(e) {
    console.error('Moon calc error:', e);
    return null;
  }
}

// ─── NAKSHATRA (ฤกษ์) ───
var NAKSHATRA_NAMES = [
  'อัศวินี','ภรณี','กฤติกา','โรหิณี','มฤคศิระ','อารทรา',
  'ปุนัพสุ','ปุษยะ','อาศเลษา','มาฆะ','บุรพผลคุณี','อุตตรผลคุณี',
  'หัสตะ','จิตรา','สวาติ','วิสาขะ','อนุราธะ','เชษฐา',
  'มูละ','บุรพอาษาฒ','อุตตรอาษาฒ','ศรวณะ','ธนิษฐา','ศตภิษัช',
  'บุรพภัทรบท','อุตตรภัทรบท','เรวดี'
];

var RERK_GROUPS = [
  {name:'ทลิทโท',   color:'#94a3b8', auspicious:false, desc:'ฤกษ์แห่งผู้ร้องขอ มีเสน่ห์เมตตามหานิยมสูง'},
  {name:'ภูมิปาโล', color:'#4ade80', auspicious:true,  desc:'ฤกษ์แห่งผู้รักษาที่ดิน เหมาะการเกษตร ค้าขาย ปลูกสร้าง'},
  {name:'เทศาตรี',  color:'#fb923c', auspicious:false, desc:'ฤกษ์แห่งนักพเนจร ชอบเที่ยว มีเสน่ห์ดึงดูดผู้คน'},
  {name:'เทวี',     color:'#f9a8d4', auspicious:true,  desc:'ฤกษ์แห่งราชินี เหมาะการแต่งงาน ธุรกิจความงาม มงคลสูง'},
  {name:'เพชฌฆาต', color:'#f87171', auspicious:false, desc:'ฤกษ์แห่งการต่อสู้ เหมาะการรักษาโรค ไม่ใช้ในงานมงคล'},
  {name:'มหัทธโน', color:'#fbbf24', auspicious:true,  desc:'ฤกษ์แห่งผู้มั่งมี เหมาะธุรกิจการเงิน ขึ้นบ้านใหม่ งานแต่ง'},
  {name:'โจโร',     color:'#a78bfa', auspicious:false, desc:'ฤกษ์แห่งผู้ว่องไว ฉลาดหลักแหลม วางแผนเก่ง'},
  {name:'ราชา',     color:'#60a5fa', auspicious:true,  desc:'ฤกษ์แห่งราชา มีอำนาจบารมี เหมาะรับตำแหน่ง งานราชการ'},
  {name:'สมโณ',     color:'#86efac', auspicious:false, desc:'ฤกษ์แห่งผู้สงบ เหมาะบวช ปฏิบัติธรรม งานเงียบๆ'},
];

function _getNakshatra(sidLon) {
  var idx      = Math.min(Math.floor(sidLon / (360/27)), 26);
  var groupIdx = idx % 9;
  return {
    idx:        idx + 1,
    name:       NAKSHATRA_NAMES[idx],
    group:      RERK_GROUPS[groupIdx],
  };
}

// expose
function getNakshatra(sidLon) { return _getNakshatra(sidLon); }

// ─── FORMAT ───
var SIGNS_TH = ['เมษ','พฤษภ','มิถุน','กรกฏ','สิงห์','กันย์','ตุลย์','พิจิก','ธนู','มกร','กุมภ์','มีน'];
var HOUSES_TH= ['ตนุ','กดุมภะ','สหัชชะ','พันธุ','ปุตตะ','อริ','ปัตนิ','มรณะ','ศุภะ','กัมมะ','ลาภะ','วินาศ'];

function signName(idx)  { return SIGNS_TH[idx]  || '—'; }
function houseName(idx) { return HOUSES_TH[idx] || '—'; }
function getHouse(planetSign, lagnaSign) {
  return ((planetSign - lagnaSign + 12) % 12) + 1;
}