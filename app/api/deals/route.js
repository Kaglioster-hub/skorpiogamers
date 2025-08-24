// app/api/deals/route.ts
import { NextRequest } from "next/server";

const CHEAPSHARK_BASE = "https://www.cheapshark.com/api/1.0";

type CheapSharkDeal = {
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string; // "xx.xx"
  dealID: string;
  storeID: string;
  thumb?: string;
  steamAppID?: string;
};

const STORE_NAMES: Record<string, string> = {
  "1": "steam",
  "7": "gog",
  "11": "humble",
  "18": "epic",
  "21": "gamesplanet",
  "24": "allyouplay",
  // (altri opzionali)
};

function mapDeal(d: CheapSharkDeal) {
  const sale = Number(d.salePrice);
  const full = Number(d.normalPrice);
  const savings = Number(d.savings);
  const store = STORE_NAMES[d.storeID] || d.storeID || "unknown";
  const slug = (d.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const target =
    d.steamAppID && store === "steam"
      ? `https://store.steampowered.com/app/${d.steamAppID}`
      : `https://www.cheapshark.com/redirect?dealID=${d.dealID}`;

  return {
    title: d.title,
    salePrice: sale,
    fullPrice: full,
    savings,
    url: target,
    thumb: d.thumb || null,
    store,
    slug,
  };
}

async function fetchDeals(params: {
  q?: string;
  store?: string;
  sort?: string;
  page: number;
  size: number;
}) {
  const url = new URL(`${CHEAPSHARK_BASE}/deals`);
  url.searchParams.set("upperPrice", "200");   // non troppo stringente
  url.searchParams.set("pageSize", "120");     // batch ampio
  url.searchParams.set("sortBy", "Savings");   // base per risparmio

  if (params.store) {
    const storeId = Object.entries(STORE_NAMES).find(([, n]) => n === params.store)?.[0];
    if (storeId) url.searchParams.set("storeID", storeId);
  }

  const r = await fetch(url.toString(), { cache: "no-store" });
  if (!r.ok) throw new Error(`CheapShark HTTP ${r.status}`);
  const raw = (await r.json()) as CheapSharkDeal[];

  let arr = raw.map(mapDeal);

  // filtro testuale
  if (params.q) {
    const qq = params.q.toLowerCase();
    arr = arr.filter((x) => x.title.toLowerCase().includes(qq));
  }

  // ordinamenti
  switch (params.sort) {
    case "best":
    case "savings":
      arr.sort((a, b) => b.savings - a.savings);
      break;
    case "priceLow":
      arr.sort((a, b) => a.salePrice - b.salePrice);
      break;
    case "priceHigh":
      arr.sort((a, b) => b.salePrice - a.salePrice);
      break;
    case "alpha":
      arr.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  const count = arr.length;
  const start = (params.page - 1) * params.size;
  const end = start + params.size;
  return { page: params.page, size: params.size, count, items: arr.slice(start, end) };
}

export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams;
    const q = sp.get("q") || undefined;
    const store = sp.get("store") || undefined;
    const sort = (sp.get("sort") || "best").toLowerCase();
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const size = Math.min(60, Math.max(6, parseInt(sp.get("size") || "24", 10)));
    const data = await fetchDeals({ q, store, sort, page, size });
    return Response.json(data, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    console.error("[/api/deals] error:", e);
    return Response.json({ page: 1, size: 0, count: 0, items: [], error: "Deals API error" }, { status: 500 });
  }
}
