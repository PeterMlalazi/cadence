// All the maths lives here so the screens stay simple.

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const monthName = (i) => MONTHS[i];
export const shortMonth = (d) => MONTHS[d.getMonth()].slice(0, 3);
export const dayLabel = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${shortMonth(d)}`;

const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);

export function startOfWeek(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x;
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export const paceOf = (run) => (run.km > 0 ? run.sec / run.km : 0);

export function fmtPace(s) {
  if (!s || !isFinite(s)) return '–';
  let m = Math.floor(s / 60);
  let r = Math.round(s - m * 60);
  if (r === 60) { m += 1; r = 0; }
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function fmtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

export const fmtKm = (km) => km.toFixed(1);

export function sortedRuns(runs) {
  return [...runs].sort((a, b) => b.date - a.date);
}

export function lastRuns(runs, n) {
  return sortedRuns(runs).slice(0, n);
}

// Weekly totals, oldest first, ending with the current week.
export function weeklyTotals(runs, n = 12, now = new Date()) {
  const thisMonday = startOfWeek(now);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = addDays(thisMonday, -7 * i);
    const end = addDays(start, 7);
    const rs = runs.filter((r) => r.date >= start && r.date < end);
    const km = sum(rs, (r) => r.km);
    const sec = sum(rs, (r) => r.sec);
    out.push({ start, km, sec, count: rs.length, pace: km ? sec / km : 0 });
  }
  return out;
}

export function currentWeek(runs) {
  const [prev, cur] = weeklyTotals(runs, 2);
  return { cur, prev };
}

export function headline(cur, prev) {
  if (prev.km > 0) {
    if (cur.km > prev.km * 1.15) return 'A big';
    if (cur.km < prev.km * 0.7) return 'A quiet';
  }
  return 'A steady';
}

// Calendar cells for one month (Monday first).
export function monthGrid(runs, year, month, now = new Date()) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const inMonth = runs.filter((r) => r.date.getFullYear() === year && r.date.getMonth() === month);
  const byDay = {};
  inMonth.forEach((r) => {
    const k = r.date.getDate();
    byDay[k] = byDay[k] || { km: 0, id: r.id };
    byDay[k].km += r.km;
  });
  const cells = [];
  const total = Math.ceil((lead + days) / 7) * 7;
  for (let i = 0; i < total; i++) {
    const day = i - lead + 1;
    const valid = day >= 1 && day <= days;
    const hit = valid ? byDay[day] : undefined;
    cells.push({
      key: i,
      day: valid ? day : null,
      km: hit ? hit.km : 0,
      runId: hit ? hit.id : null,
      today: valid && now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
    });
  }
  return {
    cells,
    km: sum(inMonth, (r) => r.km),
    count: inMonth.length,
    runs: sortedRuns(inMonth)
  };
}

// A compact text summary the AI coach reads.
export function coachContext(runs, goalKm) {
  const weeks = weeklyTotals(runs, 12);
  const recent = lastRuns(runs, 10);
  const lines = [
    `Today: ${dayLabel(new Date())}. Weekly goal: ${goalKm} km.`,
    `Weekly distance in km, oldest to newest (last ${weeks.length} weeks): ${weeks.map((w) => fmtKm(w.km)).join(', ')}.`,
    'Most recent runs:'
  ];
  recent.forEach((r) => {
    lines.push(
      `- ${dayLabel(r.date)}: ${r.name}, ${fmtKm(r.km)} km in ${fmtTime(r.sec)} (${fmtPace(paceOf(r))}/km)` +
        (r.hr ? `, average heart rate ${Math.round(r.hr)}` : '')
    );
  });
  return lines.join('\n');
}
