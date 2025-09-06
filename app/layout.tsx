import "./globals.css";
import ThemeProvider from "./ThemeProvider";

export const metadata = {
  title: "SkorpioGamers 3050",
  description: "Offerte live da Steam, GOG, Humble, Epic — in stile cyberpunk.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
