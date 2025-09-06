"use client";
import { useState } from "react";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const r = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(r.ok ? "ok" : "err");
    } catch { setStatus("err"); }
  }

  return (
    <main className="min-h-screen mx-auto max-w-6xl px-6 py-16 text-center">
      <h1 className="text-4xl font-bold mb-3">📬 Newsletter</h1>
      <p className="text-neutral-400 mb-6">
        Ricevi ogni giorno le migliori offerte. È gratis.
      </p>

      <form onSubmit={submit} className="mx-auto max-w-md flex gap-2">
        <input
          type="email"
          required
          placeholder="tu@esempio.it"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl px-4 py-3 bg-cyan-400 text-black font-semibold hover:bg-cyan-300 disabled:opacity-60"
        >
          {status === "loading" ? "Invio…" : "Iscriviti"}
        </button>
      </form>

      {status === "ok"  && <p className="text-green-400 mt-4">Iscrizione ok! ✅</p>}
      {status === "err" && <p className="text-red-400 mt-4">Errore, riprova.</p>}
    </main>
  );
}

