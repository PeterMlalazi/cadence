// Small Strava client. Uses a refresh token you create once (see README).

let cached = { token: null, expiresAt: 0 };

async function accessToken() {
  const now = Date.now() / 1000;
  if (cached.token && cached.expiresAt > now + 60) return cached.token;

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID || '',
      client_secret: process.env.STRAVA_CLIENT_SECRET || '',
      grant_type: 'refresh_token',
      refresh_token: process.env.STRAVA_REFRESH_TOKEN || ''
    })
  });
  if (!res.ok) throw new Error(`Strava token refresh failed (${res.status}). Check your STRAVA_* variables.`);
  const data = await res.json();
  cached = { token: data.access_token, expiresAt: data.expires_at };
  return cached.token;
}

export async function stravaGet(path, params = {}) {
  const url = new URL(`https://www.strava.com/api/v3${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${await accessToken()}` } });
  if (!res.ok) throw new Error(`Strava request failed (${res.status}).`);
  return res.json();
}

// Strava sends routes as Google-encoded polylines.
export function decodePolyline(str = '') {
  const coords = [];
  let index = 0, lat = 0, lng = 0;
  while (index < str.length) {
    for (const axis of ['lat', 'lng']) {
      let shift = 0, result = 0, b;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 'lat') lat += delta; else lng += delta;
    }
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}

// Keep the payload small: at most `max` points per route.
export function thin(points, max = 120) {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}

export function isRun(a) {
  const type = a.sport_type || a.type;
  return type === 'Run' || type === 'TrailRun';
}

export function normalize(a) {
  return {
    id: String(a.id),
    name: a.name,
    // Strava labels local time with a trailing Z. Dropping it keeps it as local time.
    date: String(a.start_date_local || '').replace('Z', ''),
    km: (a.distance || 0) / 1000,
    sec: a.moving_time || 0,
    hr: a.average_heartrate || null,
    route: thin(decodePolyline(a.map?.summary_polyline))
  };
}
