import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import { LineChart } from '../components/charts.jsx';
import { weeklyTotals, shortMonth, fmtPace } from '../lib/stats.js';

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export default function Progress({ runs, rightLabel }) {
  const [range, setRange] = useState(12);
  const weeks = weeklyTotals(runs, range);
  const km = weeks.map((w) => w.km);

  const third = Math.max(1, Math.floor(weeks.length / 4));
  const early = weeks.slice(0, third);
  const late = weeks.slice(-third);
  const kmEarly = avg(early.map((w) => w.km));
  const kmLate = avg(late.map((w) => w.km));
  const change = kmEarly > 0 ? Math.round(((kmLate - kmEarly) / kmEarly) * 100) : null;
  const pEarly = avg(early.filter((w) => w.pace).map((w) => w.pace));
  const pLate = avg(late.filter((w) => w.pace).map((w) => w.pace));
  const dPace = pEarly && pLate ? pLate - pEarly : null;

  const mid = weeks[Math.floor(weeks.length / 2)].start;
  const labels = [weeks[0].start, mid, weeks[weeks.length - 1].start].map(shortMonth);

  return (
    <>
      <Header right={rightLabel} />
      <h1 className="h1">
        {range === 12 ? 'Twelve weeks' : 'The last year'}
        <br />
        of progress
      </h1>

      <div className="row" style={{ marginTop: 20, gap: 8 }}>
        <button className={`pill${range === 12 ? ' on' : ''}`} onClick={() => setRange(12)}>12 weeks</button>
        <button className={`pill${range === 52 ? ' on' : ''}`} onClick={() => setRange(52)}>Year</button>
      </div>

      <div className="label" style={{ marginTop: 24 }}>Km per week</div>
      <div style={{ marginTop: 12 }}>
        <LineChart values={km} label={`Weekly distance over ${range} weeks`} />
        <div className="row-between small" style={{ marginTop: 6 }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>

      <div className="stats two" style={{ marginTop: 24 }}>
        <div>
          <div className="serif stat-big">{change === null ? '–' : `${change > 0 ? '+' : ''}${change}%`}</div>
          <div className="small" style={{ marginTop: 6 }}>weekly distance</div>
        </div>
        <div>
          <div className="serif stat-big">
            {dPace === null ? '–' : `${dPace <= 0 ? '−' : '+'}${fmtPace(Math.abs(dPace)).replace(/^0:/, '0:')}`}
          </div>
          <div className="small" style={{ marginTop: 6 }}>average pace per km</div>
        </div>
      </div>
    </>
  );
}
