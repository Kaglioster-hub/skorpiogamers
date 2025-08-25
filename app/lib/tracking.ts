// app/lib/tracking.ts

/**
 * Costruisce un link tracciato che passa dall'API /api/track
 * così da loggare i click di affiliazione.
 */
export function buildTracked(url: string, store: string, dealID: string) {
  if (!url) return "#";

  return `/api/track?url=${encodeURIComponent(url)}&store=${encodeURIComponent(
    store
  )}&dealID=${encodeURIComponent(dealID)}`;
}
