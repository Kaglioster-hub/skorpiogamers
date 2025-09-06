"use client";
import { STORES } from "../constants";

type ToolbarProps = {
  query: string;
  setQuery: (v: string) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  minDiscount: number;
  setMinDiscount: (v: number) => void;
  sort: "best" | "price" | "discount" | "title";
  setSort: (v: "best" | "price" | "discount" | "title") => void;
  activeStores: number[];
  toggleStore: (id: number) => void;
  total: number;
  currentPage: number;
  totalPages: number;
};

export default function Toolbar({
  query, setQuery, maxPrice, setMaxPrice, minDiscount, setMinDiscount,
  sort, setSort, activeStores, toggleStore, total, currentPage, totalPages
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search */}
        <div className="col-span-1 md:col-span-2 relative">
          <label htmlFor="search" className="block text-sm muted mb-1 font-semibold">Cerca titolo</label>
          <input
            id="search"
            className="input pr-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Es. Alan Wake, Deponia…"
            aria-label="Cerca per titolo"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-[46px] -translate-y-1/2 text-gray-400 hover:text-red-400"
              aria-label="Reset search"
              title="Pulisci"
            >✖</button>
          )}
        </div>

        {/* Prezzo max */}
        <div>
          <label className="block text-sm muted mb-1 font-semibold">
            Prezzo massimo: <span className="text-cyan-400">€{maxPrice}</span>
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
            Sconto minimo: <span className="text-pink-400">{minDiscount}%</span>
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
        <div className="chips">
          <span className="text-sm muted mr-2">Store:</span>
          {STORES.map((s) => {
            const active = activeStores.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleStore(s.id)}
                className={`chip ${active ? "is-active" : ""}`}
                style={ active ? { color: s.color, borderColor: s.color } : {} }
                aria-pressed={active}
              >
                {s.name}
              </button>
            );
          })}
        </div>

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

        <p className="text-sm muted">
          {total} risultati • pagina {currentPage}/{totalPages}
        </p>
      </div>
    </div>
  );
}
