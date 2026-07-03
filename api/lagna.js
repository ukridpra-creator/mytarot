// pages/api/lagna.js
// Proxy fetch myhora แล้ว parse ลัคนา
// รับ: { year (BE), month, day, hour, minute, lat, lon }

const SIGNS_TH = ['เมษ','พฤษภ','มิถุน','กรกฏ','สิงห์','กันย์','ตุลย์','พิจิก','ธนู','มกร','กุมภ์','มีน'];

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  let body;
  try {
    body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', c => data += c);
      req.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); }});
      req.on('error', reject);
    });
  } catch(e) { return res.status(400).json({ error: 'invalid_body' }); }

  const { year, month, day, hour, minute, lat, lon } = body;
  if (!year || !month || !day) return res.status(400).json({ error: 'missing_params' });

  const yearBE = year > 2300 ? year : year + 543;
  const h  = hour   ?? 12;
  const mn = minute ?? 0;
  const latitude  = lat || 13.752555;
  const longitude = lon || 100.494066;

  try {
    // URL ผูกดวง myhora
    const url = `https://myhora.com/ดูดวง/ดวงชะตา.aspx?yr=${yearBE}&mt=${month}&dt=${day}&hr=${h}&mi=${mn}&lat=${latitude}&lon=${longitude}&tz=7&lang=1`;


    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'th-TH,th;q=0.9',
        'Referer': 'https://myhora.com/astrology/thai.aspx',
      }
    });

    if (!resp.ok) throw new Error(`myhora_${resp.status}`);
    const html = await resp.text();

    let signIdx = -1, deg = 0, min = 0;

    // parse ลัคนา: "ลัคนาสถิตราศีตุล"
    const m1 = html.match(/ลัคนาสถิตราศี([\u0E00-\u0E7F]+)/);
    if (m1) {
      const s = m1[1];
      signIdx = SIGNS_TH.findIndex(sign => s.startsWith(sign));
    }

    // parse องศา
    if (signIdx >= 0) {
      const m2 = html.match(/ลัคนา[^<]{0,100}?(\d{1,2})[°]\s*(\d{1,2})/);
      if (m2) { deg = parseInt(m2[1]); min = parseInt(m2[2]); }
    }

    if (signIdx < 0) {
      // debug: ส่ง snippet กลับมาดู
      const snippet = html.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').substring(0,500);
      return res.status(500).json({ error: 'parse_failed', snippet });
    }

    return res.status(200).json({ sign: SIGNS_TH[signIdx], signIdx, deg, min });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}