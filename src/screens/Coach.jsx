import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header.jsx';
import { askCoach } from '../lib/api.js';
import { coachContext } from '../lib/stats.js';
import { WEEKLY_GOAL_KM } from '../config.js';

const KEY = 'cadence.chat';
const OFFLINE = 'I can only answer once the app is deployed with your Claude API key. Until then, the screens use sample data.';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export default function Coach({ runs, note, rightLabel }) {
  const [messages, setMessages] = useState(load);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(messages.slice(-30))); } catch { /* ignore */ }
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages, busy]);

  async function send(e) {
    e.preventDefault();
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setText('');
    setBusy(true);
    try {
      const reply = await askCoach(next.slice(-12), coachContext(runs, WEEKLY_GOAL_KM));
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: OFFLINE }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header right={rightLabel} />
      <h1 className="h1">Coach</h1>
      <div className="small" style={{ marginTop: 8 }}>Reads your recent runs from Strava</div>

      <div className="chat">
        <p className="coach-msg">{note}</p>
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="user-msg">{m.content}</div>
          ) : (
            <p key={i} className="coach-msg">{m.content}</p>
          )
        )}
        {busy && <p className="coach-msg muted">…</p>}
        <div ref={end} />
      </div>

      <form className="composer" onSubmit={send}>
        <input
          type="text"
          aria-label="Ask your coach"
          placeholder="Ask your coach"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={busy}>Send</button>
      </form>
    </>
  );
}
