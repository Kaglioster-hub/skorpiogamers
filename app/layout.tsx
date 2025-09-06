// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import ThemeProvider from "./ThemeProvider";

export const metadata: Metadata = {
  title: "SkorpioGamers 3050",
  description:
    "Le migliori offerte reali da Steam, GOG, Humble, Epic — live e filtrabili.",
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
          {/* Header minimale: SOLO menu (niente logo/titolo) */}
          <header className="py-4 border-b border-neutral-900/60">
            <div className="mx-auto max-w-6xl px-6 flex items-center justify-center">
              <nav className="flex items-center gap-3" aria-label="Navigazione principale">
                <Link href="/trending" className="chip">🔥 Trending</Link>
                <Link href="/wishlist" className="chip">⭐ Wishlist</Link>
                <Link href="/newsletter" className="chip">📧 Newsletter</Link>
                <button id="theme-toggle" className="chip" aria-label="Tema scuro/chiaro">
                  🌙 Dark
                </button>
              </nav>
            </div>
          </header>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
