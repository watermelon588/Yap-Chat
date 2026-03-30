import User from "../models/User.js";
import jwt from "jsonwebtoken";
// Middleware to protect routes and verify JWT tokens
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userID).select("-password");

        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Error verifying token", error);
        res.json({success: false, message: "Invalid token"});
    }
}