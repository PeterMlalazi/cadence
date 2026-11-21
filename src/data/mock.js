// Sample runs so the app works before Strava is connected.
// Generates a year of believable training that builds up to today.
import { startOfWeek, addDays } from '../lib/stats.js';

function rng(seed) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

const pad = (n) => String(n).padStart(2, '0');
const isoLocal = (d, hour) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:30:00`;

// A loop around a point, with some wobble, as [lat, lng] pairs.
function loop(r, km) {
  const pts = [];
  const rx = 0.002 + km * 0.0006;
  const ry = 0.0015 + km * 0.0004;
  const phase = r() * Math.PI * 2;
  const wob = [r() * 0.4, r() * 0.4, r() * 0.3];
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const k = 1 + wob[0] * Math.sin(2 * a + phase) + wob[1] * Math.cos(3 * a) + wob[2] * Math.sin(5 * a);
    pts.push([-25.745 + ry * Math.sin(a) * k, 28.2 + rx * Math.cos(a) * k]);
  }
  return pts;
}

function splitsFor(r, km, avgPace) {
  const n = Math.max(1, Math.ceil(km));
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 1 : i / (n - 1);
    const drift = (0.5 - t) * 12; // start a bit slower, finish a bit faster
    return { km: i + 1, pace: Math.round(avgPace + drift + (r() - 0.5) * 6) };
  });
}

export function mockRuns(now = new Date()) {
  const r = rng(7);
  const thisMonday = startOfWeek(now);
  const runs = [];
  let id = 0;

  for (let w = 0; w < 52; w++) {
    const monday = addDays(thisMonday, -7 * w);
    const build = Math.max(0.45, 1 - w * 0.012); // older weeks were lighter
    const slow = w * 0.45; // and slower
    const plan = [
      { dow: 0, name: 'Long run', km: 14.1 * build, pace: 365 + slow, hr: 152, hour: 6 },
      { dow: 2, name: 'Intervals', km: 6 * build, pace: 310 + slow, hr: 168, hour: 17 },
      { dow: 4, name: 'Easy run', km: 8.2 * build, pace: 352 + slow, hr: 146, hour: 6 },
      { dow: 5, name: 'Recovery run', km: 4.1 * build, pace: 372 + slow, hr: 138, hour: 7 }
    ];
    plan.forEach((p) => {
      const date = addDays(monday, p.dow);
      if (date > now) return;
      if (w > 0 && r() < 0.12) return; // the odd rest day
      const km = Math.round((p.km * (0.92 + r() * 0.16)) * 10) / 10;
      const pace = p.pace + (r() - 0.5) * 8;
      runs.push({
        id: `sample-${id++}`,
        name: p.name,
        date: isoLocal(date, p.hour),
        km,
        sec: Math.round(km * pace),
        hr: p.hr + Math.round((r() - 0.5) * 6),
        route: loop(r, km),
        splits: splitsFor(r, km, pace)
      });
    });
  }
  return runs;
}
