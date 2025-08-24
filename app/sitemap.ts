export const runtime = "edge";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ✅ Sitemap dinamica compatibile con Next.js Metadata Route
export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sg.vrabo.it";

  const staticPages = [
    { url: `${base}/`, lastModified: new Date().toISOString(), changefreq: "hourly", priority: 1.0 },
    { url: `${base}/wishlist`, lastModified: new Date().toISOString(), changefreq: "daily", priority: 0.8 },
    { url: `${base}/trending`, lastModified: new Date().toISOString(), changefreq: "daily", priority: 0.7 },
    { url: `${base}/newsletter`, lastModified: new Date().toISOString(), changefreq: "weekly", priority: 0.5 }
  ];

  try {
    const r = await fetch(`${base}/api/deals?limit=50`, { cache: "no-store" });
    const items = (await r.json()) || [];

    const dynamic = items.map((d: any) => ({
      url: `${base}/game/${slugify(d.title || "gioco")}`,
      lastModified: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.9
    }));

    return [...staticPages, ...dynamic];
  } catch (e) {
    console.error("Errore sitemap:", e);
    return staticPages;
  }
}
