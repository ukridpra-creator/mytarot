/*!
 * thai-astro-ui.js — ส่วนแสดงผลและตัวสร้างคำสั่งทำนายของหน้า pages/thai-astro
 * ต้องโหลด thai-astro-engine.js ก่อน (ใช้ window.ThaiAstro)
 * ทุกฟังก์ชันคืนค่าเป็นสตริง/ออบเจกต์ล้วน ไม่แตะ DOM จึงทดสอบใน Node ได้
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./thai-astro-engine.js'));
  else root.ThaiAstroUI = factory(root.ThaiAstro);
})(typeof self !== 'undefined' ? self : this, function (A) {
  'use strict';

  var GOLD = '#d4af37', TXT = '#f3eeff', MUT = '#b9aedb', LINE = '#3a2d63', PANEL = '#1a1535', BG = '#0d0820', HI = '#2e2156';
  var MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  var MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var WEEKDAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  var SLOW = ['mars', 'jupiter', 'saturn', 'rahu'];
  var NAK_DESC = {
    'ทลิทโท': 'ผู้ขอ มีเสน่ห์ทางเมตตา คนเอ็นดูช่วยเหลือ',
    'มหัทธโน': 'ผู้มั่งมี เด่นเรื่องทรัพย์และการสะสม',
    'โจโร': 'ผู้ว่องไว ไหวพริบดี กล้าเสี่ยง วางแผนเก่ง',
    'ภูมิปาโล': 'ผู้รักษาแผ่นดิน หนักแน่น มั่นคง เหมาะงานระยะยาว',
    'เทศาตรี': 'ผู้ท่องไป ชอบเดินทาง เข้ากับคนง่าย ค้าขายเก่ง',
    'เทวี': 'นางพญา มีเสน่ห์ รสนิยมดี คนรักใคร่',
    'เพชฌฆาต': 'ผู้เด็ดขาด กล้าตัดสินใจ เหมาะงานที่ต้องฟันธง',
    'ราชา': 'ผู้นำ มีบารมี เหมาะงานปกครองและตำแหน่ง',
    'สมโณ': 'ผู้สงบ ใฝ่รู้ ใฝ่ธรรม เหมาะงานวิชาการและที่ปรึกษา'
  };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function name(b) { return A.BODY_TH[b]; }
  function degText(p) { return p.degree + '°' + pad(p.minute) + "'"; }

  /** วันนี้ตามเวลาไทย */
  function thaiNow() {
    var d = new Date(Date.now() + 7 * 3600 * 1000);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), hour: d.getUTCHours(), minute: d.getUTCMinutes() };
  }
  function weekdayOf(input) {
    var y = input.be != null ? input.be - 543 : input.year;
    return WEEKDAYS[(A.toJdn(y, input.month, input.day) + 1) % 7];
  }
  function birthLine(input, provinceName) {
    var be = input.be != null ? input.be : input.year + 543;
    var s = 'วัน' + weekdayOf(input) + 'ที่ ' + input.day + ' ' + MONTHS[input.month - 1] + ' ' + be;
    if (input.hour != null) s += ' · ' + pad(input.hour) + ':' + pad(input.minute || 0) + ' น.';
    else s += ' · ไม่ทราบเวลาเกิด';
    if (provinceName) s += ' · ' + provinceName;
    return s;
  }

  // ── ผังราศีจักร ────────────────────────────────────────────────────────────

  /** ผังดวงวงกลมแบบไทย เมษอยู่บน เวียนทวนเข็ม ช่องลัคนาไฮไลต์ทอง */
  function wheelSVG(natal) {
    var cx = 175, cy = 175, Ro = 168, Rs = 138, Ri = 58, lag = natal.lagna ? natal.lagna.sign : -1, o = [], i, a, p1, p2;
    function pt(r, ang) { var t = ang * Math.PI / 180; return [(cx + r * Math.cos(t)).toFixed(1), (cy + r * Math.sin(t)).toFixed(1)]; }
    o.push('<svg viewBox="0 0 350 350" width="100%" style="max-width:350px;display:block;margin:0 auto" role="img" aria-label="ผังดวงราศีจักร' + (natal.lagna ? ' ลัคนาราศี' + natal.lagna.signTh : '') + '">');
    o.push('<circle cx="175" cy="175" r="' + Ro + '" fill="' + PANEL + '" stroke="' + LINE + '" stroke-width="1.5"/>');
    if (lag >= 0) {
      a = -90 - 30 * lag;
      var q1 = pt(Ro, a - 15), q2 = pt(Ro, a + 15), q3 = pt(Ri, a + 15), q4 = pt(Ri, a - 15);
      o.push('<path d="M' + q1[0] + ' ' + q1[1] + ' A' + Ro + ' ' + Ro + ' 0 0 1 ' + q2[0] + ' ' + q2[1] + ' L' + q3[0] + ' ' + q3[1] + ' A' + Ri + ' ' + Ri + ' 0 0 0 ' + q4[0] + ' ' + q4[1] + ' Z" fill="' + HI + '"/>');
    }
    o.push('<circle cx="175" cy="175" r="' + Rs + '" fill="none" stroke="' + LINE + '"/>');
    for (i = 0; i < 12; i++) {
      a = -90 - 30 * i - 15; p1 = pt(Ri, a); p2 = pt(Ro, a);
      o.push('<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="' + LINE + '"/>');
    }
    if (lag >= 0) {
      a = -90 - 30 * lag; p1 = pt(Ro, a - 15); p2 = pt(Ro, a + 15);
      o.push('<path d="M' + p1[0] + ' ' + p1[1] + ' A' + Ro + ' ' + Ro + ' 0 0 1 ' + p2[0] + ' ' + p2[1] + '" fill="none" stroke="' + GOLD + '" stroke-width="3"/>');
    }
    o.push('<circle cx="175" cy="175" r="' + Ri + '" fill="' + BG + '" stroke="' + GOLD + '" stroke-width="1.5"/>');
    var bySign = {};
    if (natal.lagna) (bySign[natal.lagna.sign] = bySign[natal.lagna.sign] || []).push('ลั');
    A.BODIES.forEach(function (b) { var s = natal.bodies[b].sign; (bySign[s] = bySign[s] || []).push(A.BODY_NUM[b]); });
    for (i = 0; i < 12; i++) {
      a = -90 - 30 * i;
      var t = pt((Ro + Rs) / 2, a);
      o.push('<text x="' + t[0] + '" y="' + t[1] + '" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="' + (i === lag ? GOLD : MUT) + '">' + A.SIGNS[i] + '</text>');
      if (lag >= 0) {
        t = pt(Ri + 16, a);
        o.push('<text x="' + t[0] + '" y="' + t[1] + '" text-anchor="middle" dominant-baseline="central" font-size="9.5" fill="' + MUT + '">' + A.HOUSES[(i - lag + 12) % 12] + '</text>');
      }
      // ดาวในราศีเดียวกัน: ไม่เกิน 3 ดวงเรียงแถวเดียว มากกว่านั้นแบ่งสองแถว (แถวนอก/แถวใน)
      var ps = bySign[i] || [], rows = ps.length > 3 ? [ps.slice(0, Math.ceil(ps.length / 2)), ps.slice(Math.ceil(ps.length / 2))] : [ps];
      rows.forEach(function (row, ri) {
        var two = rows.length > 1, r = two ? (ri === 0 ? 122 : 96) : (lag >= 0 ? 108 : 100);
        var size = two ? 16 : row.length > 2 ? 18 : 21, step = two ? (ri === 0 ? 9 : 11) : row.length > 2 ? 9.5 : 13;
        row.forEach(function (p, k) {
          var q = pt(r, a + (k - (row.length - 1) / 2) * step);
          o.push('<text x="' + q[0] + '" y="' + q[1] + '" text-anchor="middle" dominant-baseline="central" font-size="' + size + '" font-weight="700" fill="' + (p === 'ลั' ? GOLD : TXT) + '">' + p + '</text>');
        });
      });
    }
    if (natal.lagna) {
      o.push('<text x="175" y="163" text-anchor="middle" font-size="11" fill="' + MUT + '">ลัคนา</text>');
      o.push('<text x="175" y="186" text-anchor="middle" font-size="20" font-weight="700" fill="' + GOLD + '">' + natal.lagna.signTh + '</text>');
      o.push('<text x="175" y="203" text-anchor="middle" font-size="11" fill="' + TXT + '">' + degText(natal.lagna) + '</text>');
    } else {
      o.push('<text x="175" y="171" text-anchor="middle" font-size="11" fill="' + MUT + '">ไม่ทราบ</text>');
      o.push('<text x="175" y="188" text-anchor="middle" font-size="11" fill="' + MUT + '">เวลาเกิด</text>');
    }
    o.push('</svg>');
    return o.join('');
  }

  // ── การ์ดสรุปและตาราง ──────────────────────────────────────────────────────

  function badge(t, solid) {
    return '<span class="ta-badge' + (solid ? ' solid' : '') + '">' + t + '</span>';
  }
  function badgesOf(p) {
    var out = (p.dignity || []).map(function (d) { return badge(d, d === 'เกษตร' || d === 'อุจจ์'); });
    if (p.retrograde) out.push(badge('พักร์', false));
    return out.join('');
  }

  /** การ์ดสรุป 3 ใบ: ลัคนา / ดาวเจ้าชะตา / ฤกษ์ */
  function summaryHTML(natal) {
    var cards = [];
    function card(label, value, sub) {
      return '<div class="ta-chip"><span class="ta-chip-l">' + label + '</span><span class="ta-chip-v">' + value + '</span>' + (sub ? '<span class="ta-chip-s">' + sub + '</span>' : '') + '</div>';
    }
    if (natal.lagna) {
      var lord = A.SIGN_LORD[natal.lagna.sign];
      cards.push(card('ลัคนา', 'ราศี' + natal.lagna.signTh, degText(natal.lagna)));
      cards.push(card('ดาวเจ้าชะตา', name(lord) + ' (' + A.BODY_NUM[lord] + ')', 'ภพ' + natal.bodies[lord].house.name));
      cards.push(card('ฤกษ์ลัคนา', natal.lagna.nakshatra.group, natal.lagna.nakshatra.name));
    } else {
      cards.push(card('อาทิตย์', 'ราศี' + natal.bodies.sun.signTh, degText(natal.bodies.sun)));
      cards.push(card('จันทร์', 'ราศี' + natal.bodies.moon.signTh, 'โดยประมาณ'));
      cards.push(card('ฤกษ์จันทร์', natal.bodies.moon.nakshatra.group, natal.bodies.moon.nakshatra.name));
    }
    return '<div class="ta-chips">' + cards.join('') + '</div>';
  }

  function rowHTML(p, gold) {
    return '<div class="ta-row"><span class="ta-num' + (gold ? ' gold' : '') + '">' + p.num + '</span><span class="ta-name">' + p.name + '</span>' +
      '<span class="ta-sign">' + p.signTh + '</span><span class="ta-deg">' + degText(p) + '</span>' +
      '<span class="ta-house">' + (p.house ? p.house.name : '') + '</span><span class="ta-badges">' + badgesOf(p) + '</span></div>';
  }
  /** ตารางดาวกำเนิด */
  function tableHTML(natal) {
    var h = '<div class="ta-table"><div class="ta-row head"><span class="ta-num"></span><span class="ta-name">ดาว</span><span class="ta-sign">ราศี</span><span class="ta-deg">องศา</span><span class="ta-house">ภพ</span><span class="ta-badges">มาตรฐาน</span></div>';
    if (natal.lagna) h += rowHTML(natal.lagna, true);
    A.BODIES.forEach(function (b) { h += rowHTML(natal.bodies[b], false); });
    return h + '</div>';
  }

  /** กล่องฤกษ์: ฤกษ์ลัคนาและฤกษ์จันทร์ พร้อมคำอธิบายสั้น */
  function nakshatraHTML(natal) {
    function box(label, n) {
      return '<div class="ta-nak"><div class="ta-nak-l">' + label + '</div><div class="ta-nak-v">' + n.group + 'ฤกษ์</div><div class="ta-nak-s">ฤกษ์ที่ ' + n.order + ' ' + n.name + ' — ' + (NAK_DESC[n.group] || '') + '</div></div>';
    }
    var h = '';
    if (natal.lagna) h += box('ฤกษ์ลัคนา', natal.lagna.nakshatra);
    h += box('ฤกษ์จันทร์ (ฤกษ์กำเนิด)', natal.bodies.moon.nakshatra);
    return h;
  }

  /** ตารางดาวจร เทียบดวงเดิม */
  function transitHTML(transit) {
    var h = '<div class="ta-table"><div class="ta-row head"><span class="ta-num"></span><span class="ta-name">ดาวจร</span><span class="ta-sign">ราศี</span><span class="ta-deg">องศา</span><span class="ta-house">ภพ</span><span class="ta-badges"></span></div>';
    transit.list.forEach(function (p) { h += rowHTML(p, false); });
    return h + '</div>';
  }

  // ── ไทม์ไลน์ดาวย้ายราศี ────────────────────────────────────────────────────

  /** ดาวช้าย้ายราศีในช่วง days วัน: [{body, date, fromTh, toTh, house}] เรียงตามวัน */
  function timelineEvents(natal, start, days) {
    var ev = [];
    SLOW.forEach(function (b) {
      A.signChanges(b, start, days).forEach(function (c) {
        c.house = natal.lagna ? A.houseOf(c.to, natal.lagna.sign) : null;
        ev.push(c);
      });
    });
    ev.sort(function (x, y) { return A.toJdn(x.date.year, x.date.month, x.date.day) - A.toJdn(y.date.year, y.date.month, y.date.day); });
    return ev;
  }
  function dateTh(d) { return d.day + ' ' + MONTHS_SHORT[d.month - 1] + ' ' + (d.year + 543); }
  function timelineHTML(events) {
    if (!events.length) return '<div class="ta-note">ช่วง 12 เดือนข้างหน้า ดาวใหญ่ไม่ย้ายราศี</div>';
    return '<div class="ta-timeline">' + events.map(function (e) {
      return '<div class="ta-tl"><span class="ta-tl-d">' + dateTh(e.date) + '</span><span class="ta-tl-t"><b>' + name(e.body) + '</b> ย้ายจาก' + e.fromTh + 'เข้า' + e.toTh + (e.house ? ' <i>ภพ' + e.house.name + '</i>' : '') + '</span></div>';
    }).join('') + '</div>';
  }

  // ── ข้อความผังดวงสำหรับส่งให้ระบบอ่าน ───────────────────────────────────────

  function bodyLine(p) {
    var s = '- ' + p.name + ': ราศี' + p.signTh + ' ' + degText(p);
    if (p.house) s += ' ภพ' + p.house.name + ' (ภพที่ ' + p.house.order + ')';
    if (p.dignity && p.dignity.length) s += ' [' + p.dignity.join(',') + ']';
    if (p.retrograde) s += ' [พักร์]';
    return s;
  }
  function chartText(natal, provinceName) {
    var L = ['== ดวงกำเนิด ==', 'เกิด: ' + birthLine(natal.input, provinceName)];
    if (natal.lagna) {
      L.push('ลัคนา: ราศี' + natal.lagna.signTh + ' ' + degText(natal.lagna) + ' นวางค์ที่ ' + natal.lagna.navang.order + ' (' + natal.lagna.navang.signTh + ') ตรียางค์ที่ ' + natal.lagna.triyang.order + ' ฤกษ์' + natal.lagna.nakshatra.name + ' หมวด' + natal.lagna.nakshatra.group);
      L.push('ดาวเจ้าชะตา (เจ้าเรือนตนุ): ' + name(A.SIGN_LORD[natal.lagna.sign]));
    } else L.push('ลัคนา: ไม่ทราบ (ไม่มีเวลาเกิด) ห้ามอ้างถึงลัคนาและภพ ให้อ่านจากราศีและมุมของดาวแทน และตำแหน่งจันทร์เป็นค่าประมาณ');
    L.push('ฤกษ์จันทร์: ' + natal.bodies.moon.nakshatra.name + ' หมวด' + natal.bodies.moon.nakshatra.group);
    L.push('ตำแหน่งดาว:');
    A.BODIES.forEach(function (b) { L.push(bodyLine(natal.bodies[b])); });
    if (natal.houses) {
      L.push('เรือนชะตา 12 ภพ:');
      natal.houses.forEach(function (h) {
        L.push('- ' + h.name + ' (' + h.signTh + '): ' + (h.bodies.length ? h.bodies.map(name).join(', ') : 'ว่าง') + ' | เจ้าเรือนคือ' + name(h.lord) + ' อยู่ภพ' + h.lordHouse.name);
      });
    }
    var tight = natal.aspects.filter(function (a) { return a.type !== 'ฉาก' || a.orb <= 300; });
    L.push('มุมสัมพันธ์ในดวงเดิม (ระยะห่างเป็นลิปดา ยิ่งน้อยยิ่งแรง):');
    tight.forEach(function (a) { L.push('- ' + name(a.a) + ' ' + a.type + ' ' + name(a.b) + ' (' + a.orb + ')'); });
    return L.join('\n');
  }
  function transitText(transit, label) {
    var L = ['== ดาวจร ' + label + ' =='];
    transit.list.forEach(function (p) {
      var s = bodyLine(p);
      if (p.aspects.length) s += ' → ' + p.aspects.map(function (a) { return a.type + name(a.natal) + 'เดิม(' + a.orb + ')'; }).join(', ');
      L.push(s);
    });
    return L.join('\n');
  }
  /** ข้อเท็จจริงรายเดือน 12 เดือน สำหรับดวงรายปี */
  function monthlyFacts(natal, start) {
    var out = [], y = start.year, m = start.month;
    for (var i = 0; i < 12; i++) {
      // เดือนแรกใช้วันนี้ (ถ้าเลยกลางเดือนแล้ว) เดือนถัดไปใช้กลางเดือน
      var t = A.transitChart(natal, { year: y, month: m, day: i === 0 ? Math.max(15, start.day) : 15, hour: 12, minute: 0 });
      var parts = t.list.filter(function (p) { return SLOW.indexOf(p.body) >= 0; }).map(function (p) {
        var hits = p.aspects.filter(function (a) { return a.type === 'กุม' || a.type === 'เล็ง' || a.type === 'ตรีโกณ' || a.natal === 'lagna'; })
          .map(function (a) { return a.type + name(a.natal); }).join(',');
        return p.name + 'จรราศี' + p.signTh + (p.house ? ' ภพ' + p.house.name : '') + (p.retrograde ? ' พักร์' : '') + (hits ? ' (' + hits + ')' : '');
      });
      out.push({ year: y, month: m, title: MONTHS[m - 1] + ' ' + (y + 543), text: parts.join('; ') });
      m++; if (m > 12) { m = 1; y++; }
    }
    return out;
  }

  // ── คำสั่งทำนาย ────────────────────────────────────────────────────────────

  var PERSONA =
    'คุณคือนักโหราศาสตร์ไทยประจำเว็บ My Tarot อ่านดวงตามคัมภีร์สุริยยาตร์ ' +
    'พูดเป็นผู้หญิง แทนตัวเองว่า "น้อง" เรียกผู้ถามว่า "คุณพี่" ลงท้าย ค่ะ/นะคะ น้ำเสียงเป็นกันเองแบบคนรุ่นใหม่ อบอุ่น ตรงไปตรงมา ' +
    'ห้ามเอ่ยชื่อตัวเอง ห้ามพูดถึงระบบ โปรแกรม หรือปัญญาประดิษฐ์ ' +
    'กฎสำคัญ: 1) ใช้เฉพาะตำแหน่งดาว ภพ มาตรฐานดาว และมุมที่ให้มาเท่านั้น ห้ามคิดตำแหน่งดาวเองและห้ามเปลี่ยนข้อมูล ' +
    '2) ทุกย่อหน้าต้องอ้างเหตุจากดวงจริงอย่างน้อยหนึ่งจุด เช่น "เพราะเสาร์อยู่ภพกดุมภะ" ' +
    '3) ห้ามใส่ตัวเลข วันที่ องศา หรืออายุในคำทำนาย ให้พูดเป็นช่วงเวลาแทน เช่น ต้นปี กลางปี ปลายปี (หน้าเว็บแสดงวันที่ให้แล้ว) ' +
    '4) ห้ามใช้ markdown ห้ามใช้เครื่องหมาย * หรือ # ห้ามใช้เลขไทย ' +
    '5) เรื่องสุขภาพให้พูดเป็นแนวทางดูแลตัวเอง ไม่วินิจฉัยโรค และไม่ฟันธงเรื่องความตายหรืออุบัติเหตุร้ายแรง ' +
    '6) ตอบโดยครอบแต่ละหัวข้อด้วยแท็ก XML ตามที่กำหนด ห้ามมีข้อความนอกแท็ก เขียนให้จบครบทุกแท็ก';

  var KINDS = {
    basic: {
      service: 'thai-astro-basic', cost: 10, label: 'พื้นดวงย่อ', historyType: 'โหราศาสตร์ไทย — พื้นดวงย่อ', max_tokens: 1200,
      sections: [['SELF', 'ตัวตนของคุณพี่'], ['STRONG', 'จุดเด่นที่ดวงให้มา'], ['WEAK', 'จุดที่ต้องระวัง'], ['ADVICE', 'คำแนะนำจากน้อง']],
      ask: 'อ่านพื้นดวงแบบย่อ แต่ละหัวข้อ 2-3 ประโยค กระชับ เน้นลัคนา ดาวเจ้าชะตา และดาวที่เด่นที่สุดในดวง'
    },
    full: {
      service: 'thai-astro', cost: 99, label: 'พื้นดวงฉบับเต็ม', historyType: 'โหราศาสตร์ไทย — พื้นดวงฉบับเต็ม', max_tokens: 12000,
      sections: [['SELF', 'ตัวตนและลัคนา'], ['STAR', 'ดาวเด่นและดาวที่ต้องดูแล'], ['WORK', 'การงาน'], ['MONEY', 'การเงิน'], ['LOVE', 'ความรักและครอบครัว'], ['HEALTH', 'สุขภาพ'], ['BARAMI', 'บารมีและผู้อุปถัมภ์'], ['LIFE', 'จังหวะชีวิต อดีต ปัจจุบัน อนาคต'], ['ADVICE', 'สิ่งที่ควรทำและควรเลี่ยง']],
      ask: 'อ่านพื้นดวงฉบับเต็ม ละเอียดและยาว แต่ละหัวข้อ 2-3 ย่อหน้า ไล่ให้ครบทั้ง 12 ภพผ่านหัวข้อที่เกี่ยวข้อง ภพที่ว่างให้อ่านจากเจ้าเรือน หัวข้อจังหวะชีวิตให้เล่าเป็นช่วงวัย (วัยเด็ก วัยเริ่มทำงาน วัยกลางคน วัยปลาย) โดยอิงดาวในดวงและดาวจรปัจจุบัน หัวข้อสุดท้ายให้เป็นข้อ ๆ สั้น ๆ คั่นด้วยการขึ้นบรรทัดใหม่'
    },
    transit: {
      service: 'thai-astro-transit', cost: 20, label: 'ดวงจรช่วงนี้', historyType: 'โหราศาสตร์ไทย — ดวงจรช่วงนี้', max_tokens: 2600,
      sections: [['NOW', 'ภาพรวมช่วงนี้'], ['WORK', 'การงานและการเงิน'], ['LOVE', 'ความรักและคนรอบตัว'], ['CARE', 'เรื่องที่ต้องระวัง'], ['ADVICE', 'ควรทำ ควรเลี่ยง']],
      ask: 'อ่านดวงจรช่วงหนึ่งถึงสามเดือนนี้ โดยดูดาวจรทำมุมกับดาวเดิมและภพที่ดาวจรเข้า ให้น้ำหนักพฤหัสบดี เสาร์ ราหู มากที่สุด มุมที่ระยะห่างน้อยคือแรง แต่ละหัวข้อ 1-2 ย่อหน้า'
    },
    year: {
      service: 'thai-astro-year', cost: 59, label: 'ดวงรายปี 12 เดือน', historyType: 'โหราศาสตร์ไทย — ดวงรายปี', max_tokens: 7000,
      sections: null, // สร้างตามเดือน
      ask: 'อ่านดวง 12 เดือนข้างหน้า เริ่มด้วยภาพรวมทั้งปี จากนั้นอ่านทีละเดือนตามข้อมูลดาวจรของเดือนนั้น เดือนละ 3-4 ประโยค บอกเรื่องเด่นของเดือน (งาน เงิน รัก หรือสุขภาพ) และสิ่งที่ควรทำหรือเลี่ยง เดือนที่ดาวย้ายภพให้เน้นเป็นพิเศษ ปิดท้ายด้วยช่วงที่ดีที่สุดและช่วงที่ต้องระวังที่สุดของปี'
    }
  };
  var MONTH_TAGS = ['MA', 'MB', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MI', 'MJ', 'MK', 'ML'];

  /** สร้างคำขอสำหรับ /api/claude: {service, max_tokens, system, user, sections:[[tag,title]], label, historyType} */
  function buildRequest(kind, natal, provinceName, now) {
    var k = KINDS[kind];
    now = now || thaiNow();
    var transit = A.transitChart(natal, now);
    var sections = k.sections, user = chartText(natal, provinceName) + '\n\n';
    if (kind === 'year') {
      var months = monthlyFacts(natal, now), events = timelineEvents(natal, now, 366);
      sections = [['OVERVIEW', 'ภาพรวมทั้งปี']].concat(months.map(function (m, i) { return [MONTH_TAGS[i], m.title]; })).concat([['BEST', 'ช่วงที่ดีที่สุดของปี'], ['CARE', 'ช่วงที่ต้องระวัง']]);
      user += transitText(transit, 'วันนี้') + '\n\n== ดาวจรรายเดือน (กลางเดือน) ==\n' + months.map(function (m, i) { return '[' + MONTH_TAGS[i] + '] ' + m.title + ': ' + m.text; }).join('\n');
      user += '\n\n== ดาวใหญ่ย้ายราศีในรอบปี ==\n' + (events.length ? events.map(function (e) { return '- ' + MONTHS[e.date.month - 1] + ': ' + name(e.body) + 'ย้ายจาก' + e.fromTh + 'เข้า' + e.toTh + (e.house ? ' ภพ' + e.house.name : ''); }).join('\n') : '- ไม่มี');
    } else if (kind === 'transit' || kind === 'full') {
      user += transitText(transit, 'วันนี้');
    }
    user += '\n\n== คำขอ ==\n' + k.ask + '\n\nรูปแบบคำตอบ (ใช้แท็กตามนี้ทุกแท็ก เรียงตามลำดับ):\n' + sections.map(function (s) { return '<' + s[0] + '>' + s[1] + '</' + s[0] + '>'; }).join('\n');
    return { service: k.service, max_tokens: k.max_tokens, system: PERSONA, user: user, sections: sections, label: k.label, historyType: k.historyType, cost: k.cost };
  }

  /** คำขอถามต่อจากคำทำนายเดิม */
  function buildFollowup(natal, provinceName, lastReading, question) {
    return {
      service: 'tarot_followup', max_tokens: 700,
      system: PERSONA.replace(/6\) .*$/, '6) ตอบสั้น 4-6 ประโยค ไม่ต้องใช้แท็ก ตอบจากดวงและคำทำนายเดิมเท่านั้น'),
      user: chartText(natal, provinceName) + '\n\n== คำทำนายเดิม ==\n' + lastReading + '\n\n== คำถามจากคุณพี่ ==\n' + question
    };
  }

  /** แยกข้อความตามแท็ก รองรับข้อความที่ยังสตรีมไม่จบ: {TAG: {text, done}} */
  function parseSections(text, sections) {
    var out = {};
    sections.forEach(function (s) {
      var open = '<' + s[0] + '>', close = '</' + s[0] + '>', i = text.indexOf(open);
      if (i < 0) return;
      var from = i + open.length, j = text.indexOf(close, from), done = j >= 0, body = done ? text.slice(from, j) : text.slice(from);
      if (!done) body = body.replace(/<\/?[A-Z_]*$/, ''); // ตัดแท็กที่กำลังพิมพ์ค้าง
      out[s[0]] = { text: body.replace(/^\s+|\s+$/g, ''), done: done };
    });
    return out;
  }
  /** ข้อความสำหรับบันทึกประวัติ: หัวข้อ + เนื้อหา ไม่มีแท็ก */
  function historyText(text, sections, header) {
    var p = parseSections(text, sections), L = header ? [header, ''] : [];
    sections.forEach(function (s) { if (p[s[0]] && p[s[0]].text) L.push('✦ ' + s[1], p[s[0]].text, ''); });
    return L.join('\n').replace(/\s+$/, '');
  }

  return {
    KINDS: KINDS, MONTHS: MONTHS, thaiNow: thaiNow, birthLine: birthLine, weekdayOf: weekdayOf, esc: esc,
    wheelSVG: wheelSVG, summaryHTML: summaryHTML, tableHTML: tableHTML, nakshatraHTML: nakshatraHTML, transitHTML: transitHTML,
    timelineEvents: timelineEvents, timelineHTML: timelineHTML, chartText: chartText, transitText: transitText,
    monthlyFacts: monthlyFacts, buildRequest: buildRequest, buildFollowup: buildFollowup, parseSections: parseSections, historyText: historyText
  };
});
