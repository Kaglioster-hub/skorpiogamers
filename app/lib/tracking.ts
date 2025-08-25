// app/lib/tracking.ts
export function buildTracked(url: string, store: string, dealID: string) {
  if (!url) return "#";
  const u = new URL("/api/track", typeof window !== "undefined" ? window.location.origin : "https://example.com");
  u.searchParams.set("url", url);
  u.searchParams.set("store", store || "unknown");
  u.searchParams.set("dealID", dealID || "n/a");
  return u.toString();
}
