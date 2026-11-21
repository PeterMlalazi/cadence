import { timingSafeEqual } from 'node:crypto';

// Every endpoint is behind a passcode, because the deployed URL is public
// and these endpoints expose your runs and spend your Claude API credit.
// Returns true if the request may continue. Otherwise it has already replied.
export function authorized(req, res) {
  const expected = process.env.APP_PASSCODE;
  if (!expected) {
    res.status(500).json({ error: 'APP_PASSCODE is not set on the server.' });
    return false;
  }
  const got = String(req.headers['x-passcode'] || '');
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  if (!ok) res.status(401).json({ error: 'locked' });
  return ok;
}
