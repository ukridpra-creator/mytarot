export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { year, month, day, hour, minute, lat, lng } = req.body;

  try {
    const astroRes = await fetch('https://api.freeastroapi.com/api/v2/vedic/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.FREEASTRO_API_KEY,
      },
      body: JSON.stringify({
        name: 'User',
        year, month, day, hour, minute,
        lat: lat || 13.7563,
        lng: lng || 100.5018,
        tz_str: 'Asia/Bangkok'
      })
    });

    const data = await astroRes.json();
    if (data.planets || data.ascendant) {
      return res.status(200).json({ source: 'vedic', data });
    }

    return res.status(200).json({ source: 'claude', data: { year, month, day, hour, minute } });

  } catch(e) {
    return res.status(200).json({ source: 'claude', data: { year, month, day, hour, minute } });
  }
}