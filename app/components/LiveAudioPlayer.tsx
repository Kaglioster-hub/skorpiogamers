"use client";
import { useRef, useState, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

export default function LiveAudioPlayer({ videoId }: { videoId: string }) {
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);

  const opts: YouTubeProps["opts"] = {
    height: "0", // nasconde il video
    width: "0",
    playerVars: {
      autoplay: 1,        // prova a partire (silenzioso)
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  function onReady(e: any) {
    playerRef.current = e.target;
    try {
      playerRef.current.mute();
      playerRef.current.playVideo();
    } catch {}
  }

  function togglePlay() {
    if (!playerRef.current) return;
    try {
      if (playing) {
        playerRef.current.pauseVideo();
        setPlaying(false);
      } else {
        playerRef.current.unMute();
        playerRef.current.playVideo();
        setPlaying(true);
      }
    } catch {}
  }

  // pausa in unmount
  useEffect(() => {
    return () => {
      try { playerRef.current?.pauseVideo(); } catch {}
    };
  }, []);

  return (
    <div className="mt-4 flex flex-col items-center">
      <YouTube videoId={videoId} opts={opts} onReady={onReady} />
      <div className="flex gap-3">
        <button
          onClick={togglePlay}
          className="chip is-active"
          aria-label={playing ? "Pausa live" : "Riproduci live"}
        >
          {playing ? "⏸ Stop" : "▶ Play"}
        </button>
      </div>
    </div>
  );
}
