import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { CallContext } from "../../context/CallContext";
import { Authcontext } from "../../context/AuthContext";
import { ChatContext } from "../../context/Chatcontext";
import VideoTile from "./VideoTile";

const QUICK_EMOJIS = ["👍", "😂", "🔥", "❤️", "👏", "🎉", "😮", "🙌", "😢", "💯"];

// how many columns the grid should use for a given number of tiles
const gridColumns = (count) => {
  if (count <= 1) return "grid-cols-1";
  if (count <= 4) return "grid-cols-1 sm:grid-cols-2";
  if (count <= 9) return "grid-cols-2 sm:grid-cols-3";
  return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
};

const VideoCall = () => {
  const {
    callState,
    call,
    participants,
    streams,
    localStream,
    micOn,
    camOn,
    sharing,
    chat,
    reactions,
    unreadChat,
    clearUnreadChat,
    leaveCall,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    sendCallChat,
    sendReaction,
    inviteToCall,
  } = useContext(CallContext);

  const { authUser } = useContext(Authcontext);
  const { users } = useContext(ChatContext);

  const [panel, setPanel] = useState(null); // "chat" | "people" | "share" | null
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [qr, setQr] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const chatEndRef = useRef(null);

  const joinLink = call ? `${window.location.origin}/chat?call=${call.code}` : "";

  // call timer
  useEffect(() => {
    if (callState !== "active" || !call?.createdAt) return;
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - call.createdAt) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [callState, call?.createdAt]);

  // build the invite QR once the share sheet is opened
  useEffect(() => {
    if (panel !== "share" || !call) return;
    QRCode.toDataURL(joinLink, {
      width: 320,
      margin: 1,
      color: { dark: "#0e0b16", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [panel, call?.code]);

  useEffect(() => {
    if (panel === "chat") {
      clearUnreadChat();
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [panel, chat.length]);

  // people in this room who are not already on the call
  const invitable = useMemo(() => {
    const inCallIds = new Set([
      authUser?._id,
      ...participants.map((p) => p.userId),
    ]);
    return users.filter((user) => !inCallIds.has(user._id));
  }, [users, participants, authUser]);

  if (callState === "idle") return null;

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy");
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendCallChat(draft);
    setDraft("");
  };

  const formatElapsed = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const h = Math.floor(m / 60);
    return h > 0
      ? `${h}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  };

  const tileCount = participants.length + 1;

  const controlButton =
    "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors border border-white/10 shrink-0";

  const togglePanel = (name) => setPanel((prev) => (prev === name ? null : name));

  return (
    <div className="fixed inset-0 z-[60] bg-[#07050f] text-white flex flex-col">
      {/* ---------------------------- header ---------------------------- */}
      <div className="flex items-center gap-3 px-3 sm:px-5 py-3 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <div className="min-w-0">
            <p className="text-sm truncate">{call?.title || "Video call"}</p>
            <p className="text-[11px] text-white/45 tracking-widest">
              {call?.code} · {tileCount} on call
              {callState === "active" && ` · ${formatElapsed(elapsed)}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => togglePanel("share")}
          title="Invite people"
          className="text-xs px-3 py-1.5 rounded-full bg-violet-500/50 hover:bg-violet-500/70 border border-white/10 cursor-pointer transition-colors flex items-center gap-2 shrink-0"
        >
          <i className="fa-solid fa-user-plus text-[11px]"></i>
          <span className="max-sm:hidden">Invite</span>
        </button>
      </div>

      {/* ------------------------- body: grid + panel ------------------- */}
      <div className="relative flex-1 flex min-h-0">
        <div className="flex-1 relative min-w-0 flex flex-col">
          {callState === "connecting" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#07050f]/80">
              <i className="fa-solid fa-video text-2xl text-violet-400 animate-pulse"></i>
              <p className="text-sm text-white/60">Setting up your camera...</p>
            </div>
          )}

          <div
            className={`flex-1 grid ${gridColumns(tileCount)} gap-2 sm:gap-3 p-2 sm:p-4 auto-rows-fr overflow-y-auto`}
          >
            <VideoTile
              stream={localStream}
              fullname={authUser?.fullname || "You"}
              profilePic={authUser?.profilePic}
              muted
              mirrored
              micOn={micOn}
              camOn={camOn || sharing}
              sharing={sharing}
              isYou
            />
            {participants.map((peer) => (
              <VideoTile
                key={peer.userId}
                stream={streams[peer.userId]}
                fullname={peer.fullname}
                profilePic={peer.profilePic}
                micOn={peer.mic !== false}
                camOn={peer.cam !== false}
                sharing={!!peer.sharing}
              />
            ))}
          </div>

          {participants.length === 0 && callState === "active" && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none px-4">
              <p className="text-[11px] text-white/45 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-center">
                Waiting for others — share the code{" "}
                <span className="tracking-widest text-violet-200">{call?.code}</span>
              </p>
            </div>
          )}

          {/* floating emoji reactions */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {reactions.map((reaction, index) => (
              <div
                key={reaction.id}
                className="absolute bottom-24 animate-float-up flex flex-col items-center"
                style={{ left: `${8 + ((index * 17) % 78)}%` }}
              >
                <span className="text-3xl sm:text-4xl drop-shadow-lg">
                  {reaction.emoji}
                </span>
                <span className="text-[10px] text-white/70 bg-black/50 rounded-full px-2 mt-0.5 whitespace-nowrap">
                  {reaction.userId === authUser?._id ? "You" : reaction.fullname}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------- side panel ------------------------- */}
        {panel && (
          <div className="absolute inset-0 z-20 sm:static sm:z-auto sm:w-80 lg:w-96 shrink-0 bg-[#0e0b16] sm:bg-white/5 backdrop-blur-xl border-l border-white/10 flex flex-col">
            <div className="flex items-center gap-1 p-2 border-b border-white/10">
              {[
                { key: "chat", icon: "fa-comment-dots", label: "Chat" },
                { key: "people", icon: "fa-users", label: "People" },
                { key: "share", icon: "fa-qrcode", label: "Invite" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPanel(tab.key)}
                  className={`flex-1 text-[11px] py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                    panel === tab.key
                      ? "bg-violet-500/30 border border-white/10 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} text-[11px]`}></i>
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => setPanel(null)}
                title="Close panel"
                className="w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-colors shrink-0"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            {/* ---- chat ---- */}
            {panel === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                  {chat.length === 0 && (
                    <p className="text-[11px] text-white/35 text-center mt-6 leading-5 px-4">
                      Messages sent here live only for the length of this call.
                    </p>
                  )}
                  {chat.map((message) => {
                    const mine = message.userId === authUser?._id;
                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col max-w-[85%] ${mine ? "self-end items-end" : "self-start"}`}
                      >
                        {!mine && (
                          <span className="text-[10px] text-white/40 px-1 mb-0.5">
                            {message.fullname}
                          </span>
                        )}
                        <span
                          className={`px-3 py-2 rounded-lg text-xs leading-relaxed break-words ${
                            mine
                              ? "bg-violet-500/35 rounded-br-none"
                              : "bg-white/10 border border-white/5 rounded-bl-none"
                          }`}
                        >
                          {message.text}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* emoji shortcuts + composer */}
                <div className="border-t border-white/10 p-2">
                  <div className="flex gap-1 overflow-x-auto pb-2">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => sendReaction(emoji)}
                        title="Send reaction"
                        className="w-8 h-8 shrink-0 rounded-lg hover:bg-white/10 cursor-pointer text-base transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Message the call..."
                      maxLength={500}
                      className="flex-1 min-w-0 bg-white/10 border border-white/10 rounded-full py-2.5 px-4 text-xs outline-none placeholder-white/35 focus:border-violet-400/50"
                    />
                    <button
                      type="submit"
                      className="w-9 h-9 shrink-0 rounded-full bg-violet-500/60 hover:bg-violet-500/80 border border-white/10 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <img src={assets.send_button} alt="send" className="w-3.5" />
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* ---- people ---- */}
            {panel === "people" && (
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                <p className="text-[10px] uppercase tracking-wider text-white/35 px-1 mb-1">
                  On the call · {tileCount}
                </p>
                {[
                  {
                    userId: authUser?._id,
                    fullname: `${authUser?.fullname || "You"} (you)`,
                    profilePic: authUser?.profilePic,
                    mic: micOn,
                    cam: camOn,
                  },
                  ...participants,
                ].map((person) => (
                  <div
                    key={person.userId}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <img
                      src={person.profilePic || assets.avatar_icon}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <p className="text-xs truncate flex-1">{person.fullname}</p>
                    <i
                      className={`fa-solid text-[11px] ${
                        person.mic === false
                          ? "fa-microphone-slash text-rose-300"
                          : "fa-microphone text-white/35"
                      }`}
                    ></i>
                    <i
                      className={`fa-solid text-[11px] ${
                        person.cam === false
                          ? "fa-video-slash text-rose-300"
                          : "fa-video text-white/35"
                      }`}
                    ></i>
                  </div>
                ))}

                {invitable.length > 0 && (
                  <>
                    <p className="text-[10px] uppercase tracking-wider text-white/35 px-1 mt-4 mb-1">
                      Also in this room
                    </p>
                    {invitable.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <img
                          src={user.profilePic || assets.avatar_icon}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover shrink-0 opacity-70"
                        />
                        <p className="text-xs truncate flex-1 text-white/70">
                          {user.fullname}
                        </p>
                        <button
                          onClick={() => inviteToCall([user._id])}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/40 hover:bg-violet-500/60 border border-white/10 cursor-pointer transition-colors shrink-0"
                        >
                          Ring
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ---- invite ---- */}
            {panel === "share" && (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-3">
                <p className="text-[11px] text-white/50 self-start leading-5">
                  Anyone with this code can join the call — scan it, or send the
                  link.
                </p>
                <div className="bg-white border border-white/15 rounded-2xl p-3 mt-1">
                  {qr ? (
                    <img src={qr} alt="Call QR code" className="w-40 h-40" />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-[11px] text-black/40">
                      Generating...
                    </div>
                  )}
                </div>
                <p className="text-lg tracking-[0.35em] text-violet-200">
                  {call?.code}
                </p>
                <div className="flex gap-2 w-full mt-1">
                  <button
                    onClick={() => copy(call?.code, "Code")}
                    className="flex-1 cursor-pointer text-xs bg-white/10 border border-white/15 rounded-full py-2.5 hover:bg-white/20 transition-colors"
                  >
                    Copy code
                  </button>
                  <button
                    onClick={() => copy(joinLink, "Link")}
                    className="flex-1 cursor-pointer text-xs bg-violet-500/60 border border-white/10 rounded-full py-2.5 hover:bg-violet-500/80 transition-colors"
                  >
                    Copy link
                  </button>
                </div>
                {invitable.length > 0 && (
                  <button
                    onClick={() => inviteToCall(invitable.map((u) => u._id))}
                    className="w-full cursor-pointer text-xs bg-white/5 border border-white/15 rounded-full py-2.5 hover:bg-white/10 transition-colors mt-1"
                  >
                    Ring everyone in this room
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------- controls -------------------------- */}
      <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl px-3 py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3">
        {emojiOpen && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex gap-1 bg-[#0e0b16] border border-white/10 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)] max-w-[92vw] overflow-x-auto">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  sendReaction(emoji);
                  setEmojiOpen(false);
                }}
                className="w-9 h-9 shrink-0 rounded-lg hover:bg-white/10 cursor-pointer text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={toggleMic}
          title={micOn ? "Mute" : "Unmute"}
          className={`${controlButton} ${
            micOn ? "bg-white/10 hover:bg-white/20" : "bg-rose-500/70 hover:bg-rose-500"
          }`}
        >
          <i
            className={`fa-solid ${micOn ? "fa-microphone" : "fa-microphone-slash"} text-sm`}
          ></i>
        </button>

        <button
          onClick={toggleCam}
          title={camOn ? "Turn camera off" : "Turn camera on"}
          className={`${controlButton} ${
            camOn ? "bg-white/10 hover:bg-white/20" : "bg-rose-500/70 hover:bg-rose-500"
          }`}
        >
          <i className={`fa-solid ${camOn ? "fa-video" : "fa-video-slash"} text-sm`}></i>
        </button>

        <button
          onClick={toggleScreenShare}
          title={sharing ? "Stop sharing" : "Share your screen"}
          className={`${controlButton} max-sm:hidden ${
            sharing
              ? "bg-emerald-500/70 hover:bg-emerald-500"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <i className="fa-solid fa-display text-sm"></i>
        </button>

        <button
          onClick={() => setEmojiOpen((prev) => !prev)}
          title="Send a reaction"
          className={`${controlButton} ${
            emojiOpen ? "bg-violet-500/50" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <i className="fa-solid fa-face-smile text-sm"></i>
        </button>

        <button
          onClick={() => togglePanel("chat")}
          title="Call chat"
          className={`${controlButton} relative ${
            panel === "chat" ? "bg-violet-500/50" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <i className="fa-solid fa-comment-dots text-sm"></i>
          {unreadChat > 0 && panel !== "chat" && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-500 border border-white/20 text-[10px] flex items-center justify-center">
              {unreadChat > 9 ? "9+" : unreadChat}
            </span>
          )}
        </button>

        <button
          onClick={() => togglePanel("people")}
          title="People"
          className={`${controlButton} max-sm:hidden ${
            panel === "people" ? "bg-violet-500/50" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <i className="fa-solid fa-users text-sm"></i>
        </button>

        <button
          onClick={leaveCall}
          title="Leave call"
          className={`${controlButton} w-14 sm:w-16 bg-rose-600 hover:bg-rose-700`}
        >
          <i className="fa-solid fa-phone-slash text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
