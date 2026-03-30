import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        mongoose.connection.on('connected',() => console.log("Database Connected succesfully"))
        await mongoose.connect(`${process.env.MONGODB_URI}/chat_app`)
    } catch (e) {
        console.log("Error connecting to database", e); 
    }
}