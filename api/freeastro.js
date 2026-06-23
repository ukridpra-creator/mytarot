export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { year, month, day, hour, minute, lat, lng, tz_str } = req.body;

  try {
    const astroRes = await fetch('https://api.freeastroapi.com/api/v1/natal/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.FREEASTRO_API_KEY,
      },
      body: JSON.stringify({
        name: 'User',
        year, month, day, hour, minute,
        lat, lng,
        tz_str: tz_str || 'Asia/Bangkok'
      })
    });

    const data = await astroRes.json();
    res.status(200).json(data);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}