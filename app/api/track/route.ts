export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";

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

    if (!/^https?:\/\//i.test(url)) {
      return new Response("Invalid url", { status: 400 });
    }

    console.log("Affiliate click:", {
      url,
      store,
      dealID,
      ts: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for") || "unknown",
      ua: req.headers.get("user-agent") || "unknown",
    });

    // ✅ Redirect corretto
    return new Response(null, {
      status: 302,
      headers: {
        Location: url,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    console.error("[/api/track] error:", e);
    return new Response("Tracking error", { status: 500 });
  }
}
