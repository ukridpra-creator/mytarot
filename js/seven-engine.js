// seven-engine.js
// คำนวณเลข 7 ตัว 9 ฐาน โหราศาสตร์ไทย
// ต้องโหลด thai-lunar.js ก่อนค่ะ

var SEVEN_DAY_NUM = {0:1,1:2,2:3,3:4,4:5,5:6,6:7};
var SEVEN_DAY_NAME = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
var SEVEN_PLANET = ['','อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
var SEVEN_NAKSAT = ['','ชวด','ฉลู','ขาล','เถาะ','มะโรง','มะเส็ง','มะเมีย','มะแม','วอก','ระกา','จอ','กุน'];
var SEVEN_PHOP = ['อัตตะ','หินะ','ธนัง','ปัตตา','มาตา','โภคา','มัชฌิมา'];

function sevenMod7(n) { while(n>7)n-=7; while(n<1)n+=7; return n; }

function calcSevenBase(dateStr, hour) {
  // ถ้าเกิดก่อน 06.00 น. ถือเป็นวันก่อนหน้า
  if(hour !== undefined && hour < 6) {
    var d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    dateStr = d.toISOString().slice(0,10);
  }

  var jsDay = new Date(dateStr + 'T12:00:00').getDay();
  var dayNum = SEVEN_DAY_NUM[jsDay];

  // จันทรคติ
  var lunar = getThaiLunarDate(dateStr);
  var lunarMonth = lunar.month;
  var yearAD = parseInt(dateStr.slice(0,4));

  // ปีนักษัตร (เปลี่ยนปีที่ขึ้น 1 ค่ำ เดือน 5)
  var y = yearAD;
  if(lunarMonth < 5) y--;
  var nakIdx = ((y - 1984) % 12 + 12) % 12 + 1; // 1984=ชวด

  // เดือน >7 ลบ 7
  var mn = lunarMonth > 7 ? lunarMonth - 7 : lunarMonth;

  // ─── คำนวณ 9 ฐาน ───
  var b1=[],b2=[],b3=[];
  for(var i=0;i<7;i++){
    b1.push(sevenMod7(dayNum+i));
    b2.push(sevenMod7(mn+i));
    b3.push(sevenMod7(nakIdx+i));
  }

  var b4=[]; for(var i=0;i<7;i++) b4.push(b1[i]+b2[i]+b3[i]);
  var b5=b4.map(function(n){return sevenMod7(n);});
  var b6=b5.map(function(n){return sevenMod7(n*2);});
  var b7=b6.map(function(n){return sevenMod7(n*2);});

  // ฐาน8: b5[0] เดินตาม b7 (offset = b5[0] - b7[0])
  var offset8 = b5[0] - b7[0];
  var b8=b7.map(function(n){return sevenMod7(n+offset8);});

  // ฐาน9: เรียง b5 ตาม b7 ascending
  var pairs=b7.map(function(v,i){return{v7:v,v5:b5[i]};})
              .sort(function(a,b){return a.v7-b.v7;});
  var b9=pairs.map(function(x){return x.v5;});

  return {
    dateStr:   dateStr,
    dayNum:    dayNum,
    dayName:   SEVEN_DAY_NAME[jsDay],
    planetName:SEVEN_PLANET[dayNum],
    lunarMonth:lunarMonth,
    lunarDay:  lunar.day,
    lunarWaxing:lunar.waxing,
    lunarText: lunar.text,
    nakIdx:    nakIdx,
    nakName:   SEVEN_NAKSAT[nakIdx],
    yearBE:    yearAD + 543,
    bases:     [b1,b2,b3,b4,b5,b6,b7,b8,b9]
  };
}
