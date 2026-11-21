import { authorized } from './_lib/auth.js';

const SYSTEM = `You are Cadence, a calm and knowledgeable running coach for one runner.
Speak plainly and warmly, in short paragraphs. No emojis, no bullet lists, no headings.
Base advice on the training data below. If the data does not show something, say so instead of guessing.
You are not a doctor. If the runner mentions sharp pain, dizziness, chest pain or an injury that lingers, tell them to see a medical professional.
Keep answers under 120 words unless asked for more.`;

// POST /api/coach  { messages: [{role, content}], context: "text summary of recent runs" }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only.' });
    return;
  }
  if (!authorized(req, res)) return;

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server.' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const context = String(body.context || '').slice(0, 6000);
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-12)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    res.status(400).json({ error: 'Send at least one user message.' });
    return;
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.COACH_MODEL || 'claude-sonnet-5-5',
        max_tokens: 400,
        system: `${SYSTEM}\n\nTraining data:\n${context}`,
        messages
      })
    });
    if (!r.ok) {
      res.status(502).json({ error: `Claude API error (${r.status}).` });
      return;
    }
    const data = await r.json();
    const reply = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    res.status(200).json({ reply });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
