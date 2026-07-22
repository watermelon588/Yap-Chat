import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/Chatcontext";
import { Authcontext } from "../../context/AuthContext";
import AudioMessage from "./AudioMessage";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const formatTimer = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const ChatContainer = () => {
  const navigate = useNavigate();
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    deleteMessage,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(Authcontext);

  // ----------scroll end---------------
  const scrollEnd = useRef();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [menuFor, setMenuFor] = useState(null); // message id whose menu is open

  // ----------voice notes---------------
  // idle -> recording <-> paused -> preview -> sent
  const [recState, setRecState] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [preview, setPreview] = useState(null); // { blob, url, duration }
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const recorderRef = useRef(null);
  const previewAudioRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const elapsedRef = useRef(0);
  const cancelledRef = useRef(false);

  // handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = ""; //  reset file input
    };
    reader.readAsDataURL(file);
  };

  const stopTracks = () => {
    recorderRef.current?.stream?.getTracks().forEach((track) => track.stop());
    clearInterval(timerRef.current);
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  };

  // start recording a voice note
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Recording is not supported on this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];
      cancelledRef.current = false;
      elapsedRef.current = 0;
      setElapsed(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stopTracks();
        const seconds = elapsedRef.current;

        if (cancelledRef.current || chunksRef.current.length === 0) {
          setRecState("idle");
          setElapsed(0);
          return;
        }
        if (seconds < 1) {
          toast.error("Hold on a bit longer to record");
          setRecState("idle");
          setElapsed(0);
          return;
        }

        // keep only the base mime type - a ";codecs=opus" suffix survives all the
        // way into the data url and cloudinary refuses to accept it
        const blob = new Blob(chunksRef.current, {
          type: (recorder.mimeType || "audio/webm").split(";")[0],
        });
        setPreview({
          blob,
          url: URL.createObjectURL(blob),
          duration: seconds,
        });
        setRecState("preview");
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecState("recording");
      startTimer();
    } catch {
      toast.error("Microphone permission is needed to record");
    }
  };

  const pauseRecording = () => {
    const recorder = recorderRef.current;
    if (recorder?.state !== "recording" || typeof recorder.pause !== "function") {
      toast.error("Pausing is not supported on this browser");
      return;
    }
    recorder.pause();
    clearInterval(timerRef.current);
    setRecState("paused");
  };

  const resumeRecording = () => {
    const recorder = recorderRef.current;
    if (recorder?.state !== "paused") return;
    recorder.resume();
    setRecState("recording");
    startTimer();
  };

  // stop recording - cancel throws it away, otherwise we land on the preview
  const stopRecording = (cancel) => {
    cancelledRef.current = cancel;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      stopTracks();
      setRecState("idle");
      setElapsed(0);
    }
  };

  const discardPreview = () => {
    previewAudioRef.current?.pause();
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setPreviewPlaying(false);
    setRecState("idle");
    setElapsed(0);
  };

  const togglePreview = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (previewPlaying) {
      audio.pause();
      setPreviewPlaying(false);
    } else {
      audio.play();
      setPreviewPlaying(true);
    }
  };

  // send the recorded note
  const sendRecording = () => {
    if (!preview) return;
    const { blob, duration, url } = preview;
    previewAudioRef.current?.pause();

    const reader = new FileReader();
    reader.onloadend = async () => {
      setSending(true);
      await sendMessage({ audio: reader.result, audioDuration: duration });
      setSending(false);
    };
    reader.readAsDataURL(blob);

    URL.revokeObjectURL(url);
    setPreview(null);
    setPreviewPlaying(false);
    setRecState("idle");
    setElapsed(0);
  };

  useEffect(() => {
    setMenuFor(null);
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // never leave the mic open behind us
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      stopTracks();
    };
  }, []);

  // release the preview blob when it is replaced or the chat is closed
  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* -------header--------- */}

      <div className="flex items-center gap-3 py-3 mx-2 sm:mx-4 border-b border-stone-500">
        {/* 🔙 BACK BUTTON */}
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="arrow"
          className=" max-w-5 max-h-6 m-1 cursor-pointer"
        />
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="image"
          className="w-8 h-8 rounded-full object-cover"
        />
        <p className="flex-1 min-w-0 truncate text-base sm:text-lg text-white flex items-center gap-2">
          {selectedUser.fullname}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
          )}
        </p>
        <div className="relative group inline-block">
          <img
            onClick={() => navigate("/terms")}
            src={assets.help_icon}
            alt="help"
            className="max-sm:hidden max-w-5 max-h-5 cursor-pointer"
          />

          {/* 🔥 TOOLTIP */}
          <span
            className="
    absolute right-0 top-7
    whitespace-nowrap
    text-[12px]
    px-2 py-1
    rounded-md
    bg-black/70 backdrop-blur-md
    text-white/80
    opacity-0 group-hover:opacity-100
    translate-y-1 group-hover:translate-y-0
    transition-all duration-200
    pointer-events-none
    z-50
  "
          >
            Terms & Privacy Policy
          </span>
        </div>
      </div>
      {/* ---------chat area -------- */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 pb-6">
        {messages.map((msg) => {
          const mine = msg.senderId?.toString() === authUser._id?.toString();
          return (
            <div
              key={msg._id}
              className={`group flex items-end gap-2 ${
                mine ? "justify-end" : "justify-start"
              }`}
            >
              {/* delete for everyone - only on your own, still standing messages */}
              {mine && !msg.deleted && (
                <div className="relative self-center shrink-0 mb-8">
                  <button
                    onClick={() =>
                      setMenuFor(menuFor === msg._id ? null : msg._id)
                    }
                    title="Message options"
                    className="w-6 h-6 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10
                      opacity-0 group-hover:opacity-100 focus:opacity-100 max-md:opacity-60 transition-opacity cursor-pointer"
                  >
                    <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                  </button>

                  {menuFor === msg._id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuFor(null)}
                      />
                      <div className="absolute right-0 bottom-full mb-1 z-20 w-44 rounded-lg bg-[#0e0b16] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6)] p-1">
                        <button
                          onClick={() => {
                            setMenuFor(null);
                            deleteMessage(msg._id);
                          }}
                          className="w-full text-left text-xs text-red-300 hover:bg-white/10 rounded-md px-3 py-2 cursor-pointer flex items-center gap-2"
                        >
                          <i className="fa-solid fa-trash-can text-[11px]"></i>
                          Delete for everyone
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {msg.deleted ? (
                <p
                  className={`p-2 max-w-[65%] sm:max-w-[220px] text-sm font-light italic rounded-lg mb-8 bg-white/10 border border-white/10 text-white/45 flex items-center gap-2 ${
                    mine ? "rounded-br-none" : "rounded-bl-none"
                  }`}
                >
                  <i className="fa-solid fa-ban text-[11px]"></i>
                  This message was deleted
                </p>
              ) : msg.audio ? (
                <AudioMessage
                  src={msg.audio}
                  duration={msg.audioDuration}
                  outgoing={mine}
                />
              ) : msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className="max-w-[65%] sm:max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                />
              ) : (
                <p
                  className={`p-2 max-w-[65%] sm:max-w-[220px] text-sm font-light rounded-lg mb-8 break-words bg-violet-500/30 text-white ${
                    mine ? "rounded-br-none" : "rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <div className="text-center text-xs shrink-0">
                <img
                  src={
                    mine
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser.profilePic || assets.avatar_icon
                  }
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
                <p className="text-gray-500">
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* bottom area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 sm:gap-3 p-3">
        {recState === "recording" || recState === "paused" ? (
          // ---------- recording bar ----------
          <div className="flex-1 flex items-center gap-3 bg-gray-100/12 px-4 py-2.5 rounded-full min-w-0">
            <button
              onClick={() => stopRecording(true)}
              title="Cancel"
              className="cursor-pointer text-white/60 hover:text-red-300 transition-colors shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                recState === "paused" ? "bg-white/40" : "bg-red-500 animate-pulse"
              }`}
            />
            <span className="text-sm text-white/80 tabular-nums">
              {formatTimer(elapsed)}
            </span>
            <span className="flex-1 text-xs text-white/40 truncate">
              {recState === "paused" ? "Paused" : "Recording..."}
            </span>
            <button
              onClick={recState === "paused" ? resumeRecording : pauseRecording}
              title={recState === "paused" ? "Resume" : "Pause"}
              className="cursor-pointer text-white/70 hover:text-white transition-colors shrink-0"
            >
              {recState === "paused" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4l14 8-14 8V4z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              )}
            </button>
          </div>
        ) : recState === "preview" ? (
          // ---------- listen back before sending ----------
          <div className="flex-1 flex items-center gap-3 bg-gray-100/12 px-4 py-2.5 rounded-full min-w-0">
            <audio
              ref={previewAudioRef}
              src={preview?.url}
              onEnded={() => setPreviewPlaying(false)}
            />
            <button
              onClick={discardPreview}
              title="Discard"
              className="cursor-pointer text-white/60 hover:text-red-300 transition-colors shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
            <button
              onClick={togglePreview}
              title={previewPlaying ? "Pause" : "Play"}
              className="shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors"
            >
              {previewPlaying ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4l14 8-14 8V4z" />
                </svg>
              )}
            </button>
            <span className="text-sm text-white/80 tabular-nums">
              {formatTimer(preview?.duration || 0)}
            </span>
            <span className="flex-1 text-xs text-white/40 truncate">
              Tap send when you are happy
            </span>
          </div>
        ) : (
          <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full min-w-0">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
              type="text"
              placeholder={sending ? "Sending voice note..." : "Send a message"}
              className="flex-1 min-w-0 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-white/40"
            />
            <input
              onChange={handleSendImage}
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              hidden
            />
            <label htmlFor="image">
              <img
                src={assets.gallery_icon}
                alt=""
                className="w-5 mr-2 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* mic when there is nothing typed, send button otherwise - like whatsapp */}
        {recState === "recording" || recState === "paused" ? (
          <button
            onClick={() => stopRecording(false)}
            title="Stop recording"
            className="w-10 h-10 shrink-0 rounded-full bg-violet-500/70 hover:bg-violet-500 border border-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </button>
        ) : recState === "preview" ? (
          <button
            onClick={sendRecording}
            title="Send voice note"
            className="w-10 h-10 shrink-0 rounded-full bg-violet-500/70 hover:bg-violet-500 border border-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            <img src={assets.send_button} alt="send" className="w-4" />
          </button>
        ) : input.trim() ? (
          <img
            onClick={handleSendMessage}
            src={assets.send_button}
            alt=""
            className="w-7 shrink-0 cursor-pointer"
          />
        ) : (
          <button
            onClick={startRecording}
            title="Record a voice note"
            disabled={sending}
            className="w-10 h-10 shrink-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-white/80"
            >
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
              <line x1="12" y1="18" x2="12" y2="22" />
            </svg>
          </button>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo2} alt="logo" className="max-w-20" />
      <p className="text-lg font-large bg-gradient-to-r from-orange-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        Chat with your Homie!
      </p>
    </div>
  );
};

export default ChatContainer;
