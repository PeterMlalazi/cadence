import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import { monthGrid, monthName, dayLabel, fmtKm, fmtPace, paceOf } from '../lib/stats.js';

export default function Runs({ runs, rightLabel, onOpen }) {
  const now = new Date();
  const [offset, setOffset] = useState(0); // months back from now
  const shown = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const grid = monthGrid(runs, shown.getFullYear(), shown.getMonth(), now);

  return (
    <>
      <Header right={rightLabel} />
      <div className="row-between" style={{ alignItems: 'flex-end' }}>
        <h1 className="h1">{monthName(shown.getMonth())}</h1>
        <div className="row">
          <button className="icon-btn" aria-label="Previous month" onClick={() => setOffset(offset + 1)}>‹</button>
          <button className="icon-btn" aria-label="Next month" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 1))}>›</button>
        </div>
      </div>
      <div className="small" style={{ marginTop: 8 }}>
        {fmtKm(grid.km)} km · {grid.count} {grid.count === 1 ? 'run' : 'runs'}
      </div>

      <div className="weekdays">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="month">
        {grid.cells.map((c) => {
          const size = c.km ? Math.min(22, Math.round(5 + c.km * 1.1)) : 0;
          const inner = (
            <>
              <span
                className={c.km ? 'dot' : c.day ? 'dot-empty' : ''}
                style={c.km ? { width: size, height: size } : undefined}
              />
              <span className="small day-n">{c.day || ''}</span>
            </>
          );
          const cls = `cell${c.today ? ' today' : ''}`;
          return c.runId ? (
            <button key={c.key} className={cls} aria-label={`Open run on day ${c.day}`} onClick={() => onOpen(c.runId)}>{inner}</button>
          ) : (
            <div key={c.key} className={cls}>{inner}</div>
          );
        })}
      </div>

      <div className="list">
        {grid.runs.map((r) => (
          <button key={r.id} className="list-row" onClick={() => onOpen(r.id)}>
            <span>
              <span className="list-title">{r.name}</span>
              <span className="small block">{dayLabel(r.date)}</span>
            </span>
            <span className="right">
              <span className="list-title">{fmtKm(r.km)} km</span>
              <span className="small block">{fmtPace(paceOf(r))} /km</span>
            </span>
          </button>
        ))}
        {grid.runs.length === 0 && <div className="small" style={{ padding: '16px 0' }}>No runs this month.</div>}
      </div>
    </>
  );
}
