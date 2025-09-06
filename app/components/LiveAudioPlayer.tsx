"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

const YT_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

type Props = {
  videoId: string;
  className?: string;
};

const WANT_KEY = "sg_live_wanted";
const VOL_KEY  = "sg_live_volume";
const DEFAULT_VOL = 60; // 0..100

export default function LiveAudioPlayer({ videoId, className }: Props) {
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wanted, setWanted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(WANT_KEY) === "1";
  });
  const [savedVol, setSavedVol] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_VOL;
    const v = parseInt(localStorage.getItem(VOL_KEY) || "", 10);
    return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : DEFAULT_VOL;
  });

  const persistWanted = (v: boolean) => {
    setWanted(v);
    try { localStorage.setItem(WANT_KEY, v ? "1" : "0"); } catch {}
  };
  const persistVol = (v: number) => {
    setSavedVol(v);
    try { localStorage.setItem(VOL_KEY, String(v)); } catch {}
  };

  const opts: YouTubeProps["opts"] = {
    height: "0",
    width: "0",
    playerVars: {
      autoplay: 1,       // parte silenzioso (muted)
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    },
  };

  const onReady = (e: any) => {
    playerRef.current = e.target;
    setReady(true);
    setError(null);
    try {
      e.target.mute();
      e.target.setVolume(0); // garantisce autoplay silenzioso
      e.target.playVideo();
    } catch {}
  };

  // Garantisce volume udibile quando l’utente vuole ascoltare
  const ensureAudible = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.unMute();
      const current = typeof p.getVolume === "function" ? p.getVolume() : 0;
      const target = (Number.isFinite(current) && current > 0) ? current : savedVol || DEFAULT_VOL;
      p.setVolume(target);
      // salva qualsiasi normalizzazione
      persistVol(target);
    } catch {}
  }, [savedVol]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing || buffering) {
      try { p.pauseVideo(); } catch {}
      setPlaying(false);
      setBuffering(false);
      persistWanted(false);
    } else {
      setError(null);
      setBuffering(true);
      persistWanted(true);
      try {
        ensureAudible();
        p.playVideo();
      } catch {}
    }
  }, [playing, buffering, ensureAudible]);

  const onStateChange = (e: any) => {
    const s = e.data;
    if (s === YT_STATE.PLAYING) {
      setBuffering(false);
      setPlaying(true);
      setError(null);
      if (wanted) ensureAudible(); // nel dubbio riallinea volume
    } else if (s === YT_STATE.PAUSED) {
      setPlaying(false);
      setBuffering(false);
      // tenta di leggere e memorizzare eventuale volume aggiornato
      try {
        const v = playerRef.current?.getVolume?.();
        if (Number.isFinite(v)) persistVol(v);
      } catch {}
    } else if (s === YT_STATE.BUFFERING) {
      setBuffering(true);
    } else if (s === YT_STATE.ENDED) {
      setPlaying(false);
    }
  };

  const onError = () => {
    setError("Playback error");
    setBuffering(false);
    setPlaying(false);
  };

  // Pausa quando la tab non è visibile; riprende se “wanted”
  useEffect(() => {
    const onVis = () => {
      const p = playerRef.current;
      if (!p) return;
      try {
        if (document.hidden) {
          p.pauseVideo();
        } else if (wanted) {
          ensureAudible();
          p.playVideo();
        }
      } catch {}
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [wanted, ensureAudible]);

  // Cleanup
  useEffect(() => () => { try { playerRef.current?.pauseVideo(); } catch {} }, []);

  return (
    <div className={`mt-4 flex flex-col items-center ${className ?? ""}`}>
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
        iframeClassName="hidden"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className={`chip ${playing ? "is-active" : ""}`}
          aria-label={playing ? "Pausa live" : "Riproduci live"}
        >
          {playing ? "⏸ Stop" : buffering ? "⏳ Avvio…" : "▶ Play"}
        </button>
        <span className="live-pill" aria-live="polite">
          <span className={`dot ${playing ? "on" : ""}`} />
          LIVE
        </span>
        {ready && wanted && !playing && !buffering && (
          <span className="text-xs text-neutral-400 ml-2">in pausa</span>
        )}
        {error && <span className="text-red-400 text-xs ml-2">Errore</span>}
      </div>

      <style jsx>{`
        .live-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .dot { width: 8px; height: 8px; border-radius: 999px; background: #777; }
        .dot.on { background: #ff3b30; box-shadow: 0 0 10px #ff3b30; }
      `}</style>
    </div>
  );
}
