import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import {io, userSocketMap} from "../server.js";

// Get all users except the logged in user
export const getUsersforSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filterUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );

    // count number of unseen messages for each user
    const unseenMessages = {};
    const promises = filterUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
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

// get all messages for selected user 
export const getMessages = async (req, res) => {
  try {
    const {id: selectedUserId} = req.params;
    const myId = req.user._id;
    
    const messages = await Message.find({
        $or: [
            {senderId: myId, receiverId: selectedUserId},
            {senderId: selectedUserId, receiverId: myId}
        ]
    });

    await Message.updateMany({
        senderId: selectedUserId,
        receiverId: myId,
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

// send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
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
