import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Authcontext } from "./AuthContext";

// ---------------------------------------------------------------------------
// Video calling.
//
// Media is peer to peer (a WebRTC mesh), the server only ever relays the
// handshake. A mesh is the right shape here: no media server to run, and with
// the 8 person cap the extra uploads stay reasonable.
// ---------------------------------------------------------------------------

export const CallContext = createContext();

// Public STUN is enough for most networks. Symmetric NATs need a TURN relay -
// drop the credentials in the client env and it gets picked up automatically.
const buildIceServers = () => {
  const servers = [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
  ];
  const turnUrl = import.meta.env.VITE_TURN_URL;
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    });
  }
  return servers;
};

export const CallProvider = ({ children }) => {
  const { socket, authUser } = useContext(Authcontext);

  // idle -> connecting -> active
  const [callState, setCallState] = useState("idle");
  const [call, setCall] = useState(null); // { code, title, roomId, hostId }
  const [participants, setParticipants] = useState([]); // everyone but me
  const [streams, setStreams] = useState({}); // userId -> MediaStream
  const [localStream, setLocalStream] = useState(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);

  const [chat, setChat] = useState([]);
  const [reactions, setReactions] = useState([]); // transient floating emojis
  const [unreadChat, setUnreadChat] = useState(0);

  const [incoming, setIncoming] = useState(null); // { code, title, from, roomName }

  const peersRef = useRef({}); // userId -> RTCPeerConnection
  const pendingIceRef = useRef({}); // candidates that arrived before the answer
  const localStreamRef = useRef(null);
  const cameraTrackRef = useRef(null); // parked while screen sharing
  const codeRef = useRef(null);
  const ringtoneRef = useRef(null);

  const inCall = callState !== "idle";

  // ------------------------------------------------------------- plumbing --

  const signal = (to, data) => {
    if (!codeRef.current) return;
    socket?.emit("call:signal", { code: codeRef.current, to, data });
  };

  const flushIce = async (peerId, pc) => {
    const queued = pendingIceRef.current[peerId] || [];
    pendingIceRef.current[peerId] = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        /* a candidate we cannot use is not worth breaking the call over */
      }
    }
  };

  const createPeer = (peerId, initiator) => {
    if (peersRef.current[peerId]) return peersRef.current[peerId];

    const pc = new RTCPeerConnection({ iceServers: buildIceServers() });
    peersRef.current[peerId] = pc;
    pendingIceRef.current[peerId] = pendingIceRef.current[peerId] || [];

    pc.onicecandidate = (event) => {
      if (event.candidate) signal(peerId, { type: "ice", candidate: event.candidate });
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;
      setStreams((prev) => ({ ...prev, [peerId]: stream }));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        // one bad leg should not take the whole call down, so try once more
        pc.restartIce?.();
      }
    };

    // only the newcomer offers, which keeps negotiation one-directional and
    // means we never have to deal with glare
    if (initiator) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          signal(peerId, { type: "offer", sdp: pc.localDescription });
        } catch {
          /* the peer probably left mid-handshake */
        }
      };
    }

    const stream = localStreamRef.current;
    stream?.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Always put an audio *and* a video m-line in the session, even when this
    // device has neither. An offer that omits a kind gives the other side
    // nowhere to attach its own track, and because only the joiner ever offers
    // there is no renegotiation to repair it - one person without a camera
    // would otherwise blank out everybody's video for the whole call.
    ["audio", "video"].forEach((kind) => {
      const hasKind = stream?.getTracks().some((track) => track.kind === kind);
      if (!hasKind) pc.addTransceiver(kind, { direction: "recvonly" });
    });

    return pc;
  };

  const closePeer = (peerId) => {
    const pc = peersRef.current[peerId];
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onnegotiationneeded = null;
      pc.onconnectionstatechange = null;
      pc.close();
    }
    delete peersRef.current[peerId];
    delete pendingIceRef.current[peerId];
    setStreams((prev) => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  };

  const teardown = () => {
    Object.keys(peersRef.current).forEach(closePeer);
    peersRef.current = {};
    pendingIceRef.current = {};

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraTrackRef.current?.stop();
    cameraTrackRef.current = null;
    localStreamRef.current = null;
    codeRef.current = null;

    setLocalStream(null);
    setStreams({});
    setParticipants([]);
    setChat([]);
    setReactions([]);
    setUnreadChat(0);
    setCall(null);
    setCallState("idle");
    setMicOn(true);
    setCamOn(true);
    setSharing(false);
  };

  // grab camera + mic, degrading gracefully so a missing webcam still lets you
  // join with audio (or just listen in)
  const getLocalMedia = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("This browser cannot do video calls");
      return null;
    }
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
        toast("No camera found - joining with audio only", { icon: "🎙️" });
        setCamOn(false);
        return audioOnly;
      } catch {
        toast.error("Camera and microphone permission is needed to join");
        return null;
      }
    }
  };

  // ------------------------------------------------------------ public api --

  // Start a call. Pass `invite` to ring people, or leave it out to just get a
  // code you can share around.
  const startCall = async ({ title, roomId, invite = [] } = {}) => {
    if (!socket) return toast.error("Not connected yet, try again in a second");
    if (inCall) return toast.error("You are already in a call");

    setCallState("connecting");
    const stream = await getLocalMedia();
    if (!stream) {
      setCallState("idle");
      return null;
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    const mic = stream.getAudioTracks().some((t) => t.enabled);
    const cam = stream.getVideoTracks().some((t) => t.enabled);
    setMicOn(mic);
    setCamOn(cam);

    return new Promise((resolve) => {
      socket.emit("call:create", { title, roomId, invite }, (res) => {
        if (!res?.success) {
          toast.error(res?.message || "Could not start the call");
          teardown();
          return resolve(null);
        }
        codeRef.current = res.call.code;
        setCall(res.call);
        setCallState("active");
        // the server assumes mic and camera are on - correct it straight away,
        // otherwise a camera-less joiner shows as "Connecting..." forever
        socket.emit("call:state", { code: res.call.code, mic, cam, sharing: false });
        resolve(res.call);
      });
    });
  };

  // Join a call somebody handed you the code for.
  const joinCall = async (code) => {
    if (!socket) return toast.error("Not connected yet, try again in a second");
    if (inCall) return toast.error("You are already in a call");
    const callCode = (code || "").trim().toUpperCase();
    if (!callCode) return toast.error("Enter a call code");

    setCallState("connecting");
    const stream = await getLocalMedia();
    if (!stream) {
      setCallState("idle");
      return null;
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    const mic = stream.getAudioTracks().some((t) => t.enabled);
    const cam = stream.getVideoTracks().some((t) => t.enabled);
    setMicOn(mic);
    setCamOn(cam);

    return new Promise((resolve) => {
      socket.emit("call:join", { code: callCode }, (res) => {
        if (!res?.success) {
          toast.error(res?.message || "Could not join the call");
          teardown();
          return resolve(null);
        }
        codeRef.current = res.call.code;
        setCall(res.call);
        setParticipants(res.peers || []);
        setChat(res.chat || []);
        setCallState("active");
        // tell the room our real mic/camera state before they draw our tile
        socket.emit("call:state", { code: res.call.code, mic, cam, sharing: false });

        // we are the newcomer, so we offer to everybody already inside
        (res.peers || []).forEach((peer) => createPeer(peer.userId, true));
        resolve(res.call);
      });
    });
  };

  const acceptIncoming = async () => {
    const invite = incoming;
    setIncoming(null);
    if (invite) await joinCall(invite.code);
  };

  const declineIncoming = () => {
    if (incoming) socket?.emit("call:decline", { code: incoming.code });
    setIncoming(null);
  };

  const leaveCall = () => {
    if (codeRef.current) socket?.emit("call:leave", { code: codeRef.current });
    teardown();
  };

  // pull more people into a call already in progress
  const inviteToCall = (userIds = []) => {
    if (!codeRef.current || userIds.length === 0) return;
    socket?.emit("call:invite", { code: codeRef.current, invite: userIds });
    toast.success(userIds.length === 1 ? "Ringing them now" : "Ringing them now");
  };

  const broadcastState = (patch) => {
    if (!codeRef.current) return;
    socket?.emit("call:state", { code: codeRef.current, ...patch });
  };

  const toggleMic = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    if (tracks.length === 0) return toast.error("No microphone available");
    const next = !micOn;
    tracks.forEach((track) => (track.enabled = next));
    setMicOn(next);
    broadcastState({ mic: next });
  };

  const toggleCam = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    if (tracks.length === 0) return toast.error("No camera available");
    const next = !camOn;
    tracks.forEach((track) => (track.enabled = next));
    setCamOn(next);
    broadcastState({ cam: next });
  };

  // swap the outgoing video track on every peer - replaceTrack means no
  // renegotiation, so the switch is instant for everyone
  const replaceVideoTrack = async (track) => {
    await Promise.all(
      Object.values(peersRef.current).map(async (pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(track);
      }),
    );
  };

  const stopScreenShare = async () => {
    const camera = cameraTrackRef.current;
    cameraTrackRef.current = null;

    const stream = localStreamRef.current;
    const shareTrack = stream?.getVideoTracks()[0];
    if (shareTrack) {
      shareTrack.stop();
      stream.removeTrack(shareTrack);
    }
    if (camera) {
      camera.enabled = camOn;
      stream?.addTrack(camera);
      await replaceVideoTrack(camera);
    } else {
      await replaceVideoTrack(null);
    }

    setLocalStream(stream ? new MediaStream(stream.getTracks()) : null);
    setSharing(false);
    broadcastState({ sharing: false });
  };

  const toggleScreenShare = async () => {
    if (sharing) return stopScreenShare();
    if (!navigator.mediaDevices?.getDisplayMedia) {
      return toast.error("Screen sharing is not supported on this browser");
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const shareTrack = display.getVideoTracks()[0];
      const stream = localStreamRef.current;

      // park the camera track so we can put it back when sharing stops
      const camera = stream?.getVideoTracks()[0] || null;
      cameraTrackRef.current = camera;
      if (camera) stream.removeTrack(camera);
      stream?.addTrack(shareTrack);

      await replaceVideoTrack(shareTrack);
      shareTrack.onended = () => stopScreenShare();

      setLocalStream(stream ? new MediaStream(stream.getTracks()) : null);
      setSharing(true);
      broadcastState({ sharing: true });
    } catch {
      /* the picker was dismissed */
    }
  };

  const sendCallChat = (text) => {
    if (!codeRef.current || !text?.trim()) return;
    socket?.emit("call:chat", { code: codeRef.current, text });
  };

  const sendReaction = (emoji) => {
    if (!codeRef.current || !emoji) return;
    socket?.emit("call:reaction", { code: codeRef.current, emoji });
  };

  // ----------------------------------------------------------- socket wire --

  useEffect(() => {
    if (!socket) return;

    const onIncoming = (payload) => {
      // already talking to these people, or already being rung by them
      if (codeRef.current === payload.code) return;
      setIncoming((prev) => (prev?.code === payload.code ? prev : payload));
    };

    const onPeerJoined = ({ code, participant }) => {
      if (code !== codeRef.current) return;
      setParticipants((prev) =>
        prev.some((p) => p.userId === participant.userId)
          ? prev
          : [...prev, participant],
      );
      // they will offer to us, we just wait
    };

    const onPeerLeft = ({ code, userId, hostId }) => {
      if (code !== codeRef.current) return;
      closePeer(userId);
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      setCall((prev) => (prev && hostId ? { ...prev, hostId } : prev));
    };

    const onSignal = async ({ code, from, data }) => {
      if (code !== codeRef.current || !data) return;

      if (data.type === "offer") {
        const pc = peersRef.current[from] || createPeer(from, false);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          await flushIce(from, pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          signal(from, { type: "answer", sdp: pc.localDescription });
        } catch {
          /* peer went away mid-handshake */
        }
        return;
      }

      const pc = peersRef.current[from];

      // a candidate can outrun the description it belongs to - park it rather
      // than dropping it on the floor
      if (!pc) {
        if (data.type === "ice") {
          pendingIceRef.current[from] = pendingIceRef.current[from] || [];
          pendingIceRef.current[from].push(data.candidate);
        }
        return;
      }

      if (data.type === "answer") {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          await flushIce(from, pc);
        } catch {
          /* ignore a stale answer */
        }
        return;
      }

      if (data.type === "ice") {
        if (!pc.remoteDescription) {
          pendingIceRef.current[from] = pendingIceRef.current[from] || [];
          pendingIceRef.current[from].push(data.candidate);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch {
          /* nothing we can do about a bad candidate */
        }
      }
    };

    const onPeerState = ({ code, userId, mic, cam, sharing: peerSharing }) => {
      if (code !== codeRef.current) return;
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === userId ? { ...p, mic, cam, sharing: peerSharing } : p,
        ),
      );
    };

    const onChat = ({ code, message }) => {
      if (code !== codeRef.current) return;
      setChat((prev) => [...prev, message]);
      if (message.userId !== authUser?._id) setUnreadChat((n) => n + 1);
    };

    const onReaction = (payload) => {
      if (payload.code !== codeRef.current) return;
      setReactions((prev) => [...prev, payload]);
      // the float only lasts a few seconds, then it is dropped
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== payload.id));
      }, 4000);
    };

    const onDeclined = ({ code, from }) => {
      if (code !== codeRef.current) return;
      toast(`${from?.fullname || "They"} declined`, { icon: "📵" });
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:peer-joined", onPeerJoined);
    socket.on("call:peer-left", onPeerLeft);
    socket.on("call:signal", onSignal);
    socket.on("call:peer-state", onPeerState);
    socket.on("call:chat", onChat);
    socket.on("call:reaction", onReaction);
    socket.on("call:declined", onDeclined);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:peer-joined", onPeerJoined);
      socket.off("call:peer-left", onPeerLeft);
      socket.off("call:signal", onSignal);
      socket.off("call:peer-state", onPeerState);
      socket.off("call:chat", onChat);
      socket.off("call:reaction", onReaction);
      socket.off("call:declined", onDeclined);
    };
  }, [socket, authUser?._id]);

  // a ring that is never answered should not sit there forever
  useEffect(() => {
    if (!incoming) return;
    const timer = setTimeout(() => setIncoming(null), 45000);
    return () => clearTimeout(timer);
  }, [incoming]);

  // logging out mid-call should hang up cleanly
  useEffect(() => {
    if (!authUser && codeRef.current) teardown();
  }, [authUser]);

  // never leave the camera light on
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraTrackRef.current?.stop();
    };
  }, []);

  const value = {
    callState,
    inCall,
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
    clearUnreadChat: () => setUnreadChat(0),
    incoming,
    startCall,
    joinCall,
    acceptIncoming,
    declineIncoming,
    leaveCall,
    inviteToCall,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    sendCallChat,
    sendReaction,
    ringtoneRef,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
