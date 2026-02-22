import type { NextApiRequest, NextApiResponse } from "next";

const UPSTREAM = (process.env.RANKYPULSE_APP_URL || "https://rankypulse.com").replace(/\/+$/, "");

async function readJsonSafe(r: Response) {
  const text = await r.text();
  try { return { json: JSON.parse(text), text }; } catch { return { json: null as any, text }; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : (req.body || {});
  const url = String(body?.url || body?.targetUrl || body?.target || "").trim();

  if (!url) return res.status(400).json({ error: "Invalid input", field: "url" });

  const upstream = await fetch(`${UPSTREAM}/api/audit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url })
  });

  const { json, text } = await readJsonSafe(upstream);
  res.setHeader("cache-control", "no-store");

  if (!upstream.ok) {
    const msg = (json && (json.error || json.message)) || text || "Try again";
    return res.status(upstream.status || 500).json({ error: String(msg) });
  }

  return res.status(200).json(json ?? { ok: true });
}
