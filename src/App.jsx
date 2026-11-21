import React, { useState } from 'react';
import Nav from './components/Nav.jsx';
import Today from './screens/Today.jsx';
import Runs from './screens/Runs.jsx';
import Detail from './screens/Detail.jsx';
import Coach from './screens/Coach.jsx';
import Progress from './screens/Progress.jsx';
import Passcode from './screens/Passcode.jsx';
import { useRuns } from './data/useRuns.js';
import { useCoachNote } from './data/useCoachNote.js';

export default function App() {
  const [tab, setTab] = useState('today');
  const [runId, setRunId] = useState(null);
  const { status, runs, reload } = useRuns();
  const live = status === 'ready' || status === 'cached';
  const note = useCoachNote(runs, status === 'ready');

  const rightLabel = status === 'sample' ? 'Sample data' : status === 'cached' ? 'Offline copy' : undefined;

  function change(next) {
    setTab(next);
    setRunId(null);
    window.scrollTo(0, 0);
  }

  let screen;
  if (status === 'locked') {
    screen = <Passcode onUnlock={reload} />;
  } else if (status === 'loading') {
    screen = <div className="small" style={{ paddingTop: 80 }}>Loading your runs…</div>;
  } else if (tab === 'runs' && runId) {
    const run = runs.find((r) => r.id === runId);
    screen = <Detail run={run} onBack={() => setRunId(null)} />;
  } else if (tab === 'runs') {
    screen = <Runs runs={runs} rightLabel={rightLabel} onOpen={setRunId} />;
  } else if (tab === 'coach') {
    screen = <Coach runs={runs} note={note} rightLabel={rightLabel} />;
  } else if (tab === 'me') {
    screen = <Progress runs={runs} rightLabel={rightLabel} />;
  } else {
    screen = <Today runs={runs} note={note} rightLabel={rightLabel} />;
  }

  return (
    <div className="app" data-live={live}>
      {screen}
      {status !== 'locked' && <Nav tab={tab} onChange={change} />}
    </div>
  );
}
