"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* =======================
   Types
======================= */
type Deal = {
  dealID: string;
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  thumb: string;
  storeID?: string;
};

type StoreMeta = { id: number; key: string; name: string; color: string };

/* =======================
   Costanti / Utils
======================= */
const STORES: StoreMeta[] = [
  { id: 1, key: "steam", name: "Steam", color: "#00adee" },
  { id: 7, key: "gog", name: "GOG", color: "#a788ff" },
  { id: 11, key: "humble", name: "Humble", color: "#ff6b6b" },
  { id: 25, key: "epic", name: "Epic", color: "#ffffff" },
];

const toNum = (v: string | number) =>
  typeof v === "string" ? parseFloat(v) : v;

const fmtPrice = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SKELETON = Array.from({ length: 12 }, (_, i) => i);

// migliora i thumb Steam con header hi-res
function getHiResThumb(thumbUrl: string): string {
  try {
    const m = thumbUrl.match(/steam\/apps\/(\d+)\//i);
    if (m?.[1])
      return `https://cdn.cloudflare.steamstatic.com/steam/apps/${m[1]}/header.jpg`;
  } catch {}
  return thumbUrl;
}

// debounce leggero
function useDebounced<T>(value: T, delay = 180) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return deb;
}

/* =======================
   Pagina
======================= */
export default function Home() {
  // dati
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtri
  const [query, setQuery] = useState("");
  const qDeb = useDebounced(query);
  const [maxPrice, setMaxPrice] = useState(30);
  const [minDiscount, setMinDiscount] = useState(50);
  const [sort, setSort] =
    useState<"best" | "price" | "discount" | "title">("best");

  // store selezionati
  const [activeStores, setActiveStores] = useState<number[]>(
    STORES.map((s) => s.id)
  );

  // paginazione
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  // fetch multi-store con AbortController
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const urls = STORES.map(
          (s) =>
            `https://www.cheapshark.com/api/1.0/deals?storeID=${s.id}&upperPrice=60&pageSize=60`
        );

        const res = await Promise.all(
          urls.map((u) => fetch(u, { signal: controller.signal }))
        );
        const json = await Promise.all(res.map((r) => (r.ok ? r.json() : [])));

        const merged: Deal[] = json
          .flat()
          .map((d: any) => ({
            ...d,
            storeID: d.storeID ?? String(d.storeID ?? 0),
          }))
          .filter((d: Deal) => d.dealID && d.title);

        setDeals(merged);
      } catch (e) {
        if (!(e instanceof DOMException)) {
          console.error(e);
          setErr("Errore nel caricamento delle offerte dai vari store.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  // derivati: filtro + sort
  const filtered = useMemo(() => {
    let list = deals
      .filter((d) => activeStores.includes(parseInt(d.storeID ?? "0")))
      .filter((d) => toNum(d.salePrice) <= maxPrice)
      .filter((d) => Math.round(toNum(d.savings)) >= minDiscount);

    if (qDeb.trim()) {
      const q = qDeb.trim().toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q));
    }

    switch (sort) {
      case "price":
        list.sort((a, b) => toNum(a.salePrice) - toNum(b.salePrice));
        break;
      case "discount":
        list.sort((a, b) => toNum(b.savings) - toNum(a.savings));
        break;
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        list.sort(
          (a, b) =>
            toNum(b.savings) * 1.5 -
            toNum(b.salePrice) -
            (toNum(a.savings) * 1.5 - toNum(a.salePrice))
        );
    }
    return list;
  }, [deals, qDeb, maxPrice, minDiscount, sort, activeStores]);

  // paginazione
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [qDeb, maxPrice, minDiscount, sort, activeStores]);

  const toggleStore = (id: number) =>
    setActiveStores((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* ========= HERO ========= */}
      <section className="relative text-center px-6 pt-20 pb-10 md:pt-24 md:pb-12 overflow-hidden">
        {/* bg blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,200,0.10),_transparent_70%)] animate-pulse" />
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-gradient-to-r from-pink-600/35 to-cyan-500/35 rounded-full blur-3xl animate-spin-slow" />
          <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-title font-extrabold tracking-tight"
        >
          ⚡ SkorpioGamers 3050
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="hero-subtitle"
        >
          Offerte reali da{" "}
          <span className="font-semibold" style={{ color: "var(--primary)" }}>
            Steam
          </span>
          ,{" "}
          <span className="font-semibold" style={{ color: "#a788ff" }}>
            GOG
          </span>
          ,{" "}
          <span className="font-semibold" style={{ color: "#ff6b6b" }}>
            Humble
          </span>
          , <span className="font-semibold">Epic</span> — live, cyberpunk e
          pronte a farti risparmiare.
        </motion.p>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link href="/trending" className="btn btn-primary max-w-[220px]">
            🔥 Offerte Top
          </Link>
          <Link
            href="/newsletter"
            className="btn btn-secondary max-w-[220px]"
          >
            💌 Newsletter
          </Link>
        </div>
      </section>

      {/* ========= TOOLBAR FILTRI ========= */}
      <section className="container">
        <div className="toolbar">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="col-span-1 md:col-span-2">
              <label
                htmlFor="search"
                className="block text-sm muted mb-1 font-semibold"
              >
                Cerca titolo
              </label>
              <input
                id="search"
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Es. Alan Wake, Deponia…"
                aria-label="Cerca per titolo"
              />
            </div>

            {/* Prezzo max */}
            <div>
              <label className="block text-sm muted mb-1 font-semibold">
                Prezzo massimo:{" "}
                <span className="text-cyan-400">${fmtPrice(maxPrice)}</span>
              </label>
              <input
                className="range"
                type="range"
                min={1}
                max={60}
                step={1}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              />
            </div>

            {/* Sconto minimo */}
            <div>
              <label className="block text-sm muted mb-1 font-semibold">
                Sconto minimo:{" "}
                <span className="text-pink-400">{minDiscount}%</span>
              </label>
              <input
                className="range"
                type="range"
                min={0}
                max={100}
                step={5}
                value={minDiscount}
                onChange={(e) => setMinDiscount(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Stores + sort */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Stores */}
            <div className="chips">
              <span className="text-sm muted mr-2">Store:</span>
              {STORES.map((s) => {
                const active = activeStores.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleStore(s.id)}
                    className={`chip ${active ? "is-active" : ""}`}
                    style={
                      active ? { color: s.color, borderColor: s.color } : {}
                    }
                    aria-pressed={active}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm muted">Ordina per</span>
              {[
                { k: "best", label: "Migliori" },
                { k: "discount", label: "Sconto" },
                { k: "price", label: "Prezzo" },
                { k: "title", label: "Titolo" },
              ].map((o) => (
                <button
                  key={o.k}
                  onClick={() => setSort(o.k as any)}
                  className={`sort-btn ${sort === o.k ? "is-active" : ""}`}
                  aria-pressed={sort === o.k}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* Count */}
            <p className="text-sm muted">
              {filtered.length} risultati • pagina {currentPage}/{totalPages}
            </p>
          </div>
        </div>
      </section>

      {/* ========= GRID ========= */}
      <section className="container py-10">
        <h2 className="section-title">🎮 Top Offerte Live</h2>

        {/* Loading */}
        {loading && (
          <div className="grid-cards">
            {SKELETON.map((i) => (
              <div key={i} className="card-glow skeleton">
                <div className="card-media skeleton" />
                <div className="p-4">
                  <div className="skeleton h-5 w-3/4 mb-3" />
                  <div className="skeleton h-4 w-1/2 mb-2" />
                  <div className="skeleton h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {err && !loading && (
          <div className="text-center">
            <p className="text-red-400 mb-3">{err}</p>
            <button
              onClick={() => location.reload()}
              className="sort-btn px-4 py-2"
            >
              Riprova
            </button>
          </div>
        )}

        {/* Vuoto */}
        {!loading && !err && filtered.length === 0 && (
          <p className="text-center muted">
            Nessuna offerta con i filtri selezionati.
          </p>
        )}

        {/* Cards */}
        {!loading && !err && filtered.length > 0 && (
          <>
            <div className="grid-cards">
              {pageItems.map((deal, i) => {
                const sale = toNum(deal.salePrice);
                const normal = toNum(deal.normalPrice);
                const discount = Math.round(toNum(deal.savings));
                const sid = parseInt(deal.storeID ?? "0");
                const store = STORES.find((s) => s.id === sid);
                const img = getHiResThumb(deal.thumb);

                return (
                  <motion.a
                    key={`${deal.dealID}-${sid}-${i}`}
                    href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -4 }}
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 22,
                    }}
                    className="card-glow"
                    aria-label={`${deal.title} su ${
                      store?.name ?? "Store"
                    }: -${discount}% a $${fmtPrice(sale)}`}
                  >
                    <span className="badge">#{start + i + 1}</span>
                    {store && (
                      <span
                        className="badge-store"
                        style={{ color: store.color }}
                      >
                        {store.name}
                      </span>
                    )}

                    <div className="card-media">
                      <img src={img} alt={deal.title} />
                      <div className="discount">-{discount}%</div>
                    </div>

                    <div className="card-body">
                      <h3 className="card-title">{deal.title}</h3>
                      <div className="price">
                        <span className="sale">${fmtPrice(sale)}</span>
                        <span className="normal">${fmtPrice(normal)}</span>
                      </div>
                      <span className="btn btn-primary">🚀 Vai allo Store</span>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="sort-btn px-3 py-1"
                >
                  ← Indietro
                </button>
                <span className="text-sm muted">
                  Pagina {currentPage} di {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="sort-btn px-3 py-1"
                >
                  Avanti →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ========= CTA ========= */}
      <section className="section-dark text-center py-16">
        <h3 className="text-2xl font-bold">💌 Non perdere i super sconti</h3>
        <p className="muted mt-2">
          Ricevi ogni giorno{" "}
          <span className="text-cyan-400 font-semibold">
            20 offerte esclusive
          </span>{" "}
          nella tua email.
        </p>
        <Link
          href="/newsletter"
          className="btn btn-secondary mt-6 inline-block"
        >
          Iscriviti gratis
        </Link>
      </section>

      {/* ========= FOOTER ========= */}
      <footer>
        <div className="container text-center">
          <div className="flex justify-center gap-6 mb-3">
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              🐦 Twitter
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              💻 GitHub
            </a>
            <a href="https://t.me" target="_blank" rel="noreferrer">
              📢 Telegram
            </a>
          </div>
          <p>⚡ SkorpioGamers 3050 — Made with ❤️ by Davide</p>
        </div>
      </footer>
    </main>
  );
}
