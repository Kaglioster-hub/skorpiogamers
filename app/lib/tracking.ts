// app/lib/tracking.ts

/**
 * Costruisce un link tracciato che passa per /api/track
 */
export function buildTracked(url: string, store: string, dealID: string) {
  return `/api/track?url=${encodeURIComponent(url)}&store=${encodeURIComponent(store)}&dealID=${encodeURIComponent(dealID)}`;
}
