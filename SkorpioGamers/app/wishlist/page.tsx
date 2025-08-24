"use client";
import React, { useEffect, useState } from "react";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);

  // carica da localStorage
  useEffect(() => {
    try {
      const w = JSON.parse(localStorage.getItem("skg:wishlist") || "[]");
      setItems(Array.isArray(w) ? w : []);
    } catch {
      setItems([]);
    }
  }, []);

  function remove(i: number) {
    const updated = items.filter((_, idx) => idx !== i);
    setItems(updated);
    localStorage.setItem("skg:wishlist", JSON.stringify(updated));
  }

  function clear() {
    if (!confirm("Vuoi svuotare la wishlist?")) return;
    setItems([]);
    localStorage.removeItem("skg:wishlist");
  }

  function exportCSV() {
    const header = "Titolo,Prezzo,Store,URL,Data\n";
    const rows = items
      .map(
        (x) =>
          `"${x.title}","${x.price}","${x.store}","${x.url}","${x.when || ""}"`
      )
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wishlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 12 }}>⭐ Wishlist</h1>

      {!items.length && <p className="muted">Nessun gioco salvato.</p>}

      {items.length > 0 && (
        <>
          <div style={{ marginBottom: 12 }}>
            <button className="button sm" onClick={exportCSV}>
              ⬇️ Esporta CSV
            </button>
            <button className="button sm ghost" onClick={clear}>
              🗑️ Svuota
            </button>
          </div>

          <div className="grid">
            {items.map((x, i) => (
              <article key={i} className="card">
                <div className="card-body">
                  <h3 className="card-title">{x.title}</h3>
                  <p className="price">
                    {x.price ? `${x.price}$` : "—"}{" "}
                    <span className="pill">{x.store}</span>
                  </p>
                  <div className="actionsRow">
                    {x.url && (
                      <a
                        className="button sm"
                        href={`/api/track?url=${encodeURIComponent(
                          x.url
                        )}&partner=SKORPIO`}
                        target="_blank"
                        rel="noopener"
                      >
                        Compra
                      </a>
                    )}
                    <button className="sm ghost" onClick={() => remove(i)}>
                      Rimuovi
                    </button>
                  </div>
                  <small className="muted">
                    Aggiunto il {x.when || "?"}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
