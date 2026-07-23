import Room from "../models/Room.js";
import { io, userSocketMap } from "../server.js";

// Characters used for auto generated room codes (no confusing 0/O, 1/I)
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const makeCode = (length = 6) => {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
};

// generate a code that is not already taken
const generateUniqueCode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = makeCode();
    const existing = await Room.findOne({ code });
    if (!existing) return code;
  }
  return makeCode(8);
};

const isValidCode = (code) => /^[A-Z0-9-]{4,20}$/.test(code);

// populate members without exposing passwords
const populateRoom = (query) =>
  query.populate("members", "-password").populate("createdBy", "-password");

// Create a new room. Code is optional - user can pick their own.
export const createRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, code } = req.body;

    let roomCode;
    if (code && code.trim()) {
      roomCode = code.trim().toUpperCase();
      if (!isValidCode(roomCode)) {
        return res.json({
          success: false,
          message: "Code must be 4-20 letters, numbers or dashes",
        });
      }
      const existing = await Room.findOne({ code: roomCode });
      if (existing) {
        return res.json({
          success: false,
          message: "That code is already taken, try another one",
        });
      }
    } else {
      roomCode = await generateUniqueCode();
    }

    const room = await Room.create({
      code: roomCode,
      name: (name && name.trim()) || `Room ${roomCode}`,
      createdBy: userId,
      members: [userId],
    });

    const populated = await populateRoom(Room.findById(room._id));

    res.json({
      success: true,
      message: "Room created successfully",
      room: populated,
    });
  } catch (error) {
    console.log("Error creating room", error);
    res.json({
      success: false,
      message: "Error creating room",
    });
  }
};

// Join an existing room using its code
export const joinRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.json({ success: false, message: "Room code is required" });
    }

    const roomCode = code.trim().toUpperCase();
    const room = await Room.findOne({ code: roomCode });

    if (!room) {
      return res.json({ success: false, message: "No room found with that code" });
    }

    const alreadyMember = room.members.some(
      (member) => member.toString() === userId.toString(),
    );
    if (!alreadyMember) {
      room.members.push(userId);
      await room.save();
    }

    const populated = await populateRoom(Room.findById(room._id));

    // let everyone already in the room know the member list changed
    if (!alreadyMember) {
      room.members.forEach((member) => {
        const socketId = userSocketMap[member.toString()];
        if (socketId) io.to(socketId).emit("roomUpdated", { roomId: room._id });
      });
    }

    res.json({
      success: true,
      message: alreadyMember
        ? `Back in ${populated.name}`
        : `Joined ${populated.name}`,
      room: populated,
    });
  } catch (error) {
    console.log("Error joining room", error);
    res.json({
      success: false,
      message: "Error joining room",
    });
  }
};

// Get every room the logged in user belongs to
export const getMyRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const rooms = await populateRoom(
      Room.find({ members: userId }).sort({ updatedAt: -1 }),
    );

    res.json({
      success: true,
      message: "Rooms fetched successfully",
      rooms,
    });
  } catch (error) {
    console.log("Error fetching rooms", error);
    res.json({
      success: false,
      message: "Error fetching rooms",
    });
  }
};

// Leave a room
export const leaveRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    room.members = room.members.filter(
      (member) => member.toString() !== userId.toString(),
    );
    await room.save();

    res.json({ success: true, message: `Left ${room.name}` });
  } catch (error) {
    console.log("Error leaving room", error);
    res.json({
      success: false,
      message: "Error leaving room",
    });
  }
};
