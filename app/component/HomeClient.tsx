"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Deal = {
  title: string;
  salePrice: number;
  fullPrice: number;
  savings: number;
  url: string;
  thumb: string | null;
  store: string;
  slug: string;
};

type DealsResponse = {
  page: number;
  size: number;
  count: number;
  items: Deal[];
  error?: string;
};

const fmt = (n?: number) =>
  n == null || Number.isNaN(n) ? "—" : `${n.toFixed(2)}$`;

export default function HomeClient() {
  const [q, setQ] = useState("");
  const [store, setStore] = useState("");
  const [sort, setSort] = useState("best");
  const [size, setSize] = useState(24);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const pagerRef = useRef<HTMLDivElement | null>(null);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("size", String(size));
    p.set("sort", sort);
    if (q) p.set("q", q);
    if (store) p.set("store", store);
    return p.toString();
  }, [q, store, sort, size, page]);

  async function fetchDeals() {
    if (loading) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/deals?${qs}`, { cache: "no-store" });
      const j: DealsResponse = await r.json();
      setCount(j.count);
      setItems(j.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDeals();
  }, [qs]);

  const nowISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function saveClick(url: string) {
    try {
      const raw = localStorage.getItem("skg:clicks") || "{}";
      const data = JSON.parse(raw) as Record<string, number>;
      data[url] = (data[url] || 0) + 1;
      localStorage.setItem("skg:clicks", JSON.stringify(data));
    } catch {}
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      {/* Toolbar */}
      <section
        className="searchbar"
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "1fr auto auto auto auto",
        }}
      >
        <input
          className="input"
          placeholder="🔍 Cerca un gioco…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="select" value={store} onChange={(e) => setStore(e.target.value)}>
          <option value="">Tutti</option>
          <option value="steam">Steam</option>
          <option value="epic">Epic</option>
          <option value="gog">GOG</option>
          <option value="humble">Humble</option>
        </select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="best">Miglior sconto</option>
          <option value="savings">Risparmio %</option>
          <option value="priceLow">Prezzo ↑</option>
          <option value="priceHigh">Prezzo ↓</option>
          <option value="alpha">A-Z</option>
        </select>
        <select className="select" value={String(size)} onChange={(e) => setSize(parseInt(e.target.value, 10))}>
          <option>12</option>
          <option>24</option>
          <option>36</option>
          <option>48</option>
        </select>
        <button
          className="ghost"
          onClick={() => {
            setQ("");
            setStore("");
            setSort("best");
            setSize(24);
            setPage(1);
          }}
        >
          Reset
        </button>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span className="muted">{count} risultati</span>
        <span className="muted">
          Ultimo update: <time>{nowISO}</time>
        </span>
      </div>

      {/* Grid */}
      <h2 className="section-title" style={{ marginTop: 16 }}>🔥 Offerte</h2>
      <div className="grid" aria-live="polite" aria-busy={loading}>
        {loading && !items.length
          ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton" />)
          : items.map((d, i) => {
              const href = `/api/track?url=${encodeURIComponent(d.url)}`;
              return (
                <article key={d.slug + i} className="card" tabIndex={0}>
                  <div className="card-media" style={{ position: "relative" }}>
                    <img
                      src={d.thumb || "/assets/placeholder.png"}
                      alt={`Copertina ${d.title}`}
                      loading="lazy"
                    />
                    <div className="badge">-{Math.round(d.savings)}%</div>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{d.title}</h3>
                    <div className="pill">{d.store.toUpperCase()}</div>
                    <div className="price">
                      {fmt(d.salePrice)}{" "}
                      {d.fullPrice ? (
                        <span
                          className="muted"
                          style={{ marginLeft: 6, textDecoration: "line-through" }}
                        >
                          {fmt(d.fullPrice)}
                        </span>
                      ) : null}
                    </div>
                    <a
                      className="button"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => saveClick(d.url)}
                    >
                      Compra
                    </a>
                  </div>
                </article>
              );
            })}
      </div>
      <div ref={pagerRef} className="pager" style={{ marginTop: 20 }} />
    </main>
  );
}
