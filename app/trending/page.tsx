"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Deal = {
  dealID: string;
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  thumb: string;
};

export default function Trending() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "50" | "70">("all");

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch(
          "https://www.cheapshark.com/api/1.0/deals?storeID=1&sortBy=Deal%20Rating&pageSize=12"
        );
        const data = await res.json();
        setDeals(data);
      } catch (err) {
        console.error("Errore fetch trending:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  // Filtro locale sugli sconti
  const filteredDeals = deals.filter((d) => {
    if (filter === "50") return Number(d.savings) >= 50;
    if (filter === "70") return Number(d.savings) >= 70;
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      {/* HERO */}
      <section className="text-center py-20">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
        >
          🔥 Offerte Trending
        </motion.h1>
        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
          Qui trovi le offerte con il punteggio più alto, aggiornate in tempo
          reale. Filtra per sconti epici e scopri subito cosa conviene.
        </p>

        {/* Filtri */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              filter === "all"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            Tutti
          </button>
          <button
            onClick={() => setFilter("50")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              filter === "50"
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            -50% o più
          </button>
          <button
            onClick={() => setFilter("70")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              filter === "70"
                ? "bg-gradient-to-r from-pink-500 to-purple-500"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            -70% o più
          </button>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <p className="text-center text-zinc-400">
            ⏳ Caricamento offerte trending...
          </p>
        ) : filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredDeals.map((deal, i) => (
              <motion.div
                key={deal.dealID}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 rounded-3xl shadow-xl overflow-hidden card-glow"
              >
                {/* Posizione */}
                <span className="absolute top-3 left-3 bg-pink-500/80 text-black font-bold px-3 py-1 rounded-full text-sm">
                  #{i + 1}
                </span>

                {/* Thumbnail */}
                <img
                  src={deal.thumb}
                  alt={deal.title}
                  className="w-full h-44 object-cover group-hover:opacity-90 transition"
                />

                {/* Body */}
                <div className="p-6">
                  <h3 className="font-bold text-lg truncate">{deal.title}</h3>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xl font-bold text-emerald-400">
                      {deal.salePrice}$
                    </span>
                    <span className="line-through text-zinc-500">
                      {deal.normalPrice}$
                    </span>
                  </div>
                  <p className="text-sm text-pink-400 mt-1">
                    -{Math.round(Number(deal.savings))}% di sconto
                  </p>
                  <a
                    href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
                    target="_blank"
                    className="mt-5 inline-block w-full text-center px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 transition font-semibold"
                  >
                    🚀 Vai allo Store
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-red-400">
            ❌ Nessuna offerta trending trovata
          </p>
        )}
      </section>
    </main>
  );
}
