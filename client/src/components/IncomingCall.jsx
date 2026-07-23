import React, { useContext, useEffect } from "react";
import assets from "../assets/assets";
import { CallContext } from "../../context/CallContext";

// The ring. Shows up over whatever the user is doing the moment somebody
// starts a call and points it at them.
const IncomingCall = () => {
  const { incoming, acceptIncoming, declineIncoming, inCall } =
    useContext(CallContext);

  // a short WebAudio blip on a loop beats shipping an mp3 just for this
  useEffect(() => {
    if (!incoming || inCall) return;
    let ctx;
    let stopped = false;

    const beep = () => {
      if (stopped) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        [0, 0.22].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = 620;
          gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + offset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.18);
          osc.connect(gain).connect(ctx.destination);
          osc.start(ctx.currentTime + offset);
          osc.stop(ctx.currentTime + offset + 0.2);
        });
      } catch {
        /* autoplay policy said no - the visual ring still works */
      }
    };

    beep();
    const timer = setInterval(beep, 2200);
    return () => {
      stopped = true;
      clearInterval(timer);
      ctx?.close?.();
    };
  }, [incoming, inCall]);

  if (!incoming) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm px-3 py-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#0e0b16] border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.7)] p-6 text-white flex flex-col items-center gap-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300">
          Incoming video call
        </p>

        <img
          src={incoming.from?.profilePic || assets.avatar_icon}
          alt=""
          className="w-20 h-20 rounded-full object-cover border border-white/15 animate-ring-pulse mt-1"
        />

        <p className="text-lg">{incoming.from?.fullname || "Someone"}</p>
        <p className="text-xs text-white/45 text-center -mt-1">
          {incoming.title}
          {incoming.roomName ? ` · ${incoming.roomName}` : ""}
        </p>
        <p className="text-[11px] tracking-[0.3em] text-violet-200 bg-violet-500/15 border border-white/10 rounded-full px-3 py-1">
          {incoming.code}
        </p>

        {inCall && (
          <p className="text-[11px] text-amber-300/80 text-center leading-5">
            You are already on a call — leave that one first to join this.
          </p>
        )}

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={declineIncoming}
            className="flex-1 cursor-pointer text-sm bg-white/10 hover:bg-white/20 border border-white/15 rounded-full py-3 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-phone-slash text-xs text-rose-300"></i>
            Decline
          </button>
          <button
            onClick={acceptIncoming}
            disabled={inCall}
            className="flex-1 cursor-pointer text-sm bg-emerald-600 hover:bg-emerald-700 border border-white/10 rounded-full py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-video text-xs"></i>
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
