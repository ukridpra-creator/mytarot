export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { year, month, day, hour, minute, lat, lng } = req.body;

  // 1. ลอง FreeAstroAPI ก่อน
  try {
    const astroRes = await fetch('https://api.freeastroapi.com/api/v1/natal/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.FREEASTRO_API_KEY,
      },
      body: JSON.stringify({
        name: 'User', year, month, day, hour, minute,
        lat, lng, tz_str: 'Asia/Bangkok'
      })
    });
    const data = await astroRes.json();
    if (data.planets) return res.status(200).json({ source: 'freeastro', data });
  } catch(e) {}

  // 2. ลอง Prokerala สำรอง
  try {
    const tokenRes = await fetch('https://api.prokerala.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.PROKERALA_CLIENT_ID,
        client_secret: process.env.PROKERALA_CLIENT_SECRET,
      })
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    if (token) {
      const datetime = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00+07:00`;
      const astroRes = await fetch(
        `https://api.prokerala.com/v2/astrology/planet-position?ayanamsa=0&coordinates=${lat},${lng}&datetime=${encodeURIComponent(datetime)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await astroRes.json();
      if (data.data) return res.status(200).json({ source: 'prokerala', data });
    }
  } catch(e) {}

  // 3. Claude คำนวณเอง
  return res.status(200).json({
    source: 'claude',
    data: { year, month, day, hour, minute, lat, lng }
  });
}