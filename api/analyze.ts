/**
 * @file api/analyze.ts
 * @description Sicherer API-Proxy für Google Gemini.
 * Der API Key bleibt server-seitig – niemals im Client-Bundle.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS: allow localhost, any *.vercel.app domain, and custom ALLOWED_ORIGIN
  const origin = (req.headers.origin as string) || '';
  const isAllowed =
    !origin ||
    origin.startsWith('http://localhost') ||
    origin.endsWith('.vercel.app') ||
    (process.env.ALLOWED_ORIGIN ? origin === process.env.ALLOWED_ORIGIN : false);

  if (!isAllowed) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Server-side IP rate limiting
  const ip = ((req.headers['x-forwarded-for'] as string) || 'unknown')
    .split(',')[0]
    .trim();
  const now = Date.now();
  const rate = requestCounts.get(ip);

  if (rate && now < rate.resetTime) {
    if (rate.count >= RATE_LIMIT) {
      return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }
    rate.count++;
  } else {
    requestCounts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const upstream = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch {
    return res.status(500).json({ error: 'Connection to analysis service failed' });
  }
}
