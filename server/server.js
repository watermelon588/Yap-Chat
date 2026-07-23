import express from 'express';
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import "dotenv/config";
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import {Server} from "socket.io";
import { registerCallHandlers } from './lib/videoCall.js';

// refuse to boot without a signing key rather than falling back to something
// predictable - an app that starts with a weak secret is worse than one that
// does not start at all
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    throw new Error("JWT_SECRET is missing or too short (needs 16+ characters)");
}

// Create express app and HTTP server

const app = express();
const server = http.createServer(app);

// Which origins may talk to this API. Set CLIENT_URL in production (comma
// separated for more than one); we only fall back to "*" in development.
const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOrigin = allowedOrigins.length > 0 ? allowedOrigins : "*";

if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
    console.warn("[security] CLIENT_URL is not set - the API is accepting any origin");
}

// initialize socket.io server

export const io = new Server(server,{
    cors: {
        origin: corsOrigin,
        methods: ["GET", "POST", "PUT"]
    },
    maxHttpBufferSize: 1e6
})

// Store online users

export const userSocketMap = {};

// ---------------------------------------------------------------------------
// Socket authentication.
//
// The identity has to come from a signed token, never from the client. When it
// came from handshake.query.userId anybody could claim someone else's id and
// the server would happily route that person's calls and messages to them.
// ---------------------------------------------------------------------------
io.use((socket, next) => {
    const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token || typeof token !== "string") {
        return next(new Error("Authentication required"));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.userID) return next(new Error("Authentication required"));
        socket.userId = decoded.userID.toString();
        next();
    } catch {
        next(new Error("Authentication required"));
    }
});

// Socket.io connection handling

io.on("connection",(socket)=>{
    const userId = socket.userId;

    userSocketMap[userId] = socket.id;

    // Emmit online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Video call signalling (offers, answers, ICE, side panel chat)
    registerCallHandlers(io, socket, userId, userSocketMap);

    socket.on("disconnect",()=>{
        // only clear the mapping if it still points at this socket, otherwise a
        // stale disconnect can knock a freshly reconnected tab offline
        if (userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
})

// Middleware setup

app.set("trust proxy", 1);
app.use(helmet({
    // the API only serves JSON; CSP belongs to whatever hosts the frontend
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({limit : '4mb'}));
app.use(cors({ origin: corsOrigin }));

// Signup and login are the endpoints worth brute forcing, so they get a much
// tighter budget than the rest of the API.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts, try again later" }
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Slow down a moment" }
});

app.use("/api", apiLimiter);

// Route setup
app.use("/api/status", (req, res) => {
    res.send("Server is running");
});
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/rooms", roomRouter);

// Connect to MongoDB
await connectDB();
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
