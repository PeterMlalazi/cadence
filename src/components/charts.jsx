import React from 'react';

// Weekly goal ring. 32.4 of 40 km => 81% drawn.
export function Ring({ km, goal, size = 200 }) {
  const r = 88;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, km / goal));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={`${km.toFixed(1)} of ${goal} kilometres weekly goal`}>
        <circle cx="100" cy="100" r={r} fill="none" stroke="#d4d4d4" strokeWidth="2" />
        <circle
          cx="100" cy="100" r={r} fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`} transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="ring-text">
        <div className="serif ring-km">{km.toFixed(1)}</div>
        <div className="small">of {goal} km</div>
      </div>
    </div>
  );
}

// Dots joined by a dotted line. Faster runs sit higher.
export function PaceDots({ paces, width = 326, height = 56 }) {
  if (paces.length < 2) return <div style={{ height }} />;
  const lo = Math.min(...paces);
  const hi = Math.max(...paces);
  const x = (i) => 16 + (i * (width - 32)) / (paces.length - 1);
  const y = (p) => 10 + ((p - lo) / (hi - lo || 1)) * (height - 20);
  const pts = paces.map((p, i) => [x(i), y(p)]);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Pace over your last runs">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#111" strokeWidth="1" strokeDasharray="2 4" />
      {pts.map((p, i) =>
        i === pts.length - 1 ? (
          <circle key={i} cx={p[0]} cy={p[1]} r="5" fill="#111" />
        ) : (
          <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#f3f3f3" stroke="#111" strokeWidth="1.5" />
        )
      )}
    </svg>
  );
}

export function LineChart({ values, width = 326, height = 160, label }) {
  const n = values.length;
  const pad = 8;
  const max = Math.max(...values, 1) * 1.1;
  const x = (i) => pad + (n === 1 ? 0 : (i * (width - 2 * pad)) / (n - 1));
  const y = (v) => 10 + (1 - v / max) * (height - 20);
  const pts = values.map((v, i) => [x(i), y(v)]);
  const dots = n <= 16;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={width} y1={10 + g * (height - 20)} y2={10 + g * (height - 20)} stroke="#d4d4d4" strokeWidth="1" />
      ))}
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {dots && pts.slice(0, -1).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="#111" />)}
      <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r="5" fill="#111" />
    </svg>
  );
}

// Draws a GPS route ([lat, lng] pairs) fitted into a box.
export function Route({ points, width = 326, height = 130 }) {
  if (!points || points.length < 2) {
    return <div className="small" style={{ height, display: 'flex', alignItems: 'center' }}>No route recorded.</div>;
  }
  const lat0 = points.reduce((a, p) => a + p[0], 0) / points.length;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const xy = points.map((p) => [p[1] * k, -p[0]]);
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = 12;
  const s = Math.min((width - 2 * pad) / (maxX - minX || 1), (height - 2 * pad) / (maxY - minY || 1));
  const ox = (width - (maxX - minX) * s) / 2;
  const oy = (height - (maxY - minY) * s) / 2;
  const pts = xy.map((p) => [ox + (p[0] - minX) * s, oy + (p[1] - minY) * s]);
  const first = pts[0];
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Route of the run">
      <polyline points={pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')} fill="none" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={first[0]} cy={first[1]} r="5" fill="#111" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#f3f3f3" stroke="#111" strokeWidth="1.5" />
    </svg>
  );
}
