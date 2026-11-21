import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import { setPasscode } from '../lib/api.js';

export default function Passcode({ onUnlock }) {
  const [value, setValue] = useState('');

  function submit(e) {
    e.preventDefault();
    setPasscode(value.trim());
    onUnlock();
  }

  return (
    <>
      <Header right="Locked" />
      <h1 className="h1">Enter your<br />passcode</h1>
      <p className="small" style={{ marginTop: 12 }}>This is the APP_PASSCODE you set on the server.</p>
      <form className="composer" style={{ marginTop: 32 }} onSubmit={submit}>
        <input
          type="password"
          aria-label="Passcode"
          placeholder="Passcode"
          autoComplete="current-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit">Unlock</button>
      </form>
    </>
  );
}
