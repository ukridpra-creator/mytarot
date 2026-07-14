// hd-calc.js
// Human Design Calculator
// แปลงตำแหน่งดาว (longitude degree 0-360) → Gates → Centers → Type, Authority, Profile, Channels

// ── GATE WHEEL MAPPING ──
// ลำดับ Gates ตาม Rave Mandala (เรียงตาม degree 0° Aries ขึ้นไป)
// แต่ละ entry: [startDeg, gate]
// 360 / 64 = 5.625 degrees per gate
// Source: Jovian Archive / Human Design System

const HD_GATE_WHEEL = [
  [0.000, 41],  [5.625, 19],  [11.250, 13], [16.875, 49], [22.500, 30],
  [28.125, 55], [33.750, 37], [39.375, 63], [45.000, 22], [50.625, 36],
  [56.250, 25], [61.875, 17], [67.500, 21], [73.125, 51], [78.750, 42],
  [84.375, 3],  [90.000, 27], [95.625, 24], [101.250, 2], [106.875, 23],
  [112.500, 8], [118.125, 20],[123.750, 16],[129.375, 35],[135.000, 45],
  [140.625, 12],[146.250, 15],[151.875, 52],[157.500, 39],[163.125, 53],
  [168.750, 62],[174.375, 56],[180.000, 31],[185.625, 33],[191.250, 7],
  [196.875, 4], [202.500, 29],[208.125, 59],[213.750, 40],[219.375, 64],
  [225.000, 47],[230.625, 6], [236.250, 46],[241.875, 18],[247.500, 48],
  [253.125, 57],[258.750, 32],[264.375, 50],[270.000, 28],[275.625, 44],
  [281.250, 1], [286.875, 43],[292.500, 14],[298.125, 34],[303.750, 9],
  [309.375, 5], [315.000, 26],[320.625, 11],[326.250, 10],[331.875, 58],
  [337.500, 38],[343.125, 54],[348.750, 61],[354.375, 60],
];

// ── GATE → CENTER MAPPING ──
const GATE_TO_CENTER = {
  // Head
  64: 'head', 61: 'head', 63: 'head',
  // Ajna
  47: 'ajna', 24: 'ajna', 4: 'ajna', 17: 'ajna', 43: 'ajna', 11: 'ajna',
  // Throat
  62: 'throat', 23: 'throat', 56: 'throat', 35: 'throat', 12: 'throat',
  45: 'throat', 33: 'throat', 8: 'throat', 31: 'throat', 20: 'throat',
  16: 'throat',
  // G Center
  13: 'g_center', 7: 'g_center', 1: 'g_center', 25: 'g_center',
  46: 'g_center', 2: 'g_center', 15: 'g_center', 10: 'g_center',
  // Heart/Ego
  21: 'heart', 40: 'heart', 26: 'heart', 51: 'heart',
  // Splenic
  48: 'splenic', 57: 'splenic', 44: 'splenic', 50: 'splenic',
  32: 'splenic', 28: 'splenic', 18: 'splenic',
  // Solar Plexus
  36: 'solar_plexus', 22: 'solar_plexus', 37: 'solar_plexus', 6: 'solar_plexus',
  49: 'solar_plexus', 55: 'solar_plexus', 30: 'solar_plexus', 41: 'solar_plexus',
  39: 'solar_plexus',
  // Sacral
  5: 'sacral', 14: 'sacral', 29: 'sacral', 59: 'sacral', 9: 'sacral',
  3: 'sacral', 42: 'sacral', 27: 'sacral', 34: 'sacral',
  // Root
  58: 'root', 38: 'root', 54: 'root', 53: 'root', 60: 'root',
  52: 'root', 19: 'root', 39: 'root', 41: 'root',
};

// ── CHANNEL PAIRS ──
// [gate1, gate2, centerId1, centerId2, channelId]
const CHANNEL_PAIRS = [
  [64, 47, 'head', 'ajna', 'ch_47_64'],
  [61, 24, 'head', 'ajna', 'ch_24_61'],
  [63, 4,  'head', 'ajna', 'ch_4_63'],
  [17, 62, 'ajna', 'throat', 'ch_17_62'],
  [43, 23, 'ajna', 'throat', 'ch_23_43'],
  [11, 56, 'ajna', 'throat', 'ch_11_56'],
  [47, 64, 'ajna', 'head', 'ch_47_64'],
  [4,  63, 'ajna', 'head', 'ch_4_63'],
  [24, 61, 'ajna', 'head', 'ch_24_61'],
  [12, 22, 'throat', 'solar_plexus', 'ch_12_22'],
  [35, 36, 'throat', 'solar_plexus', 'ch_35_36'],
  [8,  1,  'throat', 'g_center', 'ch_1_8'],
  [31, 7,  'throat', 'g_center', 'ch_7_31'],
  [33, 13, 'throat', 'g_center', 'ch_13_33'],
  [20, 10, 'throat', 'g_center', 'ch_10_20'],
  [20, 34, 'throat', 'sacral', 'ch_20_34'],
  [16, 48, 'throat', 'splenic', 'ch_16_48'],
  [45, 21, 'throat', 'heart', 'ch_21_45'],
  [2,  14, 'g_center', 'sacral', 'ch_2_14'],
  [46, 29, 'g_center', 'sacral', 'ch_29_46'],
  [15, 5,  'g_center', 'sacral', 'ch_5_15'],
  [10, 20, 'g_center', 'throat', 'ch_10_20'],
  [25, 51, 'g_center', 'heart', 'ch_25_51'],
  [21, 45, 'heart', 'throat', 'ch_21_45'],
  [26, 44, 'heart', 'splenic', 'ch_26_44'],
  [40, 37, 'heart', 'solar_plexus', 'ch_37_40'],
  [51, 25, 'heart', 'g_center', 'ch_25_51'],
  [57, 34, 'splenic', 'sacral', 'ch_34_57'],
  [57, 20, 'splenic', 'throat', 'ch_16_48'],
  [44, 26, 'splenic', 'heart', 'ch_26_44'],
  [50, 27, 'splenic', 'sacral', 'ch_27_50'],
  [32, 54, 'splenic', 'root', 'ch_32_54'],
  [28, 38, 'splenic', 'root', 'ch_28_38'],
  [18, 58, 'splenic', 'root', 'ch_18_58'],
  [48, 16, 'splenic', 'throat', 'ch_16_48'],
  [36, 35, 'solar_plexus', 'throat', 'ch_35_36'],
  [22, 12, 'solar_plexus', 'throat', 'ch_12_22'],
  [37, 40, 'solar_plexus', 'heart', 'ch_37_40'],
  [6,  59, 'solar_plexus', 'sacral', 'ch_6_59'],
  [49, 19, 'solar_plexus', 'root', 'ch_19_49'],
  [55, 39, 'solar_plexus', 'root', 'ch_39_55'],
  [30, 41, 'solar_plexus', 'root', 'ch_30_41'],
  [41, 30, 'root', 'solar_plexus', 'ch_30_41'],
  [5,  15, 'sacral', 'g_center', 'ch_5_15'],
  [14, 2,  'sacral', 'g_center', 'ch_2_14'],
  [34, 20, 'sacral', 'throat', 'ch_20_34'],
  [34, 57, 'sacral', 'splenic', 'ch_34_57'],
  [59, 6,  'sacral', 'solar_plexus', 'ch_6_59'],
  [27, 50, 'sacral', 'splenic', 'ch_27_50'],
  [3,  60, 'sacral', 'root', 'ch_3_60'],
  [9,  52, 'sacral', 'root', 'ch_9_52'],
  [29, 46, 'sacral', 'g_center', 'ch_29_46'],
  [42, 53, 'sacral', 'root', 'ch_42_53'],
  [60, 3,  'root', 'sacral', 'ch_3_60'],
  [52, 9,  'root', 'sacral', 'ch_9_52'],
  [54, 32, 'root', 'splenic', 'ch_32_54'],
  [38, 28, 'root', 'splenic', 'ch_28_38'],
  [58, 18, 'root', 'splenic', 'ch_18_58'],
  [53, 42, 'root', 'sacral', 'ch_42_53'],
  [19, 49, 'root', 'solar_plexus', 'ch_19_49'],
  [39, 55, 'root', 'solar_plexus', 'ch_39_55'],
];

// ── PROFILE LINE LOOKUP ──
// profile ขึ้นกับ gate line (1-6) ของ Sun conscious และ Sun design
// line = Math.floor((degree % 5.625) / 0.9375) + 1
// Profile = conscious_line / unconscious_line

const PROFILE_MAP = {
  '1/3': '1_3', '1/4': '1_4',
  '2/4': '2_4', '2/5': '2_5',
  '3/5': '3_5', '3/6': '3_6',
  '4/6': '4_6', '4/1': '4_1',
  '5/1': '5_1', '5/2': '5_2',
  '6/2': '6_2', '6/3': '6_3',
};

// ── CORE FUNCTIONS ──

// แปลง longitude → Gate number
function degreeToGate(longitude) {
  // normalize to 0-360
  const deg = ((longitude % 360) + 360) % 360;
  for (let i = HD_GATE_WHEEL.length - 1; i >= 0; i--) {
    if (deg >= HD_GATE_WHEEL[i][0]) return HD_GATE_WHEEL[i][1];
  }
  return HD_GATE_WHEEL[0][1];
}

// แปลง longitude → Line (1-6)
function degreeToLine(longitude) {
  const deg = ((longitude % 360) + 360) % 360;
  const posInGate = deg % 5.625;
  return Math.floor(posInGate / 0.9375) + 1;
}

// คำนวณ defined centers จาก active gates
function calcDefinedCenters(allGates) {
  const gateSet = new Set(allGates);
  const definedCenters = new Set();

  // เช็คแต่ละ channel pair ว่า active ทั้งคู่ไหม
  const checkedChannels = new Set();
  CHANNEL_PAIRS.forEach(([g1, g2, c1, c2, chId]) => {
    if (checkedChannels.has(chId)) return;
    if (gateSet.has(g1) && gateSet.has(g2)) {
      definedCenters.add(c1);
      definedCenters.add(c2);
      checkedChannels.add(chId);
    }
  });

  return [...definedCenters];
}

// คำนวณ defined channels
function calcDefinedChannels(allGates) {
  const gateSet = new Set(allGates);
  const definedChannels = new Set();
  const checkedChannels = new Set();

  CHANNEL_PAIRS.forEach(([g1, g2, c1, c2, chId]) => {
    if (checkedChannels.has(chId)) return;
    if (gateSet.has(g1) && gateSet.has(g2)) {
      definedChannels.add(chId);
      checkedChannels.add(chId);
    }
  });

  return [...definedChannels];
}

// คำนวณ Type จาก defined centers
function calcType(definedCenters) {
  const dc = new Set(definedCenters);
  const hasSacral = dc.has('sacral');
  const hasThroat = dc.has('throat');

  // เช็ค motor connected to throat
  const motors = ['sacral', 'solar_plexus', 'heart', 'root'];
  const motorToThroat = CHANNEL_PAIRS.some(([g1, g2, c1, c2]) =>
    ((motors.includes(c1) && c2 === 'throat') || (motors.includes(c2) && c1 === 'throat')) &&
    dc.has(c1) && dc.has(c2)
  );

  if (hasSacral && motorToThroat) return 'manifesting_generator';
  if (hasSacral) return 'generator';
  if (!hasSacral && motorToThroat) return 'manifestor';
  if (!hasSacral && !hasThroat) return 'projector';
  // Reflector = ไม่มี defined centers เลย
  if (definedCenters.length === 0) return 'reflector';
  return 'projector';
}

// คำนวณ Authority จาก defined centers (ลำดับความสำคัญ)
function calcAuthority(definedCenters, type) {
  const dc = new Set(definedCenters);
  if (type === 'reflector') return 'lunar';
  if (dc.has('solar_plexus')) return 'emotional';
  if (dc.has('sacral')) return 'sacral';
  if (dc.has('splenic')) return 'splenic';
  if (dc.has('heart') && (type === 'manifestor')) return 'ego';
  if (dc.has('g_center')) return 'self_projected';
  return 'mental';
}

// คำนวณ Definition type
function calcDefinition(definedCenters) {
  const count = definedCenters.length;
  if (count === 0) return 'No Definition';
  if (count <= 3) return 'Single Definition';
  if (count <= 6) return 'Split Definition';
  return 'Triple Split Definition';
}

// คำนวณ Profile จาก conscious + design sun line
function calcProfile(consciousSunLine, designSunLine) {
  const key = `${consciousSunLine}/${designSunLine}`;
  return PROFILE_MAP[key] || `${consciousSunLine}_${designSunLine}`;
}

// ── MAIN CALCULATION FUNCTION ──
// รับ planet positions จาก Prokerala API
// Input format:
// {
//   conscious: { sun: 182.5, earth: 2.5, moon: 45.3, northNode: 120.1,
//                mercury: 200.1, venus: 150.2, mars: 300.4,
//                jupiter: 80.2, saturn: 220.5, uranus: 310.1,
//                neptune: 350.2, pluto: 270.8 },
//   design: { ...same planets... } // 88 days before birth
// }
function calculateHumanDesign(planetPositions) {
  const { conscious, design } = planetPositions;

  // แปลงตำแหน่งดาวทุกดวง → Gates
  const planets = ['sun', 'earth', 'moon', 'northNode', 'mercury', 'venus',
                   'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  const consciousGates = {};
  const designGates = {};

  planets.forEach(p => {
    if (conscious[p] !== undefined) {
      consciousGates[p] = {
        gate: degreeToGate(conscious[p]),
        line: degreeToLine(conscious[p]),
        degree: conscious[p]
      };
    }
    if (design[p] !== undefined) {
      designGates[p] = {
        gate: degreeToGate(design[p]),
        line: degreeToLine(design[p]),
        degree: design[p]
      };
    }
  });

  // รวม gates ทั้งหมด
  const allGates = [
    ...Object.values(consciousGates).map(g => g.gate),
    ...Object.values(designGates).map(g => g.gate)
  ];

  // คำนวณ defined centers + channels
  const definedCenters = calcDefinedCenters(allGates);
  const undefinedCenters = ['head','ajna','throat','g_center','heart',
    'splenic','solar_plexus','sacral','root'].filter(c => !definedCenters.includes(c));
  const channels = calcDefinedChannels(allGates);

  // คำนวณ Type, Authority, Definition
  const type = calcType(definedCenters);
  const authority = calcAuthority(definedCenters, type);
  const definition = calcDefinition(definedCenters);

  // คำนวณ Profile จาก conscious sun + design sun
  const consciousSunLine = consciousGates.sun?.line || 1;
  const designSunLine = designGates.sun?.line || 3;
  const profile = calcProfile(consciousSunLine, designSunLine);

  // Incarnation Cross (simplified: conscious sun + earth + design sun + earth)
  const incCross = `${consciousGates.sun?.gate || '?'} / ${consciousGates.earth?.gate || '?'} | ${designGates.sun?.gate || '?'} / ${designGates.earth?.gate || '?'}`;

  return {
    type,
    authority,
    profile,
    definition,
    definedCenters,
    undefinedCenters,
    channels,
    incarnationCross: incCross,
    consciousGates,
    designGates,
    allGates: [...new Set(allGates)],
    _raw: { conscious, design }
  };
}

// ── PROKERALA API INTEGRATION ──
// เรียก Prokerala planet positions แล้วแปลงเป็น HD data
async function fetchHDFromProkerala(day, month, year, hour, min, lat, lon, apiKey) {
  // คำนวณวันออกแบบ (88 วันก่อนเกิด)
  const birthDate = new Date(year, month - 1, day, hour, min);
  const designDate = new Date(birthDate.getTime() - (88 * 24 * 60 * 60 * 1000));

  // Format dates for Prokerala
  const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const formatTime = (d) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`;

  // เรียก Prokerala Western Planets endpoint
  const baseUrl = 'https://api.prokerala.com/v2/astrology/western-planets';
  const params = new URLSearchParams({
    ayanamsa: 1, // Lahiri
    coordinates: `${lat},${lon}`,
    la: 'en'
  });

  async function getPlanets(date, time) {
    const p = new URLSearchParams(params);
    p.set('datetime', `${date}T${time}`);
    const res = await fetch(`${baseUrl}?${p}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await res.json();
    return data;
  }

  const [consciousRaw, designRaw] = await Promise.all([
    getPlanets(formatDate(birthDate), formatTime(birthDate)),
    getPlanets(formatDate(designDate), formatTime(designDate))
  ]);

  // แปลง Prokerala response → longitude object
  function parsePlanets(rawData) {
    const planets = {};
    const bodies = rawData?.data?.bodies || rawData?.data?.planets || [];
    bodies.forEach(b => {
      const name = (b.name || b.body || '').toLowerCase();
      const lon = b.longitude || b.position?.longitude || 0;
      if (name === 'sun') planets.sun = lon;
      else if (name === 'moon') planets.moon = lon;
      else if (name === 'mercury') planets.mercury = lon;
      else if (name === 'venus') planets.venus = lon;
      else if (name === 'mars') planets.mars = lon;
      else if (name === 'jupiter') planets.jupiter = lon;
      else if (name === 'saturn') planets.saturn = lon;
      else if (name === 'uranus') planets.uranus = lon;
      else if (name === 'neptune') planets.neptune = lon;
      else if (name === 'pluto') planets.pluto = lon;
      else if (name.includes('north node') || name === 'rahu') planets.northNode = lon;
    });
    // Earth = Sun + 180
    if (planets.sun !== undefined) planets.earth = (planets.sun + 180) % 360;
    return planets;
  }

  const conscious = parsePlanets(consciousRaw);
  const design = parsePlanets(designRaw);

  return calculateHumanDesign({ conscious, design });
}

// ── CITY → LAT/LON ──
// lookup เมืองไทยที่ใช้บ่อย
const THAI_CITIES = {
  'กรุงเทพ': [13.7563, 100.5018],
  'กรุงเทพมหานคร': [13.7563, 100.5018],
  'bangkok': [13.7563, 100.5018],
  'เชียงใหม่': [18.7883, 98.9853],
  'เชียงราย': [19.9071, 99.8308],
  'ขอนแก่น': [16.4419, 102.8360],
  'อุดรธานี': [17.4138, 102.7872],
  'นครราชสีมา': [14.9799, 102.0978],
  'โคราช': [14.9799, 102.0978],
  'อยุธยา': [14.3532, 100.5643],
  'พัทยา': [12.9236, 100.8825],
  'ภูเก็ต': [7.9519, 98.3381],
  'หาดใหญ่': [7.0085, 100.4749],
  'สงขลา': [7.1756, 100.6145],
  'นครศรีธรรมราช': [8.4304, 99.9632],
  'สุราษฎร์ธานี': [9.1382, 99.3214],
  'กระบี่': [8.0863, 98.9063],
  'สมุย': [9.5280, 100.0613],
  'ระยอง': [12.6814, 101.2816],
  'ชลบุรี': [13.3611, 100.9847],
  'ลำปาง': [18.2888, 99.4921],
  'แม่ฮ่องสอน': [19.3020, 97.9654],
  'พิษณุโลก': [16.8211, 100.2659],
  'นครสวรรค์': [15.7030, 100.1368],
  'กาญจนบุรี': [14.0023, 99.5471],
  'ราชบุรี': [13.5282, 99.8133],
  'เพชรบุรี': [13.1119, 99.9390],
  'ประจวบคีรีขันธ์': [11.8126, 99.7957],
  'ชุมพร': [10.4930, 99.1800],
  'นครปฐม': [13.8196, 100.0645],
  'สมุทรสาคร': [13.5475, 100.2747],
  'นนทบุรี': [13.8621, 100.5144],
  'ปทุมธานี': [14.0208, 100.5250],
  'สมุทรปราการ': [13.5991, 100.5998],
};

function getCityCoords(cityName) {
  const key = cityName.trim().toLowerCase();
  for (const [name, coords] of Object.entries(THAI_CITIES)) {
    if (name.toLowerCase() === key) return coords;
  }
  // default กรุงเทพ
  return [13.7563, 100.5018];
}
