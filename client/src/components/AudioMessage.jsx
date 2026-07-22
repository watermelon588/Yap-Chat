import React, { useEffect, useRef, useState } from "react";

// voice notes sent before the mp3 switch still point at the raw .webm, which
// cloudinary serves as video/webm - ask for the transcoded mp3 instead
const playableSrc = (url) => {
  if (typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return url;
  return url.replace(/\.(webm|ogg|mp4|m4a)$/i, ".mp3");
};

const format = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// whatsapp style voice note bubble - play / pause, scrubber and duration
const AudioMessage = ({ src, duration = 0, outgoing }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(duration);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrent(audio.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
    };
    const onMeta = () => {
      // the server hands us an mp3, so this is normally a real number - fall back
      // to the duration recorded at capture time if it is not
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setTotal(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      const started = audio.play();
      if (started?.catch) started.catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !total) return;
    audio.currentTime = (Number(e.target.value) / 100) * total;
    setCurrent(audio.currentTime);
  };

  const progress = total ? (current / total) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-8 w-[150px] sm:w-[165px] bg-violet-500/30 text-white ${
        outgoing ? "rounded-br-none" : "rounded-bl-none"
      }`}
    >
      <audio ref={audioRef} src={playableSrc(src)} preload="metadata" />
      <button
        onClick={toggle}
        className="shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors"
        aria-label={playing ? "Pause voice note" : "Play voice note"}
      >
        {playing ? (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4l14 8-14 8V4z" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={seek}
          className="w-full h-[3px] appearance-none rounded-full cursor-pointer accent-white"
          style={{
            background: `linear-gradient(to right, #ffffff ${progress}%, rgba(255,255,255,0.25) ${progress}%)`,
          }}
        />
        <p className="text-[9px] leading-3 text-white/60 mt-0.5">
          {format(playing || current ? current : total)}
        </p>
      </div>
    </div>
  );
};

export default AudioMessage;
