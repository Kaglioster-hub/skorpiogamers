"use client";
import { useEffect, useMemo, useState } from "react";
import Toolbar from "./components/Toolbar";
import GameCard, { Deal } from "./components/GameCard";
import { STORES } from "./constants";
import LiveAudioPlayer from "./components/LiveAudioPlayer";

const SKELETON = Array.from({ length: 12 }, (_, i) => i);

function useDebounced<T>(value: T, delay = 180) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return deb;
}

function getHiResThumb(thumbUrl: string): string {
  try {
    const m = thumbUrl?.match(/steam\/apps\/(\d+)\//i);
    if (m?.[1]) return `https://cdn.cloudflare.steamstatic.com/steam/apps/${m[1]}/header.jpg`;
  } catch {}
  return thumbUrl;
}

export default function Home() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const qDeb = useDebounced(query);
  const [maxPrice, setMaxPrice] = useState(30);
  const [minDiscount, setMinDiscount] = useState(50);
  const [sort, setSort] = useState<"best" | "price" | "discount" | "title">("best");
  const [activeStores, setActiveStores] = useState<number[]>(STORES.map(s => s.id));

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const urls = STORES.map(
          (s) => `https://www.cheapshark.com/api/1.0/deals?storeID=${s.id}&upperPrice=60&pageSize=60`
        );
        const res = await Promise.all(urls.map((u) => fetch(u, { signal: controller.signal })));
        const json = await Promise.all(res.map((r) => (r.ok ? r.json() : [])));

        const merged: Deal[] = json
          .flat()
          .map((d: any) => ({
            title: d.title,
            salePrice: parseFloat(d.salePrice),
            fullPrice: parseFloat(d.normalPrice),
            savings: parseFloat(d.savings),
            url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
            thumb: getHiResThumb(d.thumb),
            store: STORES.find((s) => s.id === parseInt(d.storeID))?.name ?? "Store",
            slug: d.dealID,
          }))
          .filter((d: Deal) => d.title && d.salePrice > 0);

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

  const filtered = useMemo(() => {
    let list = deals
      .filter((d) => {
        const sid = STORES.find((s) => s.name === d.store)?.id ?? 0;
        return activeStores.includes(sid);
      })
      .filter((d) => d.salePrice <= maxPrice)
      .filter((d) => Math.round(d.savings) >= minDiscount);

    if (qDeb.trim()) {
      const q = qDeb.trim().toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q));
    }

    switch (sort) {
      case "price": list.sort((a, b) => a.salePrice - b.salePrice); break;
      case "discount": list.sort((a, b) => b.savings - a.savings); break;
      case "title": list.sort((a, b) => a.title.localeCompare(b.title)); break;
      default:
        list.sort((a, b) => (b.savings * 1.5 - b.salePrice) - (a.savings * 1.5 - a.salePrice));
    }
    return list;
  }, [deals, qDeb, maxPrice, minDiscount, sort, activeStores]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  useEffect(() => { setPage(1); }, [qDeb, maxPrice, minDiscount, sort, activeStores]);

  const toggleStore = (id: number) =>
    setActiveStores(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <section className="text-center px-6 pt-16 md:pt-20 pb-6">
        <img src="/logo.svg" alt="SkorpioGamers 3050" className="logo" />
        <h1 className="hero-title">⚡ SkorpioGamers 3050</h1>
        <p className="hero-subtitle">
          Offerte reali da <span className="font-semibold" style={{color: "var(--primary)"}}>Steam</span>,{" "}
          <span className="font-semibold" style={{color: "#a788ff"}}>GOG</span>,{" "}
          <span className="font-semibold" style={{color: "#ff6b6b"}}>Humble</span>, Epic — live, cyberpunk e pronte a farti risparmiare.
        </p>
        <LiveAudioPlayer videoId="bWXl_C1UP54" />
      </section>

      <section className="container">
        <Toolbar
          query={query}
          setQuery={setQuery}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          minDiscount={minDiscount}
          setMinDiscount={setMinDiscount}
          sort={sort}
          setSort={setSort}
          activeStores={activeStores}
          toggleStore={toggleStore}
          total={filtered.length}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </section>

      <section className="container py-10">
        <h2 className="text-center text-xl font-bold mb-4">🎮 Top Offerte Live</h2>

        {loading && (
          <div className="grid-cards">
            {SKELETON.map((i) => <div key={i} className="card-glow skeleton h-[360px]" />)}
          </div>
        )}

        {err && !loading && (
          <div className="text-center">
            <p className="text-red-400 mb-3">{err}</p>
            <button onClick={() => location.reload()} className="sort-btn px-4 py-2">Riprova</button>
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <p className="text-center muted">Nessuna offerta con i filtri selezionati.</p>
        )}

        {!loading && !err && filtered.length > 0 && (
          <>
            <div className="grid-cards">
              {pageItems.map((deal, i) => (
                <GameCard key={`${deal.slug}-${i}`} deal={deal} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-3">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="sort-btn px-3 py-1">← Indietro</button>
                <span className="text-sm muted">Pagina {currentPage} di {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="sort-btn px-3 py-1">Avanti →</button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="text-center py-16">
        <h3 className="text-2xl font-bold">💌 Non perdere i super sconti</h3>
        <p className="muted mt-2">
          Ricevi ogni giorno <span className="text-cyan-400 font-semibold">20 offerte</span> nella tua email.
        </p>
        <a href="/newsletter" className="btn btn-secondary mt-6 inline-block">Iscriviti gratis</a>
      </section>
    </main>
  );
}


