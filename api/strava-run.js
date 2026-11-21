import { authorized } from './_lib/auth.js';
import { stravaGet, decodePolyline, thin } from './_lib/strava.js';

// GET /api/strava-run?id=123  ->  { splits: [{ km, pace }], route: [[lat, lng], ...] }
export default async function handler(req, res) {
  if (!authorized(req, res)) return;
  const id = String(req.query.id || '');
  if (!/^\d+$/.test(id)) {
    res.status(400).json({ error: 'Bad id.' });
    return;
  }
  try {
    const a = await stravaGet(`/activities/${id}`);
    const splits = (a.splits_metric || [])
      .filter((s) => s.distance > 200)
      .map((s, i) => ({ km: i + 1, pace: Math.round(s.moving_time / (s.distance / 1000)) }));
    const route = thin(decodePolyline(a.map?.polyline || a.map?.summary_polyline), 200);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.status(200).json({ splits, route });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
