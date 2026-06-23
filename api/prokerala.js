export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { birthDate, birthTime, birthPlace, lat, lon } = req.body;

  // 1. Get access token
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

  // 2. Get planet positions
  const datetime = `${birthDate}T${birthTime}:00+07:00`;
  const astroRes = await fetch(
  `https://api.prokerala.com/v2/astrology/western/natal-chart?coordinates=${lat},${lon}&datetime=${encodeURIComponent(datetime)}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

  const astroData = await astroRes.json();
  res.status(200).json(astroData);
}