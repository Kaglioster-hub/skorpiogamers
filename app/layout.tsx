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
  metadataBase: new URL("https://sg.vrabo.it"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {/* Header semplificato */}
          <header className="py-4 flex items-center justify-center gap-6">
            {/* Titolo testuale senza logo */}
            <span className="font-bold text-lg text-cyan-400">
              SkorpioGamers 3050
            </span>

            {/* Menu di navigazione */}
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
