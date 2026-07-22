import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getUsersforSidebar, getMessages, markMessageAsSeen, sendMessage, deleteMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users",protectRoute, getUsersforSidebar);
messageRouter.get("/:id",protectRoute, getMessages);
messageRouter.put("/mark/:id",protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.delete("/:id", protectRoute, deleteMessage);

export default messageRouter;