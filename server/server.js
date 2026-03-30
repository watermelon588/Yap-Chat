import express from 'express';
import cors from 'cors';
import http from 'http';
import "dotenv/config";
import { connectDB } from './lib/db.js';
import { connect } from 'http2';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from "socket.io";

// Create express app and HTTP server

const app = express();
const server = http.createServer(app);

// initialize socket.io server

export const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
})

// Store online users

export const userSocketMap = {};

// Socket.io connection handling

io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User connected with ID:", userId);

    if(userId) userSocketMap[userId] = socket.id;

    // Emmit online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User disconnected with ID:", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})
// Middleware setup

app.use(express.json({limit : '4mb'}));
app.use(cors());

// Route setup
app.use("/api/status", (req, res) => {
    res.send("Server is running");
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`); 
})