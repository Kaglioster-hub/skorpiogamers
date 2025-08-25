export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge"; // opzionale ma ok per te
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const url = sp.get("url");
    const store = sp.get("store") || "unknown";
    const dealID = sp.get("dealID") || "n/a";

    if (!url) {
      return new Response("Missing url", { status: 400 });
    }

    // Basic check (evita open redirect malevoli)
    if (!/^https?:\/\//i.test(url)) {
      return new Response("Invalid url", { status: 400 });
    }

    // Qui puoi salvare i click su DB, Supabase, Planetscale o anche un file JSON
    console.log("Affiliate click:", {
      url,
      store,
      dealID,
      ts: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for") || "unknown",
      ua: req.headers.get("user-agent") || "unknown",
    });

    return Response.redirect(url, 302, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    console.error("[/api/track] error:", e);
    return new Response("Tracking error", { status: 500 });
  }
}
