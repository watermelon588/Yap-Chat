import React, { useContext, useState } from "react";
import { CallContext } from "../../context/CallContext";
import { ChatContext } from "../../context/Chatcontext";

// Sits under the room panel in the sidebar: start a fresh call (with a brand
// new code) or drop into one somebody sent you a code for.
const CallPanel = () => {
  const { startCall, joinCall, inCall } = useContext(CallContext);
  const { activeRoom, users } = useContext(ChatContext);

  const [modal, setModal] = useState(null); // "start" | "join"
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [ringRoom, setRingRoom] = useState(true);
  const [busy, setBusy] = useState(false);

  const closeModal = () => {
    setModal(null);
    setTitle("");
    setCode("");
    setBusy(false);
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setBusy(true);
    const created = await startCall({
      title: title.trim() || (activeRoom ? `${activeRoom.name} call` : "Video call"),
      roomId: activeRoom?._id,
      invite: ringRoom ? users.map((user) => user._id) : [],
    });
    setBusy(false);
    if (created) closeModal();
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    const joined = await joinCall(code);
    setBusy(false);
    if (joined) closeModal();
  };

  const glassInput =
    "w-full bg-white/10 border border-white/15 rounded-full py-2.5 px-4 text-xs text-white placeholder-white/40 outline-none focus:border-violet-400/50";

  return (
    <div className="mt-3">
      <div className="backdrop-blur-md bg-black/20 border border-white/15 rounded-2xl px-3 py-2.5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-white/10 flex items-center justify-center shrink-0">
          <i className="fa-solid fa-video text-[11px] text-violet-300"></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-white/40">
            Video call
          </p>
          <p className="text-[11px] text-white/70 truncate">
            {inCall ? "You are on a call" : "Start one or join by code"}
          </p>
        </div>
        {/* one action only - the sidebar gets narrow in the three column
            layout and a second button pushes this row out of shape */}
        <button
          onClick={() => setModal("start")}
          disabled={inCall}
          title="Start or join a video call"
          className="w-8 h-8 rounded-full bg-violet-500/60 hover:bg-violet-500/80 border border-white/10 flex items-center justify-center cursor-pointer transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-plus text-[11px]"></i>
        </button>
      </div>

      {modal && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-3 py-4 sm:px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0e0b16] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-2xl w-full max-w-sm p-5 sm:p-6 text-white"
          >
            {/* both routes live behind the single sidebar button */}
            <div className="flex gap-1 p-1 mb-4 bg-white/5 border border-white/10 rounded-full">
              {[
                { key: "start", label: "Start new" },
                { key: "join", label: "Join by code" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setModal(tab.key)}
                  className={`flex-1 text-[11px] py-2 rounded-full cursor-pointer transition-colors ${
                    modal === tab.key
                      ? "bg-violet-500/60 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {modal === "start" && (
              <form onSubmit={handleStart} className="flex flex-col gap-3">
                <h2 className="text-lg font-medium">Start a video call</h2>
                <p className="text-[11px] text-white/50 -mt-2">
                  We generate a fresh call code. Share it and anyone can hop in —
                  up to eight people at once.
                </p>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={glassInput}
                  placeholder="Call name (optional)"
                  maxLength={60}
                />
                {activeRoom && users.length > 0 && (
                  <label className="flex items-center gap-2.5 text-[11px] text-white/60 px-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ringRoom}
                      onChange={(e) => setRingRoom(e.target.checked)}
                      className="accent-violet-500 cursor-pointer"
                    />
                    Ring everyone in {activeRoom.name} ({users.length})
                  </label>
                )}
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 cursor-pointer text-xs bg-white/10 border border-white/15 rounded-full py-2.5 hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 cursor-pointer text-xs bg-violet-500/60 border border-white/10 rounded-full py-2.5 hover:bg-violet-500/80 transition-colors disabled:opacity-50"
                  >
                    {busy ? "Starting..." : "Start call"}
                  </button>
                </div>
              </form>
            )}

            {modal === "join" && (
              <form onSubmit={handleJoin} className="flex flex-col gap-3">
                <h2 className="text-lg font-medium">Join a video call</h2>
                <p className="text-[11px] text-white/50 -mt-2">
                  Enter the call code somebody shared with you.
                </p>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className={`${glassInput} tracking-[0.3em] text-center`}
                  placeholder="CALL CODE"
                  maxLength={12}
                  autoFocus
                />
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 cursor-pointer text-xs bg-white/10 border border-white/15 rounded-full py-2.5 hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 cursor-pointer text-xs bg-violet-500/60 border border-white/10 rounded-full py-2.5 hover:bg-violet-500/80 transition-colors disabled:opacity-50"
                  >
                    {busy ? "Joining..." : "Join call"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallPanel;
