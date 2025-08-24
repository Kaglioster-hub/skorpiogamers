"use client";
import { useState } from "react";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json();
      if (j.ok) {
        setMsg("✅ Iscrizione completata!");
        setEmail("");
      } else {
        setMsg("⚠️ " + (j.error || "Errore sconosciuto"));
      }
    } catch {
      setMsg("❌ Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 12 }}>📩 Newsletter</h1>
      <p className="muted">
        Ricevi ogni giorno le <b>20 migliori offerte</b> nella tua casella email.
      </p>

      <form onSubmit={subscribe} style={{ marginTop: 20 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="La tua email"
          required
          className="input"
          style={{ marginBottom: 12, width: "100%" }}
        />
        <button
          className="button"
          type="submit"
          disabled={loading}
        >
          {loading ? "⏳ Invio..." : "Iscriviti ora"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
