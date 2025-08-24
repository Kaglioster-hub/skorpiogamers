"use client";

import { motion } from "framer-motion";

export default function NewsletterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white flex flex-col items-center justify-center px-6">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
          📩 Newsletter 3050
        </h1>
        <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
          Ricevi ogni giorno le{" "}
          <span className="text-cyan-400 font-bold">20 migliori offerte</span>{" "}
          direttamente nella tua casella email.  
          <br />
          Gratuita, veloce, senza spam. Solo gaming 🔥
        </p>
      </motion.div>

      {/* FORM */}
      <motion.form
        action="https://formsubmit.co/sg@vrabo.it"
        method="POST"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full max-w-md bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 p-8 rounded-3xl shadow-xl card-glow"
      >
        {/* Config opzionali FormSubmit */}
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_template" value="table" />
        <input
          type="hidden"
          name="_subject"
          value="Nuova iscrizione SkorpioGamers"
        />
        <input
          type="hidden"
          name="_next"
          value="https://sg.vrabo.it/thanks.html"
        />

        {/* Input email */}
        <input
          type="email"
          name="email"
          placeholder="Inserisci la tua email"
          required
          className="w-full px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500 outline-none transition text-white placeholder-zinc-500"
        />

        {/* Bottone */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="mt-6 w-full py-3 rounded-xl font-semibold text-lg shadow-lg bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 hover:opacity-90 transition"
        >
          🚀 Iscriviti ora
        </motion.button>

        <p className="text-xs text-zinc-500 mt-4 text-center">
          Niente spam. Puoi disiscriverti in qualsiasi momento.
        </p>
      </motion.form>

      {/* DECORAZIONE NEON */}
      <div className="absolute -z-10 top-1/4 left-1/4 w-[400px] h-[400px] bg-pink-500/20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute -z-10 bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 blur-3xl rounded-full animate-spin-slow"></div>
    </main>
  );
}
