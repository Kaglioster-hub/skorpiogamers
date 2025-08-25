/* app/lib/tracking.ts */
export function buildTracked(url: string, store: string, dealID: string) {
  if (!url) return "#";
  return `/api/track?url=${encodeURIComponent(url)}&store=${encodeURIComponent(store)}&dealID=${encodeURIComponent(dealID)}`;
}
