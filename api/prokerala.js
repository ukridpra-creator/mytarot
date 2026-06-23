export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { year, month, day, hour, minute, lat, lng } = req.body;

  // 1. FreeAstroAPI
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

  // 2. Claude fallback
  return res.status(200).json({
    source: 'claude',
    data: { year, month, day, hour, minute, lat, lng }
  });
}