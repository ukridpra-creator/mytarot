// decks-config.js
// ทะเบียนกลางของทุกสำรับไพ่ในเว็บ — ใช้โดย collection.html และ collections.html
// แต่ละสำรับมีโครงสร้างข้อมูลต่างกัน ไฟล์นี้ทำหน้าที่ "ครอบ" ให้เข้าถึงแบบเดียวกันหมด
//
// ต้องโหลดสคริปต์ data ของแต่ละสำรับ (ตามใน `scripts`) ก่อนเรียกใช้ getCards()

var DECKS_CONFIG = {

  dragon: {
    key: 'dragon',
    label: 'เส้นทางแห่งมังกร',
    icon: '🐉',
    accent: '#d4af37',
    pageUrl: 'dragon.html',
    scripts: ['../js/dragon-data.js'],
    getCards: function () { return window.DRAGON_CARDS || []; },
    imgUrl: function (c) { return '../images/dragon/' + c.img; },
    back: '../images/dragon/backdragon.png',
    name: function (c) { return c.nameTH; },
    sub: function (c) { return c.nameEN; },
    sections: function (c) { return [['✦ ความหมาย', c.meaning], ['🪶 ข้อความ', c.message]]; },
    category: function (c) { return c.suit; },
    categoryMeta: {
      fire:  { label: 'ไฟ', icon: '🔥' },
      water: { label: 'น้ำ', icon: '🌊' },
      wind:  { label: 'ลม', icon: '🌪️' },
      earth: { label: 'ดิน', icon: '🌳' }
    }
  },

  han: {
    key: 'han',
    label: 'รอยจารึกแห่งโชซอน',
    icon: '🌸',
    accent: '#9b7dc0',
    pageUrl: 'han-oracle.html',
    scripts: ['../js/han-data.js'],
    getCards: function () { return window.ALL_CARDS || []; },
    imgUrl: function (c) { return '../images/han/' + c.id + '.png'; },
    back: '../images/han/back.png',
    name: function (c) { return c.name; },
    sub: function () { return ''; },
    sections: function (c) { return [['✦ ความหมาย', c.kw]]; },
    category: null
  },

  nature: {
    key: 'nature',
    label: 'รหัสลับแห่งผืนดิน',
    icon: '🌿',
    accent: '#10b981',
    pageUrl: 'oracle-nature.html',
    scripts: ['../js/nature-data.js'],
    getCards: function () { return window.NATURE_CARDS || []; },
    imgUrl: function (c) { return c.img; },
    back: '../images/nature/backf.png',
    name: function (c) { return c.name; },
    sub: function () { return ''; },
    sections: function (c) { return [['✦ ความหมาย', c.meaning]]; },
    category: function (c) { return c.id.replace(/[0-9]/g, ''); },
    categoryMeta: {
      c: { label: 'แก่นแท้', icon: '🌱' },
      s: { label: 'เงามืด', icon: '🌑' },
      a: { label: 'แนวทาง', icon: '🎯' }
    }
  },

  angle: {
    key: 'angle',
    label: 'คำอวยพรแห่งทวยเทพ',
    icon: '✨',
    accent: '#d4af37',
    pageUrl: 'oracle-angle.html',
    scripts: ['../js/oracle-angle-data.js'],
    getCards: function () { return window.ANGLE_ORACLE || []; },
    imgUrl: function (c) { return '../images/angle/' + c.id + '.png'; },
    back: '../images/angle/aback.png',
    name: function (c) { return c.name; },
    sub: function (c) { return c.title || ''; },
    sections: function (c) { return [['🙏 พร', c.blessing], ['🪶 ข้อความ', c.message]]; },
    category: null
  },

  demon: {
    key: 'demon',
    label: 'เสียงกระซิบจากปีศาจ',
    icon: '😈',
    accent: '#6b21a8',
    pageUrl: 'oracle-demon.html',
    scripts: ['../js/demon-data.js'],
    getCards: function () { return window.demonCards || []; },
    imgUrl: function (c) { return '../images/demon/' + c.id + '.png'; },
    back: '../images/demon/backdemon.png',
    name: function (c) { return c.name; },
    sub: function () { return ''; },
    sections: function (c) { return [['⚠️ คำเตือน', c.warning], ['🗣️ ข้อความ', c.message]]; },
    category: null
  },

  dream: {
    key: 'dream',
    label: 'พรแห่งนิทรา',
    icon: '🌙',
    accent: '#818cf8',
    pageUrl: 'oracle-dream.html',
    scripts: ['../js/oracle-dream-data.js'],
    getCards: function () { return window.DREAM_CARDS || []; },
    imgUrl: function (c) { return '../images/dream-oracle/' + c.id + '.png'; },
    back: '../images/dream-oracle/dback.png',
    name: function (c) { return c.name; },
    sub: function (c) { return c.category || ''; },
    sections: function (c) {
      return [['🌙 ความฝัน', c.dream], ['🧠 จิตวิทยา', c.psychology], ['⚠️ คำเตือน', c.warning], ['💭 ข้อความ', c.message]];
    },
    category: function (c) { return c.category; }
  },

  hindu: {
    key: 'hindu',
    label: 'โอมมหาเทวา',
    icon: '🪔',
    accent: '#fb923c',
    pageUrl: 'hindu-oracle.html',
    scripts: ['../js/oracle-hindu-data.js'],
    getCards: function () {
      var H = window.HINDU_ORACLE;
      if (!H) return [];
      return [].concat(
        (H.deities || []).map(function (c) { return Object.assign({}, c, { type: 'deity' }); }),
        (H.weapons || []).map(function (c) { return Object.assign({}, c, { type: 'weapon' }); }),
        (H.vahanas || []).map(function (c) { return Object.assign({}, c, { type: 'vahana' }); })
      );
    },
    imgUrl: function (c) { return '../images/hindu/' + c.id + '.png'; },
    back: '../images/hindu/bhindu.png',
    name: function (c) { return c.name; },
    sub: function () { return ''; },
    sections: function (c) { return [['✦ ความหมาย', c.meaning]]; },
    category: function (c) { return c.type; },
    categoryMeta: {
      deity:  { label: 'เทพ', icon: '🕉️' },
      weapon: { label: 'อาวุธ', icon: '⚔️' },
      vahana: { label: 'พาหนะ', icon: '🐘' }
    }
  },

  cosmic: {
    key: 'cosmic',
    label: 'พลังแห่งจักรวาล',
    icon: '🌌',
    accent: '#a855f7',
    pageUrl: 'oracle-cosmic.html',
    scripts: ['../js/cosmic-data.js'],
    getCards: function () {
      return [].concat(window.PLANET_CARDS || [], window.EVENT_CARDS || [], window.CONCEPT_CARDS || []);
    },
    imgUrl: function (c) { return c.img; },
    back: '../images/cosmic/back.png',
    name: function (c) { return c.name; },
    sub: function () { return ''; },
    sections: function (c) { return [['✦ ความหมาย', c.meaning]]; },
    category: function (c) { return c.deck; },
    categoryMeta: {
      Planet:  { label: 'ดาวเคราะห์', icon: '🪐' },
      Event:   { label: 'เหตุการณ์', icon: '☄️' },
      Concept: { label: 'แนวคิด', icon: '♾️' }
    }
  }

};

// ลำดับที่จะโชว์ในหน้า hub
var DECKS_ORDER = ['dragon', 'han', 'nature', 'angle', 'demon', 'dream', 'hindu', 'cosmic'];