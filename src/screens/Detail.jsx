import React from 'react';
import Header from '../components/Header.jsx';
import { Route } from '../components/charts.jsx';
import { useRunDetail } from '../data/useRuns.js';
import { dayLabel, fmtKm, fmtPace, fmtTime, paceOf } from '../lib/stats.js';

export default function Detail({ run: base, onBack }) {
  const run = useRunDetail(base);
  if (!run) return null;

  const splits = run.splits || [];
  const paces = splits.map((s) => s.pace);
  const fastest = Math.min(...paces);
  const slowest = Math.max(...paces);
  // Faster splits get longer bars. The slowest still gets 55% so it stays readable.
  const width = (p) => `${100 - ((p - fastest) / (slowest - fastest || 1)) * 45}%`;

  return (
    <>
      <Header right={dayLabel(run.date)} />
      <button className="back" onClick={onBack}>‹ Runs</button>
      <h1 className="h1">{run.name}</h1>

      <div className="stats three">
        <div><div className="serif stat-n">{fmtKm(run.km)}</div><div className="small">km</div></div>
        <div><div className="serif stat-n">{fmtTime(run.sec)}</div><div className="small">time</div></div>
        <div><div className="serif stat-n">{fmtPace(paceOf(run))}</div><div className="small">per km</div></div>
      </div>

      <div className="center" style={{ marginTop: 20 }}>
        <Route points={run.route} />
      </div>

      {splits.length > 0 && (
        <>
          <div className="label" style={{ marginTop: 20 }}>Splits · km</div>
          <div className="splits">
            {splits.map((s) => (
              <div key={s.km} className="split">
                <span className="small">{s.km}</span>
                <div className="track"><div className="bar" style={{ width: width(s.pace) }} /></div>
                <span className="split-p">{fmtPace(s.pace)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {run.hr ? <div className="small" style={{ marginTop: 20 }}>Average heart rate {Math.round(run.hr)} bpm</div> : null}
    </>
  );
}
