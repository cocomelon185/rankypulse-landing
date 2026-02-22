const UPSTREAM = (process.env.RANKYPULSE_APP_URL || "https://rankypulse.com").replace(/\/+$/, "");

async function readJsonSafe(r: Response) {
  const text = await r.text();
  try { return { json: JSON.parse(text), text }; } catch { return { json: null as any, text }; }
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const url = String(body?.url || body?.targetUrl || body?.target || "").trim();

  if (!url) {
    return new Response(JSON.stringify({ error: "Invalid input", field: "url" }), {
      status: 400,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }

  const upstream = await fetch(`${UPSTREAM}/api/audit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url })
  });

  const { json, text } = await readJsonSafe(upstream);

  if (!upstream.ok) {
    const msg = (json && (json.error || json.message)) || text || "Try again";
    return new Response(JSON.stringify({ error: String(msg) }), {
      status: upstream.status || 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }

  return new Response(JSON.stringify(json ?? { ok: true }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}
