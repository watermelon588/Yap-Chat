import React, { useContext, useEffect, useState } from "react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import { ChatContext } from "../../context/Chatcontext";

// small glass panel that sits on top of the sidebar and drives room switching,
// creating, joining and sharing (code + QR)
const RoomPanel = () => {
  const { rooms, activeRoom, selectRoom, createRoom, joinRoom, leaveRoom } =
    useContext(ChatContext);

  const [open, setOpen] = useState(false); // room switcher dropdown
  const [modal, setModal] = useState(null); // "create" | "join" | "share"

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState("");

  const joinLink = activeRoom
    ? `${window.location.origin}/chat?join=${activeRoom.code}`
    : "";

  // build the QR whenever the share sheet is opened for a room
  useEffect(() => {
    if (modal !== "share" || !activeRoom) return;
    QRCode.toDataURL(joinLink, {
      width: 320,
      margin: 1,
      // dark modules on white scan far more reliably on phone cameras
      color: { dark: "#0e0b16", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [modal, activeRoom]);

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy");
    }
  };

  const closeModal = () => {
    setModal(null);
    setNewName("");
    setNewCode("");
    setJoinCode("");
    setQr("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    const room = await createRoom({ name: newName, code: newCode });
    setBusy(false);
    if (room) {
      closeModal();
      setOpen(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setBusy(true);
    const room = await joinRoom(joinCode);
    setBusy(false);
    if (room) {
      closeModal();
      setOpen(false);
    }
  };

  const glassInput =
    "w-full bg-white/10 border border-white/15 rounded-full py-2.5 px-4 text-xs text-white placeholder-white/40 outline-none focus:border-violet-400/50";

  const glassCard =
    "backdrop-blur-md bg-black/20 border border-white/15 ]";

  return (
    <div className="mt-4">
      {/* -------- active room bar -------- */}
      <div className={`${glassCard} rounded-2xl px-4 py-3`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              Room
            </p>
            <p className="text-sm text-white truncate">
              {activeRoom ? activeRoom.name : "No room yet"}
            </p>
          </div>

          {activeRoom && (
            <button
              onClick={() => setModal("share")}
              title="Share room"
              className="cursor-pointer text-white/70 hover:text-white transition-colors p-1"
            >
              {/* qr glyph */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h3v3h-3v-3zm5 0h3v3h-3v-3zm-5 5h3v3h-3v-3zm5 0h3v3h-3v-3z" />
              </svg>
            </button>
          )}

          <button
            onClick={() => setOpen(!open)}
            title="Switch room"
            className="cursor-pointer text-white/70 hover:text-white transition-colors p-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {activeRoom && (
          <button
            onClick={() => copy(activeRoom.code, "Code")}
            className="mt-2 w-full text-left cursor-pointer group"
            title="Click to copy"
          >
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] text-violet-200 bg-violet-500/20 border border-white/10 rounded-full px-3 py-1">
              {activeRoom.code}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-50 group-hover:opacity-100"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </span>
          </button>
        )}

        {/* -------- room switcher -------- */}
        {open && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
              {rooms.length === 0 && (
                <p className="text-[11px] text-white/40 py-1">
                  Create a room or join one with a code.
                </p>
              )}
              {rooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => {
                    selectRoom(room);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all hover:bg-white/10 ${
                    activeRoom?._id === room._id ? "bg-white/10 border border-white/15" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{room.name}</p>
                    <p className="text-[10px] text-white/40 tracking-widest">
                      {room.code} · {room.members?.length || 0} member
                      {(room.members?.length || 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      leaveRoom(room._id);
                    }}
                    title="Leave room"
                    className="cursor-pointer text-white/30 hover:text-red-300 transition-colors"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setModal("create")}
                className="flex-1 cursor-pointer text-[11px] text-white bg-violet-500/60 border border-white/10 rounded-full py-2 hover:bg-violet-500/80 transition-colors"
              >
                New Room
              </button>
              <button
                onClick={() => setModal("join")}
                className="flex-1 cursor-pointer text-[11px] text-white bg-white/10 border border-white/15 rounded-full py-2 hover:bg-white/20 transition-colors"
              >
                Join Code
              </button>
            </div>
          </div>
        )}
      </div>

      {/* -------- modals -------- */}
      {modal && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-3 py-4 sm:px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0e0b16] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-2xl w-full max-w-sm p-5 sm:p-6 text-white max-h-[90dvh] overflow-y-auto"
          >
            {modal === "create" && (
              <form onSubmit={handleCreate} className="flex flex-col gap-3">
                <h2 className="text-lg font-medium">Create a room</h2>
                <p className="text-[11px] text-white/50 -mt-2">
                  Pick your own code or leave it blank and we will generate one.
                </p>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={glassInput}
                  placeholder="Room name (optional)"
                />
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className={`${glassInput} tracking-[0.2em]`}
                  placeholder="CUSTOM CODE (optional)"
                  maxLength={20}
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
                    {busy ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            )}

            {modal === "join" && (
              <form onSubmit={handleJoin} className="flex flex-col gap-3">
                <h2 className="text-lg font-medium">Join a room</h2>
                <p className="text-[11px] text-white/50 -mt-2">
                  Enter the code someone shared with you.
                </p>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className={`${glassInput} tracking-[0.3em] text-center`}
                  placeholder="ROOM CODE"
                  maxLength={20}
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
                    {busy ? "Joining..." : "Join"}
                  </button>
                </div>
              </form>
            )}

            {modal === "share" && activeRoom && (
              <div className="flex flex-col items-center gap-3">
                <h2 className="text-lg font-medium self-start">
                  Invite to {activeRoom.name}
                </h2>
                <p className="text-[11px] text-white/50 self-start -mt-2">
                  Scan the QR or share the code below.
                </p>
                <div className="bg-white border border-white/15 rounded-2xl p-3 mt-1">
                  {qr ? (
                    <img
                      src={qr}
                      alt="Room QR code"
                      className="w-40 h-40 sm:w-44 sm:h-44"
                    />
                  ) : (
                    <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center text-[11px] text-black/40">
                      Generating...
                    </div>
                  )}
                </div>
                <p className="text-base sm:text-lg tracking-[0.35em] text-violet-200">
                  {activeRoom.code}
                </p>
                <div className="flex gap-2 w-full mt-1">
                  <button
                    onClick={() => copy(activeRoom.code, "Code")}
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
                <button
                  onClick={closeModal}
                  className="text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer mt-1"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPanel;
