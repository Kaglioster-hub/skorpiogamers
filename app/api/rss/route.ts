export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge"; // opzionale ma ok per te


function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sg.vrabo.it";

  try {
    const r = await fetch(`${base}/api/deals?limit=20`, { cache: "no-store" });
    const items = (await r.json()) || [];
    const now = new Date().toUTCString();

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>SkorpioGamers — Top 20 Offerte</title>
  <link>${base}</link>
  <description>Le 20 offerte migliori del momento</description>
  <lastBuildDate>${now}</lastBuildDate>
  ${items
    .map((d: any) => {
      const slug = slugify(d.title || "gioco");
      const link = `${base}/game/${slug}?title=${encodeURIComponent(
        d.title || ""
      )}`;
      return `<item>
  <title><![CDATA[${d.title} — ${d.salePrice}$ (-${Math.round(
        d.savings
      )}% )]]></title>
  <link>${link}</link>
  <guid isPermaLink="false">${slug}-${Math.round(d.salePrice * 100)}</guid>
  <description><![CDATA[Store: ${(d.store || "").toUpperCase()} • Prezzo: ${
        d.salePrice
      } USD • Sconto: ${Math.round(d.savings)}%]]></description>
</item>`;
    })
    .join("\n")}
</channel>
</rss>`;

    return new Response(rss, {
      headers: { "content-type": "application/rss+xml; charset=utf-8" },
    });
  } catch (e) {
    console.error("Errore RSS:", e);
    return new Response("<?xml version='1.0'?><rss><channel></channel></rss>", {
      headers: { "content-type": "application/rss+xml; charset=utf-8" },
    });
  }
}
