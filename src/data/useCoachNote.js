import { useEffect, useState } from 'react';
import { askCoach } from '../lib/api.js';
import { coachContext } from '../lib/stats.js';
import { WEEKLY_GOAL_KM } from '../config.js';

const FALLBACK = 'Your coach will appear here once the app is connected to Strava and the Claude API.';

// One short coach sentence per day, cached so it does not cost an API call every visit.
export function useCoachNote(runs, enabled) {
  const [note, setNote] = useState(FALLBACK);

  useEffect(() => {
    if (!enabled || !runs.length) return;
    const key = `cadence.note.${new Date().toDateString()}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) { setNote(saved); return; }
    } catch { /* ignore */ }

    let alive = true;
    askCoach(
      [{ role: 'user', content: 'In one calm sentence of at most 28 words, tell me what stands out about my training this week and what to do next. No greeting.' }],
      coachContext(runs, WEEKLY_GOAL_KM)
    )
      .then((text) => {
        if (!alive) return;
        setNote(text);
        try { localStorage.setItem(key, text); } catch { /* ignore */ }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [runs, enabled]);

  return note;
}
