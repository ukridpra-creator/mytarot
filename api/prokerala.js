export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { year, month, day, hour, minute, lat, lon } = req.body;

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
    if (!token) return res.status(500).json({ error: 'Token failed', detail: tokenData });

    const datetime = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00+07:00`;

    const astroRes = await fetch(
      `https://api.prokerala.com/v2/astrology/western/natal-planet-position?coordinates=${lat},${lon}&datetime=${encodeURIComponent(datetime)}&house_system=placidus&orb=default&aspect_filter=major`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await astroRes.json();
    res.status(200).json(data);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}