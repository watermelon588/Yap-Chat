import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        index: true
    },
    text: {
        type: String, 
    },
    image: {
        type: String,
    },
    audio: {
        type: String,
    },
    audioDuration: {
        type: Number,
        default: 0
    },
    seen: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

const Message = mongoose.model("Message", messageSchema);
export default Message;