import { authorized } from './_lib/auth.js';
import { stravaGet, isRun, normalize } from './_lib/strava.js';

// GET /api/strava-runs  ->  { runs: [...] } for the last 12 months
export default async function handler(req, res) {
  if (!authorized(req, res)) return;
  try {
    const after = Math.floor(Date.now() / 1000) - 365 * 24 * 3600;
    let all = [];
    for (let page = 1; page <= 4; page++) {
      const batch = await stravaGet('/athlete/activities', { after, per_page: 100, page });
      all = all.concat(batch);
      if (batch.length < 100) break;
    }
    const runs = all.filter(isRun).map(normalize);
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.status(200).json({ runs });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
