"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

const YT_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

type Props = {
  videoId: string;
  /** Avvia l’audio automaticamente al primo click/tasto dell’utente */
  autostartOnInteraction?: boolean;
  className?: string;
};

export default function LiveAudioPlayer({
  videoId,
  autostartOnInteraction = true,
  className,
}: Props) {
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // Ricorda se l’utente “voleva” la riproduzione (persistenza soft)
  const WANT_KEY = "sg_live_wanted";
  const [wanted, setWanted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(WANT_KEY) === "1";
  });
  const markWanted = (v: boolean) => {
    setWanted(v);
    try { localStorage.setItem(WANT_KEY, v ? "1" : "0"); } catch {}
  };

  const opts: YouTubeProps["opts"] = {
    height: "0",
    width: "0",
    playerVars: {
      autoplay: 1,        // prova autoplay (muted)
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
      e.target.playVideo(); // muted autoplay ok
    } catch {}
  };

  const onStateChange = (e: any) => {
    const s = e.data;
    if (s === YT_STATE.PLAYING) { setBuffering(false); setPlaying(true); setError(null); }
    else if (s === YT_STATE.PAUSED) { setPlaying(false); setBuffering(false); }
    else if (s === YT_STATE.BUFFERING) { setBuffering(true); }
    else if (s === YT_STATE.ENDED) { setPlaying(false); }
  };

  const onError = () => {
    setError("Playback error");
    setBuffering(false);
    setPlaying(false);
    setRetry(r => r + 1);
  };

  // Retry con backoff se l’utente voleva riprodurre e c’è stato un errore
  useEffect(() => {
    if (!wanted || !ready || !playerRef.current || retry === 0) return;
    const delay = Math.min(30000, 1000 * 2 ** Math.min(retry, 5));
    const id = setTimeout(() => {
      try {
        playerRef.current?.loadVideoById(videoId);
        playerRef.current?.unMute();
        playerRef.current?.playVideo();
      } catch {}
    }, delay);
    return () => clearTimeout(id);
  }, [retry, wanted, ready, videoId]);

  // Pausa quando la tab non è visibile; riprende se “wanted”
  useEffect(() => {
    const onVis = () => {
      if (!playerRef.current) return;
      try {
        if (document.hidden) {
          playerRef.current.pauseVideo();
        } else if (wanted) {
          playerRef.current.unMute();
          playerRef.current.playVideo();
        }
      } catch {}
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [wanted]);

  // “Autoplay” sbloccato al primo click/tasto dell’utente
  useEffect(() => {
    if (!autostartOnInteraction || !wanted) return;
    const unlock = () => {
      try {
        if (!playerRef.current) return;
        playerRef.current.unMute();
        playerRef.current.playVideo();
      } catch {}
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true } as any);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [autostartOnInteraction, wanted]);

  const toggle = useCallback(() => {
    if (!playerRef.current) return;
    if (playing || buffering) {
      try { playerRef.current.pauseVideo(); } catch {}
      setPlaying(false);
      markWanted(false);
    } else {
      setError(null);
      setBuffering(true);
      markWanted(true);
      try {
        playerRef.current.unMute();
        playerRef.current.playVideo();
      } catch {}
    }
  }, [playing, buffering]);

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
        {error && <span className="text-red-400 text-xs ml-2">Errore, ritento…</span>}
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
