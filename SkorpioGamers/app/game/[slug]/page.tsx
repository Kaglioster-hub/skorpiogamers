"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function slugToTitle(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
const fmtCur = (c: string) => new Intl.NumberFormat("it-IT", { style: "currency", currency: c });

export default function GamePage({ params }: { params: { slug: string } }) {
  const sp = useSearchParams();
  const hintTitle = sp.get("title") || "";
  const [data, setData] = useState<any>(null);
  const [hist, setHist] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const title = hintTitle || slugToTitle(params.slug);

  // Carica dettagli gioco
  useEffect(() => {
    (async () => {
      setBusy(true);
      try {
        const r = await fetch(`/api/game?title=${encodeURIComponent(title)}`, { cache: "no-store" });
        const j = await r.json();
        setData(j);
      } catch {
        setData(null);
      } finally {
        setBusy(false);
      }
    })();
  }, [title]);

  // Carica storico prezzi
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/history?title=${encodeURIComponent(title)}`, { cache: "no-store" });
        const j = await r.json();
        setHist(Array.isArray(j) ? j : []);
      } catch {
        setHist([]);
      }
    })();
  }, [title]);

  // Aggiungi a wishlist
  function addWishlist() {
    try {
      const w = JSON.parse(localStorage.getItem("skg:wishlist") || "[]");
      const row = {
        title: data?.title || title,
        price: data?.current?.price || 0,
        store: data?.current?.shop || "store",
        url: data?.current?.url || "",
        when: new Date().toISOString().slice(0, 10),
      };
      const dedup = [row, ...w.filter((x: any) => (x.title || "") !== row.title)];
      localStorage.setItem("skg:wishlist", JSON.stringify(dedup));
      alert("⭐ Aggiunto alla wishlist!");
    } catch {}
  }

  // Link di acquisto con tracking
  function buyLink() {
    const u = data?.current?.url;
    return u ? `/api/track?url=${encodeURIComponent(u)}&partner=SKORPIO` : "#";
  }

  // Monta grafico storico
  useEffect(() => {
    (async function ensureChart() {
      if (!document.getElementById("histChart")) return;
      if (!(window as any).Chart) {
        await new Promise((res) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/chart.js";
          s.onload = res;
          document.body.appendChild(s);
        });
      }
      const el = document.getElementById("histChart") as HTMLCanvasElement;
      const prices = hist.map((h) => h.price);
      const labels = hist.map((h) => h.shop || "");
      if (prices.length && (window as any).Chart) {
        // @ts-ignore
        new (window as any).Chart(el.getContext("2d"), {
          type: "bar",
          data: { labels, datasets: [{ label: "Prezzi snapshot", data: prices, backgroundColor: "#2afadf" }] },
          options: {
            plugins: { legend: { labels: { color: "#fff" } } },
            scales: {
              x: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,.1)" } },
              y: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,.1)" } },
            },
          },
        });
      } else {
        el.outerHTML = `<p class="muted">Storico non disponibile.</p>`;
      }
    })();
  }, [hist]);

  const currency = data?.current?.currency || "USD";

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      <a href="/" className="ghost" style={{ marginBottom: 12, display: "inline-block" }}>
        ⟵ Torna
      </a>

      <h1 style={{ fontSize: "1.8rem", margin: "6px 0 6px" }}>{data?.title || title}</h1>
      <p className="muted" style={{ marginBottom: 12 }}>
        Lowest ever:{" "}
        {data?.lowest?.price ? fmtCur(currency).format(data.lowest.price) : "—"}{" "}
        {data?.lowest?.date ? `(${new Date(data.lowest.date * 1000).toLocaleDateString("it-IT")})` : ""}
      </p>

      {busy && <div className="skeleton"></div>}

      {!busy && data && (
        <section className="card" style={{ padding: 12 }}>
          <div className="price" style={{ fontSize: "1.3rem" }}>
            Prezzo attuale:{" "}
            {data?.current?.price ? fmtCur(currency).format(data.current.price) : "—"}{" "}
            {data?.current?.cut ? (
              <span className="pill" style={{ marginLeft: 8 }}>
                -{Math.round(data.current.cut)}%
              </span>
            ) : null}
          </div>

          <div className="actionsRow" style={{ marginTop: 8 }}>
            <a className="button" href={buyLink()} target="_blank" rel="noopener">
              Compra
            </a>
            <button className="sm" onClick={addWishlist}>
              ⭐ Wishlist
            </button>
            <button
              className="sm"
              onClick={() => {
                navigator.clipboard?.writeText(location.href);
                alert("Link copiato!");
              }}
            >
              🔗 Condividi
            </button>
          </div>
        </section>
      )}

      <h2 className="h1" style={{ margin: "16px 0 8px" }}>
        📈 Storico prezzi / Shop
      </h2>
      <div className="chart-wrap">
        <canvas id="histChart" height={140}></canvas>
      </div>

      <h2 className="h1" style={{ margin: "16px 0 8px" }}>
        🔎 Offerte correnti
      </h2>
      <div className="grid">
        {(data?.stores || []).map((s: any, i: number) => (
          <article key={i} className="card">
            <div className="body">
              <h3 className="title">{s.shop?.name || s.shop || "Shop"}</h3>
              <div className="price">
                {s.price ? fmtCur(currency).format(s.price) : "—"}{" "}
                {s.cut ? (
                  <span className="pill" style={{ marginLeft: 8 }}>
                    -{Math.round(s.cut)}%
                  </span>
                ) : null}
              </div>
              {s.url && (
                <a
                  className="button"
                  href={`/api/track?url=${encodeURIComponent(s.url)}&partner=SKORPIO`}
                  target="_blank"
                  rel="noopener"
                >
                  Vai allo shop
                </a>
              )}
            </div>
          </article>
        ))}
        {!data?.stores?.length && <div className="muted">Nessuna offerta alternativa.</div>}
      </div>
    </main>
  );
}
