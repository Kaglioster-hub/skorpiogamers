"use client";

export default function NewsletterPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: "1.9rem", marginBottom: 12 }}>📩 Newsletter</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Ricevi ogni giorno le <b>20 migliori offerte</b> nella tua casella email.
        Gratuita, senza spam.
      </p>

      <form
        action="https://formsubmit.co/sg@vrabo.it"
        method="POST"
        className="nl-form"
        style={{ display: "grid", gap: 12 }}
      >
        {/* Config opzionali per FormSubmit */}
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_subject" value="Nuova iscrizione SkorpioGamers" />
        <input type="hidden" name="_next" value="https://sg.vrabo.it/thanks.html" />

        <input
          type="email"
          name="email"
          placeholder="La tua email"
          required
          className="input"
          style={{ padding: 12 }}
        />
        <button type="submit" className="button">
          Iscriviti ora
        </button>
      </form>
    </main>
  );
}
