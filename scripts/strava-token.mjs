// One-time helper: swaps the code from Strava's authorize page for a refresh token.
// Usage: node scripts/strava-token.mjs <client_id> <client_secret> <code>

const [clientId, clientSecret, code] = process.argv.slice(2);

if (!clientId || !clientSecret || !code) {
  console.error('Usage: node scripts/strava-token.mjs <client_id> <client_secret> <code>');
  process.exit(1);
}

const res = await fetch('https://www.strava.com/oauth/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code'
  })
});

const data = await res.json();
if (!res.ok) {
  console.error('Strava said no:', data);
  process.exit(1);
}

console.log('\nPut this in your environment as STRAVA_REFRESH_TOKEN:\n');
console.log(data.refresh_token);
console.log('\nGranted scope:', data.scope || '(see the authorize page)');
