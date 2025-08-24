"use client";

import { useEffect, useState } from "react";
import Chart from "chart.js/auto";

export default function TrendingPage() {
  const [entries, setEntries] = useState<[string, number][]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("skg:clicks") || "{}";
      const data = JSON.parse(raw) as Record<string, number>;
      const arr = Object.entries(data).sort((a, b) => b[1] - a[1]);
      setEntries(arr.slice(0, 10));

      if (arr.length) {
        const ctx = document.getElementById("trendChart") as HTMLCanvasElement;
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: arr.slice(0, 10).map(([url]) => url.slice(0, 24)),
            datasets: [
              {
                label: "Click locali",
                data: arr.slice(0, 10).map(([_, c]) => c),
                backgroundColor: "#2afadf",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { labels: { color: "#fff" } } },
            scales: {
              x: { ticks: { color: "#aaa" } },
              y: { ticks: { color: "#aaa" } },
            },
          },
        });
      }
    } catch {}
  }, []);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 16 }}>📈 Trending (locale)</h1>
      <canvas id="trendChart" height={160}></canvas>

      {!entries.length && (
        <p style={{ marginTop: 20, color: "#aaa" }}>
          Nessun dato ancora. Clicca su qualche offerta nella home!
        </p>
      )}
    </main>
  );
}
