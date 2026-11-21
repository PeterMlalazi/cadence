import React from 'react';
import { dayLabel } from '../lib/stats.js';

export default function Header({ right }) {
  return (
    <div className="top">
      <span className="wordmark">Cadence</span>
      <span className="small">{right || dayLabel(new Date())}</span>
    </div>
  );
}
