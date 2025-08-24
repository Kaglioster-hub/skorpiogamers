"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
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
    <form onSubmit={subscribe} className="nl-form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="La tua email"
        required
        className="input"
      />
      <button className="button" type="submit" disabled={loading}>
        {loading ? "⏳ Invio..." : "Iscriviti ora"}
      </button>
      {msg && <p className="muted" style={{ marginTop: 8 }}>{msg}</p>}
    </form>
  );
}
