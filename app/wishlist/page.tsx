"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Wish = {
  id: string;
  title: string;
  price: string;
  thumb: string;
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wish[]>([]);

  // Carica dal localStorage
  useEffect(() => {
    const stored = localStorage.getItem("wishlist");
    if (stored) setWishlist(JSON.parse(stored));
  }, []);

  // Salva ogni volta che cambia
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Rimuovi item
  const removeItem = (id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white px-6 py-16">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
          ⭐ La tua Wishlist
        </h1>
        <p className="mt-4 text-zinc-400">
          Qui trovi i giochi che hai salvato per non perderti mai un’offerta.
        </p>
      </motion.div>

      {/* LISTA */}
      {wishlist.length === 0 ? (
        <p className="text-center text-zinc-500">
          ❌ Nessun gioco ancora aggiunto. Vai nella sezione{" "}
          <span className="text-cyan-400 font-bold">Trending</span> e aggiungilo!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {wishlist.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 rounded-3xl shadow-lg overflow-hidden card-glow"
            >
              <img
                src={item.thumb}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="font-bold text-lg truncate">{item.title}</h3>
                <p className="text-emerald-400 font-semibold mt-2">
                  {item.price}$
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <a
                    href={`https://www.cheapshark.com/redirect?dealID=${item.id}`}
                    target="_blank"
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition"
                  >
                    🚀 Vai allo Store
                  </a>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 transition"
                  >
                    ❌ Rimuovi
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
