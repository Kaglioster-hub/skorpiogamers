"use client";
import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") setDarkMode(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className={darkMode ? "dark" : ""}>
      {/* Navbar centrata */}
      <header className="site-header">
        <div className="nav-inner">
          <div className="brand">
            <img src="/logo.svg" alt="SkorpioGamers 3050" />
            <div className="brand-name">SkorpioGamers 3050</div>
          </div>
          <nav className="main-nav">
            <a href="/trending">🔥 Trending</a>
            <a href="/wishlist">⭐ Wishlist</a>
            <a href="/newsletter">💌 Newsletter</a>
            <button
              onClick={() => setDarkMode(v => !v)}
              className="sort-btn"
              aria-label="Toggle tema"
              title="Cambia tema"
            >
              {darkMode ? "🌙 Dark" : "☀️ Light"}
            </button>
          </nav>
        </div>
      </header>
      {children}
      <footer>
        <div className="container text-center">
          <div className="flex justify-center gap-6 mb-3">
            <a href="https://twitter.com" target="_blank" rel="noreferrer">🐦 Twitter</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">💻 GitHub</a>
            <a href="https://t.me" target="_blank" rel="noreferrer">📢 Telegram</a>
          </div>
          <p>⚡ SkorpioGamers 3050 — Made with ❤️ by Davide</p>
        </div>
      </footer>
    </div>
  );
}
