import React from 'react';
import Header from '../components/Header.jsx';
import { Ring, PaceDots } from '../components/charts.jsx';
import { NAME, WEEKLY_GOAL_KM } from '../config.js';
import { currentWeek, headline, lastRuns, paceOf, fmtPace } from '../lib/stats.js';

export default function Today({ runs, note, rightLabel }) {
  const { cur, prev } = currentWeek(runs);
  const recent = lastRuns(runs, 5).reverse(); // oldest first
  const paces = recent.map(paceOf);

  return (
    <>
      <Header right={rightLabel} />
      <h1 className="h1">
        {headline(cur, prev)}
        <br />
        week, {NAME}.
      </h1>

      <div className="center" style={{ marginTop: 32 }}>
        <Ring km={cur.km} goal={WEEKLY_GOAL_KM} />
      </div>

      <div className="label" style={{ marginTop: 32 }}>Last five runs · pace</div>
      <div className="pace-wrap">
        <PaceDots paces={paces} />
      </div>
      <div className="row-between small" style={{ marginTop: 8 }}>
        <span>{paces.length ? fmtPace(paces[0]) : ''}</span>
        <span>{paces.length ? `${fmtPace(paces[paces.length - 1])} /km` : ''}</span>
      </div>

      <p className="quote" style={{ marginTop: 32 }}>“{note}”</p>
      <div className="label" style={{ marginTop: 8 }}>Coach</div>
    </>
  );
}
