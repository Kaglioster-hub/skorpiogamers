import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sg.vrabo.it";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",          // non serve far indicizzare le API
          "/_next/",        // build assets
          "/private/",      // eventuali pagine non pubbliche
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
