import "./global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "⚡ SkorpioGamers — Offerte Giochi in Tempo Reale",
  description: "Le migliori offerte di videogiochi da Steam, Epic, Humble e altri store. Aggiornato automaticamente ogni giorno.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sg.vrabo.it"),
  openGraph: {
    title: "SkorpioGamers — Offerte Videogiochi",
    description: "Scopri i migliori sconti su Steam, Epic, Humble.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://sg.vrabo.it",
    siteName: "SkorpioGamers",
    images: ["/logo.png"],
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <header className="site-header">
          <a className="brand" href="/">
            <img className="logo" src="/logo.png" alt="SkorpioGamers logo" />
            <div className="brand-text">
              <h1>SkorpioGamers</h1>
              <p className="subtitle">Offerte in tempo reale, ultraleggero, auto-aggiornato</p>
            </div>
          </a>
          <nav className="header-actions">
            <a className="ghost" href="/wishlist">⭐ Wishlist</a>
            <a className="ghost" href="/trending">📈 Trending</a>
            <a className="ghost" href="/newsletter">📩 Newsletter</a>
          </nav>
        </header>

        {children}

        <footer className="site-footer">
          <nav className="footer-nav">
            <a href="/wishlist">Wishlist</a>
            <a href="/trending">Trending</a>
            <a href="/newsletter">Newsletter</a>
            <a href="/sitemap.xml">Sitemap</a>
            <a href="/robots.txt">Robots</a>
          </nav>
          <p className="tiny">
            © {new Date().getFullYear()} SkorpioGamers – Made with ❤️ by Davide
          </p>
        </footer>

        <div id="snackbar" role="status" aria-live="polite" className="snackbar"></div>
      </body>
    </html>
  );
}
