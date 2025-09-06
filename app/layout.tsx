import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import ThemeProvider from "./ThemeProvider";

export const metadata: Metadata = {
  title: "SkorpioGamers 3050",
  description: "Le migliori offerte reali da Steam, GOG, Humble, Epic — live e filtrabili.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
    other: [{ rel: "mask-icon", url: "/logo.svg" }],
  },
  // opzionale: base assoluta per i meta (modifica se preferisci l'altro dominio)
  metadataBase: new URL("https://sg.vrabo.it"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <header className="py-4 flex flex-col items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="SkorpioGamers" width="28" height="28" />
              <span className="font-semibold">SkorpioGamers 3050</span>
            </Link>
            <nav className="flex items-center gap-3">
              <Link href="/trending"   className="chip">🔥 Trending</Link>
              <Link href="/wishlist"   className="chip">⭐ Wishlist</Link>
              <Link href="/newsletter" className="chip">📧 Newsletter</Link>
              <button id="theme-toggle" className="chip">🌙 Dark</button>
            </nav>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
