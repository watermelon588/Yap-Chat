import React, { useEffect, useRef, useState } from "react";
import assets from "../assets/assets";

// One person in the call grid. Falls back to the avatar whenever there is no
// video to show - camera off, still connecting, or audio-only joiner.
const VideoTile = ({
  stream,
  fullname,
  profilePic,
  muted = false,
  mirrored = false,
  micOn = true,
  camOn = true,
  sharing = false,
  isYou = false,
  speakingHint = false,
}) => {
  const videoRef = useRef(null);

  // A remote peer's audio and video arrive as two separate ontrack events that
  // carry the *same* MediaStream object, so React sees no change when the video
  // track finally lands. Watch the stream itself instead of re-reading it on
  // render, otherwise the tile is stuck on "Connecting..." forever.
  const [hasVideoTrack, setHasVideoTrack] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video && video.srcObject !== stream) video.srcObject = stream || null;

    if (!stream) {
      setHasVideoTrack(false);
      return;
    }

    const sync = () =>
      setHasVideoTrack(
        stream.getVideoTracks().some((track) => track.readyState === "live"),
      );

    sync();
    stream.addEventListener("addtrack", sync);
    stream.addEventListener("removetrack", sync);
    video?.play?.().catch(() => {});

    return () => {
      stream.removeEventListener("addtrack", sync);
      stream.removeEventListener("removetrack", sync);
    };
  }, [stream]);

  // the element telling us it has real frames is the last word
  const handleVideoReady = () => {
    if (videoRef.current?.videoWidth > 0) setHasVideoTrack(true);
  };

  const hasVideo = hasVideoTrack && camOn;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#12101c] border transition-colors ${
        speakingHint ? "border-violet-400/60" : "border-white/10"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        onLoadedMetadata={handleVideoReady}
        onResize={handleVideoReady}
        onPlaying={handleVideoReady}
        className={`w-full h-full object-cover ${hasVideo ? "" : "opacity-0"} ${
          mirrored && !sharing ? "scale-x-[-1]" : ""
        }`}
      />

      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <img
            src={profilePic || assets.avatar_icon}
            alt=""
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-white/15"
          />
          <p className="text-xs text-white/50">
            {camOn ? "Connecting..." : "Camera off"}
          </p>
        </div>
      )}

      {/* name plate */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
        <span className="flex items-center gap-1.5 max-w-full text-[11px] text-white bg-black/55 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1">
          {!micOn && (
            <i className="fa-solid fa-microphone-slash text-[10px] text-rose-300"></i>
          )}
          {sharing && (
            <i className="fa-solid fa-display text-[10px] text-emerald-300"></i>
          )}
          <span className="truncate">{isYou ? `${fullname} (you)` : fullname}</span>
        </span>
      </div>
    </div>
  );
};

export default VideoTile;
