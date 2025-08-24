export const runtime = "edge";

/* ===========================
   Helpers ITAD (IsThereAnyDeal)
   =========================== */

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

async function itadOverview(plain: string, key?: string) {
  if (!key || !plain) return null;
  try {
    const r = await fetch(
      `https://api.isthereanydeal.com/v01/game/overview/?key=${key}&plains=${plain}`,
      { cache: "no-store" }
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j?.data?.[plain] || null; // { price, lowest, deals: [...] }
  } catch {
    return null;
  }
}

/* ===========================
   Helper CheapShark (fallback)
   =========================== */

const CS = "https://www.cheapshark.com/api/1.0/deals";
const STORE_NAME: Record<string, string> = {
  "1": "Steam",
  "7": "GOG",
  "11": "Humble",
  "25": "Epic",
};

function normalizeDealFromCS(d: any) {
  return {
    title: d.title,
    price: Number(d.salePrice),
    cut: Number(d.savings),
    shop: STORE_NAME[d.storeID] || d.storeID || "Shop",
    url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
  };
}

/* ===========================
   GET /api/game?title=... | ?plain=...
   =========================== */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = (url.searchParams.get("title") || "").trim();
  const plainParam = (url.searchParams.get("plain") || "").trim();

  if (!title && !plainParam) {
    return new Response(
      JSON.stringify({ error: "missing title/plain" }),
      { status: 400, headers: { "content-type": "application/json; charset=utf-8" } }
    );
  }

  const ITAD = process.env.ITAD_API_KEY;
  const out: any = {
    title,
    plain: plainParam || null,
    lowest: null,      // { price, date, shop }
    current: null,     // { price, cut, shop, url }
    stores: [],        // ITAD deals
    currency: "USD"
  };

  /* ---- Prova ITAD (se disponibile) ---- */
  try {
    const plain = plainParam || (title ? await itadPlain(title, ITAD) : null);
    if (plain) {
      out.plain = plain;
      const ov = await itadOverview(plain, ITAD);
      if (ov) {
        // lowest ever
        if (ov.lowest) out.lowest = ov.lowest;
        // prezzo attuale "migliore"
        if (ov.price) out.current = ov.price;
        // lista offerte multi-shop
        if (Array.isArray(ov.deals)) out.stores = ov.deals;
      }
    }
  } catch {
    // ignora errori ITAD: passeremo al fallback
  }

  /* ---- Fallback CheapShark se ITAD non ha dato current ---- */
  if (!out.current) {
    try {
      const q = title || out.plain || "";
      const r = await fetch(
        `${CS}?upperPrice=80&pageSize=20&title=${encodeURIComponent(q)}`,
        { cache: "no-store", headers: { "user-agent": "skg" } }
      );
      if (r.ok) {
        const deals = await r.json();
        if (Array.isArray(deals) && deals.length) {
          // best by savings
          deals.sort((a: any, b: any) => Number(b.savings) - Number(a.savings));
          const best = deals[0];
          out.current = {
            price: Number(best.salePrice),
            cut: Number(best.savings),
            url: `https://www.cheapshark.com/redirect?dealID=${best.dealID}`,
            shop: STORE_NAME[best.storeID] || "Shop",
            currency: "USD",
          };
          // compila anche un paio di alternative dai top 5
          out.stores = deals.slice(0, 5).map(normalizeDealFromCS);
        }
      }
    } catch {
      // nessun fallback disponibile
    }
  }

  // Se ancora vuoto, torna payload minimo
  if (!out.current && !out.lowest && !out.stores.length) {
    out.message = "Nessuna offerta trovata (prova con un altro titolo)";
  }

  return new Response(JSON.stringify(out), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
