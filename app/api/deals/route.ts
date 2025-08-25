// app/api/deals/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";

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
  "25": "epic",        // ✅ correggi 18 -> 25
  "21": "gamesplanet",
  "24": "allyouplay",
};

// costruisce URL affiliato (usa .env se presente) o fallback a CheapShark
function buildAffiliateUrl(
  store: string,
  slug: string,
  steamAppID?: string,
  dealID?: string
) {
  const AFFILIATE: Record<string, string | undefined> = {
    steam: process.env.AFF_STEAM,
    gog: process.env.AFF_GOG,
    humble: process.env.AFF_HUMBLE,
    epic: process.env.AFF_EPIC,
    gamesplanet: process.env.AFF_GAMESPLANET,
    allyouplay: process.env.AFF_ALLYOUPLAY,
  };

  const tpl = AFFILIATE[store];
  if (tpl) {
    return tpl.replace("{APPID}", steamAppID || "").replace("{SLUG}", slug);
  }
  return `https://www.cheapshark.com/redirect?dealID=${dealID}`;
}

function mapDeal(d: CheapSharkDeal) {
  const sale = Number(d.salePrice);
  const full = Number(d.normalPrice);
  const savings = Number(d.savings);
  const store = STORE_NAMES[d.storeID] || d.storeID || "unknown";
  const slug = (d.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    id: d.dealID,
    title: d.title,
    slug,
    store,
    storeId: d.storeID,
    salePrice: sale,
    fullPrice: full,
    discountPct: Math.round(savings), // comodo da mostrare
    savings,                          // grezzo (xx.xx)
    url: buildAffiliateUrl(store, slug, d.steamAppID, d.dealID),
    thumb: d.thumb || null,
  };
}

async function fetchDeals(params: {
  q?: string;
  store?: string;
  sort?: "best" | "savings" | "priceLow" | "priceHigh" | "alpha";
  page: number;
  size: number;
  minSavings?: number;
  maxPrice?: number;
}) {
  const url = new URL(`${CHEAPSHARK_BASE}/deals`);
  // usa upperPrice alto ma permetti filtro successivo lato server
  url.searchParams.set("upperPrice", String(Math.min(Math.max(params.maxPrice ?? 200, 1), 999)));
  url.searchParams.set("pageSize", "120");   // batch ampio per filtrare/ordinare
  url.searchParams.set("sortBy", "Savings"); // base

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

  // filtro minSavings / maxPrice (se impostati)
  if (typeof params.minSavings === "number") {
    arr = arr.filter((x) => x.savings >= params.minSavings!);
  }
  if (typeof params.maxPrice === "number") {
    arr = arr.filter((x) => x.salePrice <= params.maxPrice!);
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
      // già ragionato su Savings
      break;
  }

  const count = arr.length;
  const size = Math.min(60, Math.max(6, params.size));
  const page = Math.max(1, params.page);
  const start = (page - 1) * size;
  const end = start + size;

  return { page, size, count, items: arr.slice(start, end) };
}

export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams;
    const q = sp.get("q") || undefined;
    const store = sp.get("store") || undefined;

    const sortParam = (sp.get("sort") || "best").toLowerCase();
    const sort = ["best", "savings", "pricelow", "pricehigh", "alpha"].includes(sortParam)
      ? (sortParam.replace("pricelow", "priceLow").replace("pricehigh", "priceHigh") as
          | "best"
          | "savings"
          | "priceLow"
          | "priceHigh"
          | "alpha")
      : "best";

    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const size = Math.min(60, Math.max(6, parseInt(sp.get("size") || "24", 10)));

    const minSavings = sp.get("minSavings");
    const maxPrice = sp.get("maxPrice");

    const data = await fetchDeals({
      q,
      store,
      sort,
      page,
      size,
      minSavings: minSavings ? Number(minSavings) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    return Response.json(data, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    console.error("[/api/deals] error:", e);
    return Response.json(
      { page: 1, size: 0, count: 0, items: [], error: "Deals API error" },
      { status: 500 }
    );
  }
}
