"use client";

import "./global.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  // Carica tema persistito
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") setDarkMode(false);
  }, []);

  // Applica tema e persiste
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <html
      lang="it"
      className={`${darkMode ? "dark" : ""} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="font-sans transition-colors duration-500 bg-white text-black dark:bg-black dark:text-white">
        
        {/* NAVBAR */}
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="sticky top-0 z-50 border-b backdrop-blur-xl 
                     bg-white/70 border-zinc-200 
                     dark:bg-black/70 dark:border-zinc-800
                     shadow-md"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3 md:py-4">
            
            {/* Logo + Titolo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <motion.img
                src="/logo.png"
                alt="SkorpioGamers logo"
                className="h-9 w-auto sm:h-10 object-contain transition-transform"
                whileHover={{ rotate: -8, scale: 1.05 }}
              />
              <span className="text-lg sm:text-xl md:text-2xl font-extrabold 
                               bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 
                               bg-clip-text text-transparent dark:drop-shadow">
                SkorpioGamers 3050
              </span>
            </Link>

            {/* Menu */}
            <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
              <Link
                href="/wishlist"
                className="hover:text-cyan-600 dark:hover:text-cyan-300 transition"
              >
                ⭐ Wishlist
              </Link>
              <Link
                href="/trending"
                className="hover:text-pink-600 dark:hover:text-pink-300 transition"
              >
                🔥 Trending
              </Link>
              <Link
                href="/newsletter"
                className="hover:text-purple-600 dark:hover:text-purple-300 transition"
              >
                💌 Newsletter
              </Link>

              {/* Toggle Dark/Light */}
              <motion.button
                aria-label="Cambia tema"
                whileTap={{ scale: 0.9, rotate: 90 }}
                onClick={() => setDarkMode((v) => !v)}
                className="ml-2 px-3 py-2 rounded-xl font-bold shadow-md transition 
                           bg-gradient-to-r from-yellow-200 to-yellow-400 text-black 
                           hover:shadow-yellow-500/40 
                           dark:from-zinc-800 dark:to-zinc-700 dark:text-yellow-300"
              >
                {darkMode ? "🌙" : "☀️"}
              </motion.button>
            </div>
          </div>
        </motion.nav>

        {/* MAIN con transizioni */}
        <LayoutGroup>
          <AnimatePresence mode="wait">
            <motion.main
              key={typeof window !== "undefined" ? window.location.pathname : "page"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </LayoutGroup>

        {/* FOOTER */}
        <footer className="py-10 mt-16 border-t text-center text-sm 
                           border-zinc-200 text-zinc-600 
                           dark:border-zinc-800 dark:text-zinc-400">
          <div className="flex justify-center gap-8 mb-4 text-lg">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-sky-500 hover:drop-shadow transition"
            >
              🐦 Twitter
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-emerald-400 hover:drop-shadow transition"
            >
              💻 GitHub
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-pink-400 hover:drop-shadow transition"
            >
              📢 Telegram
            </a>
          </div>
          <p className="text-base md:text-lg font-semibold tracking-wide">
            ⚡ SkorpioGamers 3050 —{" "}
            <span className="text-cyan-500 dark:text-cyan-400">
              Ultra Cyberpunk Edition
            </span>
            <br /> Made with ❤️ by Davide
          </p>
        </footer>
      </body>
    </html>
  );
}
