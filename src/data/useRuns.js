import { useCallback, useEffect, useState } from 'react';
import { apiFetch, isJson } from '../lib/api.js';
import { mockRuns } from './mock.js';

const CACHE = 'cadence.runs';

const parse = (runs) => runs.map((r) => ({ ...r, date: new Date(r.date) }));

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE) || 'null'); } catch { return null; }
}

function writeCache(runs) {
  try { localStorage.setItem(CACHE, JSON.stringify(runs)); } catch { /* storage full or blocked */ }
}

// status: 'loading' | 'ready' (live Strava) | 'cached' (offline copy) | 'sample' | 'locked'
export function useRuns() {
  const [state, setState] = useState({ status: 'loading', runs: [] });

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/strava-runs');
      if (res.status === 401) {
        setState({ status: 'locked', runs: [] });
        return;
      }
      if (!res.ok || !isJson(res)) throw new Error('api unavailable');
      const data = await res.json();
      writeCache(data.runs);
      setState({ status: 'ready', runs: parse(data.runs) });
    } catch {
      const cached = readCache();
      if (cached && cached.length) {
        setState({ status: 'cached', runs: parse(cached) });
      } else {
        setState({ status: 'sample', runs: parse(mockRuns()) });
      }
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ...state, reload: load };
}

// Splits and a detailed route only come from the single-run endpoint.
export function useRunDetail(run) {
  const [extra, setExtra] = useState(null);

  useEffect(() => {
    setExtra(null);
    if (!run || run.splits || String(run.id).startsWith('sample-')) return;
    let alive = true;
    apiFetch(`/api/strava-run?id=${encodeURIComponent(run.id)}`)
      .then((res) => (res.ok && isJson(res) ? res.json() : null))
      .then((data) => { if (alive && data) setExtra(data); })
      .catch(() => {});
    return () => { alive = false; };
  }, [run]);

  return run ? { ...run, ...(extra || {}) } : null;
}
