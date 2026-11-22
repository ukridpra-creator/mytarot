/**
 * ชุดทดสอบ thai-astro-engine.js — รันด้วย:  node _tools/thai-astro-engine.test.cjs
 *
 * คำตอบทุกค่าคัดจาก myhora.com (ดูดวงโหราศาสตร์ไทย, ปฏิทินสุริยยาตร์,
 * ลัคนาอันโตนาทีสามัญ สมผุสอาทิตย์อุทัย) เมื่อ 23 พ.ย. 2569
 * รูปแบบค่า: "ราศี:องศา:ลิปดา" ราศี 0 = เมษ … 11 = มีน
 * retro = ดาวที่ myhora ติดป้าย พ. (พักร์); null = ข้ามการตรวจ เพราะดาวอยู่ช่วงหยุดนิ่ง
 *         ซึ่ง myhora กับสูตรนี้นิยามต่างกัน (ดูหมายเหตุในแต่ละเคส)
 */
// โหลดไฟล์คำนวณผ่าน vm เพื่อให้รันได้ทั้งโปรเจกต์แบบ CommonJS และ ES module
var fs = require('fs'), path = require('path'), vm = require('vm');
var sandbox = { self: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'thai-astro-engine.js'), 'utf8'), sandbox);
var A = sandbox.self.ThaiAstro;

var BKK = { lat: 13.752555, lon: 100.494066 };
var CM = { lat: 18.79, lon: 98.9867 };   // อ.เมือง เชียงใหม่ (พิกัดตาม myhora)
var UB = { lat: 15.2283, lon: 104.855 }; // อ.เมือง อุบลราชธานี (พิกัดตาม myhora)

var CASES = [
  { name: '25 ก.ย. 2529 10:37 กรุงเทพฯ', at: { be: 2529, month: 9, day: 25, hour: 10, minute: 37 }, loc: BKK,
    lagna: '6:25:47', nav: 8, tri: 3, nak: 16, retro: ['jupiter'],
    b: ['5:7:35', '1:29:44', '9:0:33', '5:29:52', '10:23:46', '6:24:22', '7:7:59', '11:27:22', '1:16:26', '7:20:32'] },
  { name: '7 ก.ค. 2531 12:45 กรุงเทพฯ', at: { be: 2531, month: 7, day: 7, hour: 12, minute: 45 }, loc: BKK,
    lagna: '5:22:13', nav: 7, tri: 3, nak: 13, retro: ['venus', 'saturn', 'uranus'],
    b: ['2:21:26', '0:0:14', '11:8:9', '2:7:4', '1:4:57', '1:28:30', '8:0:9', '10:22:52', '2:1:14', '7:29:15'] },
  { name: '23 ต.ค. 2540 22:30 กรุงเทพฯ (ลัคนาคาบราศี)', at: { be: 2540, month: 10, day: 23, hour: 22, minute: 30 }, loc: BKK,
    lagna: '3:1:17', nav: 1, tri: 1, nak: 7, retro: ['saturn'],
    b: ['6:5:55', '3:11:8', '7:26:1', '6:20:21', '9:19:46', '7:22:13', '11:15:27', '4:22:55', '2:1:1', '9:8:51'] },
  { name: 'ดาวจร 23 พ.ย. 2569 12:00 กรุงเทพฯ', at: { be: 2569, month: 11, day: 23, hour: 12, minute: 0 }, loc: BKK,
    lagna: '10:10:9', retro: null, // myhora ติด พ. ที่ศุกร์ด้วย แต่ศุกร์อยู่ช่วงหยุดนิ่งก่อนเดินหน้า สูตรนี้นับตามการเคลื่อนที่จริงจึงไม่ติด
    b: ['7:6:9', '0:18:56', '4:4:56', '6:19:12', '4:3:52', '6:8:28', '11:7:28', '9:29:56', '6:9:2', '1:17:57'] },
  { name: '12 มี.ค. 2535 03:15 กรุงเทพฯ (เกิดก่อนอาทิตย์ขึ้น)', at: { be: 2535, month: 3, day: 12, hour: 3, minute: 15 }, loc: BKK,
    lagna: '8:21:57', retro: null, // myhora ติด พ. ที่พุธด้วย พุธอยู่จุดหยุดนิ่งพอดี (เท่ากับเมื่อวาน)
    b: ['10:27:45', '1:27:30', '9:23:42', '11:6:18', '4:16:5', '10:1:24', '9:15:50', '8:11:39', '2:8:52', '8:17:33'] },
  { name: '5 ธ.ค. 2530 14:20 เชียงใหม่ (อุทัยตกครึ่งนาที)', at: { be: 2530, month: 12, day: 5, hour: 14, minute: 20 }, loc: CM,
    // myhora ใช้อุทัย 06:42 สูตรนี้ได้ 06:42.51 ปัดเป็น 06:43 → ลัคนาต่าง 15 ลิปดา ยอมรับได้ถึง 16
    lagna: '11:28:44', lagnaTolerance: 16, retro: ['jupiter'],
    b: ['7:18:32', '1:20:18', '6:13:54', '7:14:26', '11:27:6', '8:12:17', '7:25:21', '11:4:16', '5:25:12', '7:27:6'] },
  { name: '20 มิ.ย. 2545 04:40 อุบลฯ (ก่อนอาทิตย์ขึ้น + ต่างจังหวัด)', at: { be: 2545, month: 6, day: 20, hour: 4, minute: 40 }, loc: UB,
    lagna: '1:17:20', retro: ['uranus'],
    b: ['2:4:23', '6:0:28', '2:20:19', '1:16:50', '2:27:0', '3:9:42', '1:21:25', '1:22:48', '7:29:34', '10:2:30'] },
  { name: '16 เม.ย. 2538 10:00 อุบลฯ (วันเถลิงศก ก่อนเวลาเถลิงศก)', at: { be: 2538, month: 4, day: 16, hour: 10, minute: 0 }, loc: UB,
    lagna: '2:19:3', retro: ['jupiter'],
    b: ['0:1:56', '6:10:52', '3:21:51', '0:11:56', '7:23:38', '10:27:2', '10:21:1', '6:11:45', '6:9:36', '9:1:15'] },
  { name: '16 เม.ย. 2538 18:00 อุบลฯ (วันเถลิงศก หลังเวลาเถลิงศก)', at: { be: 2538, month: 4, day: 16, hour: 18, minute: 0 }, loc: UB,
    lagna: '6:4:6', retro: ['jupiter'],
    b: ['0:2:15', '6:15:31', '3:22:4', '0:12:26', '7:23:38', '10:27:25', '10:21:4', '6:11:44', '6:9:26', '9:1:15'] }
];

function arc(s) { var p = s.split(':').map(Number); return p[0] * 1800 + p[1] * 60 + p[2]; }
function diff(a, b) { var d = Math.abs(a - b) % 21600; return Math.min(d, 21600 - d); }

var pass = 0, fail = 0;
function check(ok, label, detail) {
  if (ok) pass++;
  else { fail++; console.log('  ✗ ' + label + ' — ' + detail); }
}

CASES.forEach(function (c) {
  console.log(c.name);
  var input = Object.assign({}, c.at, c.loc);
  var pos = A.positions(input);
  A.BODIES.forEach(function (body, i) {
    var want = arc(c.b[i]), got = pos[body].longitude;
    check(got === want, A.BODY_TH[body], 'ได้ ' + pos[body].text + ' ควรได้ ' + A.describe(want).text);
  });
  var lag = A.lagna(input), tol = c.lagnaTolerance || 1;
  check(diff(lag.longitude, arc(c.lagna)) <= tol, 'ลัคนา', 'ได้ ' + lag.text + ' ควรได้ ' + A.describe(arc(c.lagna)).text + ' (อุทัย ' + lag.sunrise + ')');
  if (c.nav) check(lag.navang.order === c.nav, 'นวางค์ลัคนา', 'ได้ ' + lag.navang.order + ' ควรได้ ' + c.nav);
  if (c.tri) check(lag.triyang.order === c.tri, 'ตรียางค์ลัคนา', 'ได้ ' + lag.triyang.order + ' ควรได้ ' + c.tri);
  if (c.nak) check(lag.nakshatra.order === c.nak, 'ฤกษ์ลัคนา', 'ได้ ' + lag.nakshatra.order + ' ควรได้ ' + c.nak);
  var retro = A.BODIES.filter(function (b) { return pos[b].retrograde; }).sort().join(',');
  if (c.retro) check(retro === c.retro.slice().sort().join(','), 'ดาวพักร์', 'ได้ [' + retro + '] ควรได้ [' + c.retro.slice().sort().join(',') + ']');
});

// นวางค์/ตรียางค์/ฤกษ์ ของลัคนา ตามที่ myhora แสดง (ราศีและดาวเจ้าเรือน)
var l1 = A.lagna(Object.assign({}, CASES[0].at, BKK));
check(l1.navang.signTh === 'พฤษภ' && l1.navang.lord === 'venus', 'นวางค์ ตุล 25°47\'', 'ได้ ' + l1.navang.signTh + '/' + l1.navang.lord);
check(l1.triyang.signTh === 'มิถุน' && l1.triyang.lord === 'mercury', 'ตรียางค์ ตุล 25°47\'', 'ได้ ' + l1.triyang.signTh + '/' + l1.triyang.lord);
check(l1.nakshatra.name === 'วิสาขะ' && l1.nakshatra.group === 'เพชฌฆาต', 'ฤกษ์ ตุล 25°47\'', 'ได้ ' + l1.nakshatra.name + '/' + l1.nakshatra.group);

console.log('\nผ่าน ' + pass + ' ข้อ, ไม่ผ่าน ' + fail + ' ข้อ');
if (fail) process.exit(1);
