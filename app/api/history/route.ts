export const runtime = "edge";

/* ============ Helpers ITAD ============ */
async function itadPlain(title: string, key?: string) {
  if (!key) return null;
  try {
    const r = await fetch(
      `https://api.isthereanydeal.com/v02/game/plain/?key=${key}&title=${encodeURIComponent(title)}`,
      { cache: "no-store" }
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j?.data?.plain || null;
  } catch {
    return null;
  }
}

async function itadPrices(plain: string, key?: string) {
  if (!key || !plain) return [];
  try {
    const r = await fetch(
      `https://api.isthereanydeal.com/v01/game/prices/?key=${key}&plains=${plain}`,
      { cache: "no-store" }
    );
    if (!r.ok) return [];
    const j = await r.json();
    const list = j?.data?.[plain]?.list || [];
    return list.map((x: any) => ({
      shop: x.shop?.name || x.shop || "shop",
      price: Number(x.price_new ?? x.price ?? 0),
      cut: Number(x.price_cut ?? x.cut ?? 0),
      recorded: x.recorded || x.added || null,
      url: x.url || null,
    }));
  } catch {
    return [];
  }
}

/* ============ GET /api/history ============ */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = (url.searchParams.get("title") || "").trim();
  const plain = (url.searchParams.get("plain") || "").trim();

  if (!title && !plain) {
    return new Response(JSON.stringify([]), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const KEY = process.env.ITAD_API_KEY;
  const p = plain || (title ? await itadPlain(title, KEY) : null);
  if (!p) {
    // Nessuna chiave o nessun match: torna lista vuota in modo pulito
    return new Response(JSON.stringify([]), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const data = await itadPrices(p, KEY);
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
