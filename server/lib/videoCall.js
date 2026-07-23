import User from "../models/User.js";
import Room from "../models/Room.js";

// ---------------------------------------------------------------------------
// Video call signalling.
//
// Calls are deliberately kept in memory only - a call is a live thing, there is
// nothing worth writing to mongo once everybody has hung up. Media never
// touches the server: peers talk to each other over WebRTC and we only relay
// the offers, answers and ICE candidates that get them connected.
// ---------------------------------------------------------------------------

// code -> call
const calls = new Map();

// same alphabet the room codes use - no confusing 0/O or 1/I
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const makeCallCode = () => {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
};

const generateUniqueCallCode = () => {
  for (let i = 0; i < 20; i++) {
    const code = makeCallCode();
    if (!calls.has(code)) return code;
  }
  return `${makeCallCode()}${makeCallCode()}`;
};

// mesh WebRTC gets expensive fast, so cap the room size
const MAX_PARTICIPANTS = 8;

const publicParticipant = (participant) => ({
  userId: participant.userId,
  fullname: participant.fullname,
  profilePic: participant.profilePic,
  mic: participant.mic,
  cam: participant.cam,
  sharing: participant.sharing,
});

const publicCall = (call) => ({
  code: call.code,
  title: call.title,
  roomId: call.roomId,
  hostId: call.hostId,
  createdAt: call.createdAt,
});

// everyone currently in the call, optionally skipping one person
const peersOf = (call, exceptUserId) =>
  [...call.participants.values()].filter((p) => p.userId !== exceptUserId);

const emitToCall = (io, call, event, payload, exceptUserId) => {
  peersOf(call, exceptUserId).forEach((peer) => {
    io.to(peer.socketId).emit(event, payload);
  });
};

// drop a user from a call and tell the rest; cleans up empty calls
const removeFromCall = (io, code, userId) => {
  const call = calls.get(code);
  if (!call || !call.participants.has(userId)) return;

  call.participants.delete(userId);

  if (call.participants.size === 0) {
    calls.delete(code);
    return;
  }

  // if the host walked out, hand the call to whoever has been there longest
  if (call.hostId === userId) {
    call.hostId = [...call.participants.values()][0].userId;
  }

  emitToCall(io, call, "call:peer-left", { code, userId, hostId: call.hostId });
};

export const registerCallHandlers = (io, socket, userId, userSocketMap) => {
  if (!userId) return;

  // load the profile once per connection, it is all we need to describe a peer
  const loadProfile = async () => {
    const user = await User.findById(userId).select("fullname profilePic");
    return {
      userId,
      fullname: user?.fullname || "Someone",
      profilePic: user?.profilePic || "",
    };
  };

  // ring a list of users on every device they have open
  const ring = (targets, payload) => {
    targets
      .map((id) => id?.toString())
      .filter((id) => id && id !== userId)
      .forEach((id) => {
        const socketId = userSocketMap[id];
        if (socketId) io.to(socketId).emit("call:incoming", payload);
      });
  };

  // ---------------------------------------------------------------- create --
  // Start a brand new call. `invite` is optional - without it the call is just
  // a code you can hand out to anybody.
  socket.on("call:create", async ({ title, roomId, invite } = {}, ack) => {
    try {
      const profile = await loadProfile();
      const code = generateUniqueCallCode();

      let roomName = "";
      if (roomId) {
        const room = await Room.findById(roomId).select("name");
        roomName = room?.name || "";
      }

      const call = {
        code,
        title: (title && title.trim()) || "Video call",
        roomId: roomId || null,
        roomName,
        hostId: userId,
        createdAt: Date.now(),
        participants: new Map(),
        chat: [],
      };

      call.participants.set(userId, {
        ...profile,
        socketId: socket.id,
        mic: true,
        cam: true,
        sharing: false,
      });
      calls.set(code, call);

      if (Array.isArray(invite) && invite.length > 0) {
        ring(invite, {
          code,
          title: call.title,
          roomName,
          from: profile,
        });
      }

      ack?.({ success: true, call: publicCall(call), peers: [] });
    } catch (error) {
      console.log("Error creating call", error);
      ack?.({ success: false, message: "Could not start the call" });
    }
  });

  // ------------------------------------------------------------------ join --
  socket.on("call:join", async ({ code } = {}, ack) => {
    try {
      const callCode = (code || "").trim().toUpperCase();
      const call = calls.get(callCode);

      if (!call) {
        return ack?.({
          success: false,
          message: "That call has ended or the code is wrong",
        });
      }
      if (
        !call.participants.has(userId) &&
        call.participants.size >= MAX_PARTICIPANTS
      ) {
        return ack?.({ success: false, message: "This call is full" });
      }

      const profile = await loadProfile();
      const peers = peersOf(call, userId).map(publicParticipant);

      call.participants.set(userId, {
        ...profile,
        socketId: socket.id,
        mic: true,
        cam: true,
        sharing: false,
      });

      // the people already inside wait for the newcomer to offer, which keeps
      // the negotiation one-directional and free of glare
      emitToCall(
        io,
        call,
        "call:peer-joined",
        { code: callCode, participant: publicParticipant(call.participants.get(userId)) },
        userId,
      );

      ack?.({
        success: true,
        call: publicCall(call),
        peers,
        chat: call.chat.slice(-100),
      });
    } catch (error) {
      console.log("Error joining call", error);
      ack?.({ success: false, message: "Could not join the call" });
    }
  });

  // ---------------------------------------------------------------- invite --
  // pull more people into a call that is already running
  socket.on("call:invite", async ({ code, invite } = {}) => {
    const call = calls.get((code || "").toUpperCase());
    if (!call || !call.participants.has(userId)) return;
    const profile = call.participants.get(userId);
    ring(Array.isArray(invite) ? invite : [], {
      code: call.code,
      title: call.title,
      roomName: call.roomName,
      from: publicParticipant(profile),
    });
  });

  // ---------------------------------------------------------------- signal --
  // opaque relay for offers / answers / ICE candidates
  socket.on("call:signal", ({ code, to, data } = {}) => {
    const call = calls.get((code || "").toUpperCase());
    if (!call || !call.participants.has(userId)) return;
    const target = call.participants.get(to);
    if (!target) return;
    io.to(target.socketId).emit("call:signal", { code: call.code, from: userId, data });
  });

  // ----------------------------------------------------------- media state --
  socket.on("call:state", ({ code, mic, cam, sharing } = {}) => {
    const call = calls.get((code || "").toUpperCase());
    const me = call?.participants.get(userId);
    if (!me) return;

    if (typeof mic === "boolean") me.mic = mic;
    if (typeof cam === "boolean") me.cam = cam;
    if (typeof sharing === "boolean") me.sharing = sharing;

    emitToCall(
      io,
      call,
      "call:peer-state",
      { code: call.code, userId, mic: me.mic, cam: me.cam, sharing: me.sharing },
      userId,
    );
  });

  // ------------------------------------------------------------ side panel --
  socket.on("call:chat", ({ code, text } = {}) => {
    const call = calls.get((code || "").toUpperCase());
    const me = call?.participants.get(userId);
    if (!me || !text || !text.trim()) return;

    const message = {
      id: `${Date.now()}-${userId}`,
      userId,
      fullname: me.fullname,
      profilePic: me.profilePic,
      text: text.trim().slice(0, 500),
      at: Date.now(),
    };
    call.chat.push(message);
    if (call.chat.length > 200) call.chat.shift();

    // everyone else, then the sender - emitToCall has to skip the sender or
    // they get their own message twice
    emitToCall(io, call, "call:chat", { code: call.code, message }, userId);
    socket.emit("call:chat", { code: call.code, message });
  });

  socket.on("call:reaction", ({ code, emoji } = {}) => {
    const call = calls.get((code || "").toUpperCase());
    const me = call?.participants.get(userId);
    if (!me || !emoji) return;

    const payload = {
      code: call.code,
      id: `${Date.now()}-${userId}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      fullname: me.fullname,
      emoji: String(emoji).slice(0, 8),
    };
    emitToCall(io, call, "call:reaction", payload, userId);
    socket.emit("call:reaction", payload);
  });

  // ----------------------------------------------------------------- leave --
  socket.on("call:leave", ({ code } = {}) => {
    removeFromCall(io, (code || "").toUpperCase(), userId);
  });

  // someone was rung and said no - let the caller know so the UI can react
  socket.on("call:decline", async ({ code } = {}) => {
    const call = calls.get((code || "").toUpperCase());
    if (!call) return;
    const profile = await loadProfile();
    emitToCall(io, call, "call:declined", { code: call.code, from: profile }, userId);
  });

  // a dropped socket should not leave a ghost tile in everyone else's grid
  socket.on("disconnect", () => {
    [...calls.keys()].forEach((code) => {
      const call = calls.get(code);
      if (call?.participants.get(userId)?.socketId === socket.id) {
        removeFromCall(io, code, userId);
      }
    });
  });
};
