import "./globals.css";
import type { Metadata } from "next";
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
