// pages/api/lagna.js
// คำนวณลัคนาด้วย Prokerala API
// รับ: { year, month, day, hour, minute, lat, lon } (CE, UTC+7)
// ส่งกลับ: { sign, deg, min, signIdx }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') return res.status(405).end();

  let body;
  try {
    body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
      req.on('error', reject);
    });
  } catch(e) {
    return res.status(400).json({ error: 'invalid_body' });
  }

  const { year, month, day, hour, minute, lat, lon } = body;
  if (!year || !month || !day) return res.status(400).json({ error: 'missing_params' });

  try {
    // Step 1: Get Prokerala token
    const tokenRes = await fetch('https://api.prokerala.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.PROKERALA_CLIENT_ID,
        client_secret: process.env.PROKERALA_CLIENT_SECRET,
      }),
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    if (!token) throw new Error('no_token');

    // Step 2: Format datetime UTC+7
    const h  = hour   || 0;
    const mn = minute || 0;
    const datetime = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(mn).padStart(2,'0')}:00+07:00`;

    // lat/lon default กรุงเทพ
    const latitude  = lat || 13.752555;
    const longitude = lon || 100.494066;
    const coords    = `${latitude},${longitude}`;

    // Step 3: Call birth-details
    const params = new URLSearchParams({
      ayanamsa: 1,  // Lahiri
      coordinates: coords,
      datetime: datetime,
    });

    const astroRes = await fetch(
      `https://api.prokerala.com/v2/astrology/birth-details?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const astroData = await astroRes.json();

    if (!astroData.data) throw new Error('no_data');

    // Parse ascendant
    const asc = astroData.data.ascendant;
    // Prokerala returns: { id, name, longitude, ... }
    // longitude in degrees (sidereal)

    const SIGNS = ['เมษ','พฤษภ','มิถุน','กรกฏ','สิงห์','กันย์','ตุลย์','พิจิก','ธนู','มกร','กุมภ์','มีน'];

    let signIdx, signName, deg, min;

    if (asc && asc.longitude !== undefined) {
      const lon_deg = asc.longitude;
      signIdx  = Math.floor(lon_deg / 30);
      const d  = lon_deg % 30;
      deg  = Math.floor(d);
      min  = Math.floor((d - deg) * 60);
      signName = SIGNS[signIdx] || asc.name || '?';
    } else if (asc && asc.name) {
      // fallback: use name
      signName = asc.name;
      signIdx  = SIGNS.indexOf(signName);
      deg = 0; min = 0;
    } else {
      throw new Error('no_ascendant');
    }

    return res.status(200).json({
      sign:     signName,
      signIdx:  signIdx,
      deg:      deg,
      min:      min,
      raw:      asc,
    });

  } catch(e) {
    console.error('lagna error:', e);
    return res.status(500).json({ error: e.message || 'server_error' });
  }
}