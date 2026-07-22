import Message from "../models/Message.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import cloudinary from "../lib/cloudinary.js";
import {io, userSocketMap} from "../server.js";

// MediaRecorder hands us "data:audio/webm;codecs=opus;base64,..." and cloudinary
// rejects the extra codec parameter with "Unsupported source URL", so drop it
const stripDataUriParams = (dataUri) => {
  if (typeof dataUri !== "string" || !dataUri.startsWith("data:")) return dataUri;
  const marker = ";base64,";
  const index = dataUri.indexOf(marker);
  if (index === -1) return dataUri;
  const mime = dataUri.slice(5, index).split(";")[0];
  return `data:${mime}${marker}${dataUri.slice(index + marker.length)}`;
};

// pull the cloudinary public id back out of a delivery url so we can destroy the
// asset when its message is deleted
const publicIdFromUrl = (url) => {
  if (typeof url !== "string") return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  return parts[1].replace(/^v\d+\//, "").replace(/\.[a-z0-9]+$/i, "");
};

// helper: load a room and make sure the requester is a member of it
const getMemberRoom = async (roomId, userId) => {
  if (!roomId) return null;
  const room = await Room.findById(roomId);
  if (!room) return null;
  const isMember = room.members.some(
    (member) => member.toString() === userId.toString(),
  );
  return isMember ? room : null;
};

// Get all members of the active room except the logged in user
export const getUsersforSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.query;

    const room = await getMemberRoom(roomId, userId);
    if (!room) {
      return res.json({
        success: false,
        message: "Join a room first to see people here",
      });
    }

    const memberIds = room.members.filter(
      (member) => member.toString() !== userId.toString(),
    );

    const filterUsers = await User.find({ _id: { $in: memberIds } }).select(
      "-password",
    );

    // count number of unseen messages for each user in this room
    const unseenMessages = {};
    const promises = filterUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        roomId: room._id,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    })
    await Promise.all(promises);
    res.json({
      success: true,
      message: "Users fetched successfully",
      users: filterUsers,
      unseenMessages
    });
  } catch (error) {
    console.log("Error fetching users for sidebar", error);
    res.json({
      success: false,
      message: "Error fetching users for sidebar",
      error: error.message,
    });
  }
};

// get all messages for selected user inside the active room
export const getMessages = async (req, res) => {
  try {
    const {id: selectedUserId} = req.params;
    const {roomId} = req.query;
    const myId = req.user._id;

    const room = await getMemberRoom(roomId, myId);
    if (!room) {
      return res.json({ success: false, message: "Room not found or you are not a member" });
    }

    const messages = await Message.find({
        roomId: room._id,
        $or: [
            {senderId: myId, receiverId: selectedUserId},
            {senderId: selectedUserId, receiverId: myId}
        ]
    });

    await Message.updateMany({
        senderId: selectedUserId,
        receiverId: myId,
        roomId: room._id,
        seen: false
    }, {seen: true});

    res.json({
      success: true,
      message: "Messages fetched successfully",
      messages
    });
  }catch(error){
    console.log("Error fetching messages", error);
    res.json({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const {id: messageId} = req.params;
        await Message.findByIdAndUpdate(messageId, {seen: true});
        res.json({
            success: true,
            message: "Message marked as seen successfully",
        });
    } catch (error) {
        console.log("Error marking message as seen", error);
        res.json({
            success: false,
            message: "Error marking message as seen",
            error: error.message,
        });
    }
}

// delete a message for everyone - only the sender can do this. the message row
// stays behind as a tombstone so both sides see "this message was deleted"
export const deleteMessage = async (req, res) => {
    try {
        const {id: messageId} = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.json({ success: false, message: "Message not found" });
        }
        if (message.senderId.toString() !== userId.toString()) {
            return res.json({ success: false, message: "You can only delete your own messages" });
        }

        if (!message.deleted) {
            // drop the media from cloudinary too, a failure here should not block the delete
            const media = [
                { url: message.image, type: "image" },
                { url: message.audio, type: "video" },
            ];
            for (const { url, type } of media) {
                const publicId = publicIdFromUrl(url);
                if (!publicId) continue;
                try {
                    await cloudinary.uploader.destroy(publicId, { resource_type: type });
                } catch (error) {
                    console.log("Could not remove media from cloudinary", error.message);
                }
            }

            message.deleted = true;
            message.text = undefined;
            message.image = undefined;
            message.audio = undefined;
            message.audioDuration = 0;
            await message.save();
        }

        // tell the other side to swap their copy for a tombstone
        const receiverSocketId = userSocketMap[message.receiverId.toString()];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", {
                messageId: message._id,
                roomId: message.roomId,
            });
        }

        res.json({
            success: true,
            message: "Message deleted",
            messageId: message._id,
        });
    } catch (error) {
        console.log("Error deleting message", error);
        res.json({
            success: false,
            message: "Error deleting message",
            error: error.message,
        });
    }
}

// send message to selected user inside the active room
export const sendMessage = async (req, res) => {
    try {
        const {text, image, audio, audioDuration, roomId} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        const room = await getMemberRoom(roomId, senderId);
        if (!room) {
            return res.json({ success: false, message: "Room not found or you are not a member" });
        }

        const receiverInRoom = room.members.some(
            (member) => member.toString() === receiverId.toString(),
        );
        if (!receiverInRoom) {
            return res.json({ success: false, message: "That user is not in this room" });
        }

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }

        // voice notes go up as "video" resources, that is how cloudinary handles audio
        let audioUrl;
        let audioSeconds = 0;
        if(audio){
            const uploadResponse = await cloudinary.uploader.upload(stripDataUriParams(audio), {
                resource_type: "video",
                folder: "voice_notes"
            });
            // the raw webm comes back as content-type video/webm and safari cannot play it
            // at all, so ask cloudinary to transcode on delivery to mp3 instead
            audioUrl = uploadResponse.secure_url.replace(/\.[a-z0-9]+$/i, ".mp3");
            // cloudinary probes the real length, trust it over the client side timer
            audioSeconds = uploadResponse.duration || Number(audioDuration) || 0;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            roomId: room._id,
            text,
            image: imageUrl,
            audio: audioUrl,
            audioDuration: Math.round(audioSeconds)
        });
        await newMessage.save();
        // emmit the new message to the receiver if online
        const receiverSocketId =  userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({
            success: true,
            Message: "Message sent successfully",
            message: newMessage
        });

    } catch (error) {
        console.log("Error sending message", error);
        res.json({
            success: false,
            message: "Error sending message",
            error: error.message,
        });
    }
}
