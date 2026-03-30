import jwt from "jsonwebtoken";

// Function to generate a JWT token
export const generateToken = (userID)=>{
    const token = jwt.sign({userID}, process.env.JWT_SECRET, {expiresIn: "7d"});
    return token;
}