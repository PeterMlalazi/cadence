# Cadence

A calm running log for your iPhone. It reads your runs from Strava, shows them in a minimal black-and-white interface and has an AI coach that reads your training.

It is a PWA: you host it once and add it to your home screen. It is never published to the App Store.

## 1. Run it on your laptop (sample data)

```bash
npm install
npm run dev
```

Open the address it prints. You will see sample runs and a "Sample data" label. To see it on your iPhone, connect the phone to the same Wi-Fi and open the "Network" address in Safari.

## 2. Connect Strava

1. Go to https://www.strava.com/settings/api and create an app. Set **Authorization Callback Domain** to `localhost`. Note the Client ID and Client Secret.
2. Open this address in your browser (replace `YOUR_ID`):

   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all
   ```

3. Press Authorize. The next page will fail to load, and that is fine. Copy the `code=...` value from the address bar.
4. Run:

   ```bash
   node scripts/strava-token.mjs YOUR_ID YOUR_SECRET THE_CODE
   ```

   It prints your refresh token.

Make sure your Huawei watch syncs its runs to Strava, or nothing will show up.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository (keep `.env` out of it, the `.gitignore` already does).
2. At https://vercel.com import the repository. Vercel detects Vite by itself.
3. In **Project Settings > Environment Variables** add everything from `.env.example`:
   `APP_PASSCODE`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`, `ANTHROPIC_API_KEY`.
4. Deploy, then open your Vercel address in Safari on the iPhone, enter your passcode, tap Share and **Add to Home Screen**.

The Anthropic API key comes from https://console.anthropic.com. API usage is billed separately from a Claude subscription. The coach uses a little text per question, so costs stay small.

## How it fits together

```
iPhone (PWA)  ->  /api/strava-runs  ->  Strava
              ->  /api/strava-run   ->  Strava (splits and detailed route)
              ->  /api/coach        ->  Claude API
```

- `src/` is the app (React). `src/lib/stats.js` holds all the maths.
- `api/` are the serverless functions. They keep your secrets off the phone and require the passcode.
- `src/data/mock.js` is the sample data used until the API answers.
- Change your name and weekly goal in `src/config.js`.

## Notes

- The passcode protects your runs and your API credit, because the Vercel address is public. Choose something long.
- Strava can rotate refresh tokens. If the app stops loading runs after a long time, repeat step 2 and update `STRAVA_REFRESH_TOKEN`.
- Apple Health is not connected. It needs a native iOS app.
