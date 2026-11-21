// Thin wrapper around fetch. Adds the passcode header the API expects.

const KEY = 'cadence.passcode';

export const getPasscode = () => {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
};

export const setPasscode = (value) => {
  try { localStorage.setItem(KEY, value); } catch { /* ignore */ }
};

export function apiFetch(path, options = {}) {
  return fetch(path, {
    ...options,
    headers: { ...(options.headers || {}), 'x-passcode': getPasscode() }
  });
}

const isJson = (res) => (res.headers.get('content-type') || '').includes('application/json');

// Returns the coach's reply text. Throws if the API is not available (for example in sample mode).
export async function askCoach(messages, context) {
  const res = await apiFetch('/api/coach', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages, context })
  });
  if (!res.ok || !isJson(res)) throw new Error('coach unavailable');
  const data = await res.json();
  return data.reply;
}

export { isJson };
