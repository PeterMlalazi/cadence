import React from 'react';

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'runs', label: 'Runs' },
  { id: 'coach', label: 'Coach' },
  { id: 'me', label: 'Me' }
];

export default function Nav({ tab, onChange }) {
  return (
    <nav className="nav" aria-label="Main">
      {TABS.map((t) => (
        <button key={t.id} aria-current={tab === t.id ? 'page' : undefined} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
