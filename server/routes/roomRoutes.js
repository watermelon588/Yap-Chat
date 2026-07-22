import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createRoom, joinRoom, getMyRooms, leaveRoom } from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.post("/create", protectRoute, createRoom);
roomRouter.post("/join", protectRoute, joinRoom);
roomRouter.get("/my", protectRoute, getMyRooms);
roomRouter.delete("/leave/:id", protectRoute, leaveRoom);

export default roomRouter;
