export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'unauthorized' });
  try { await getAuth().verifyIdToken(idToken); }
  catch (e) { return res.status(401).json({ error: 'invalid_token' }); }

  const { year, month, day, hour, minute, lat, lng, city, sex } = req.body;

  try {
    const astroRes = await fetch('https://api.freeastroapi.com/api/v1/chinese/bazi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.FREEASTRO_API_KEY,
      },
      body: JSON.stringify({
        year, month, day, hour, minute,
        lat: lat || 13.7563,
        lng: lng || 100.5018,
        city: city || 'Bangkok',
        sex: sex || 'M',
        time_standard: 'civil',
        include_pinyin: true,
        include_stars: true,
        include_interactions: true,
        include_professional: true
      })
    });

    const data = await astroRes.json();
    if (data.pillars) return res.status(200).json({ source: 'freeastro', data });

    // Claude fallback
    return res.status(200).json({
      source: 'claude',
      data: { year, month, day, hour, minute, sex }
    });

  } catch(e) {
    return res.status(200).json({
      source: 'claude',
      data: { year, month, day, hour, minute, sex }
    });
  }
}