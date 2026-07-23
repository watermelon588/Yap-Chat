import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Everything below treats req.body as hostile.
//
// Mongo takes objects as query values, so `{"email": {"$ne": null}}` posted as
// JSON would turn a lookup into a wildcard. Forcing every value we query or
// store to be a real string closes that off.
const asString = (value) => (typeof value === "string" ? value.trim() : "");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// never hand the password hash back to the browser
const publicUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user.toObject ? user.toObject() : user;
  return rest;
};

// Signup a new user
export const signup = async (req, res) => {
  try {
    const email = asString(req.body?.email).toLowerCase();
    const fullname = asString(req.body?.fullname);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const bio = asString(req.body?.bio);

    if (!email || !fullname || !password || !bio) {
      return res.json({ success: false, message: "All fields are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.json({ success: false, message: "Enter a valid email address" });
    }
    // the schema's minlength sits on the hashed value, which is always 60
    // characters, so the real check has to happen here
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }
    if (password.length > 128) {
      return res.json({ success: false, message: "Password is too long" });
    }
    if (fullname.length > 60 || bio.length > 300) {
      return res.json({ success: false, message: "Name or bio is too long" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      fullname,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    res.json({
      success: true,
      message: "User created successfully",
      userData: publicUser(newUser),
      token,
    });
  } catch (error) {
    console.log("Error creating user", error);
    res.json({ success: false, message: "Error creating user" });
  }
};

// Controller to login a user
export const login = async (req, res) => {
  try {
    const email = asString(req.body?.email).toLowerCase();
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const userData = await User.findOne({ email });

    // same message and roughly the same work either way, so the response does
    // not reveal which addresses have accounts
    if (!userData) {
      await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const token = generateToken(userData._id);
    res.json({
      success: true,
      message: "User logged in successfully",
      userData: publicUser(userData),
      token,
    });
  } catch (error) {
    console.log("Error logging in user", error);
    res.json({ success: false, message: "Error logging in user" });
  }
};

// Controller to check if user is authenticated
export const checkAuth = async (req, res) => {
  res.json({ success: true, message: "User is authenticated", user: req.user });
};

// Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const fullname = asString(req.body?.fullname);
    const bio = asString(req.body?.bio);

    if (fullname.length > 60 || bio.length > 300) {
      return res.json({ success: false, message: "Name or bio is too long" });
    }

    const userId = req.user._id;
    // only ever build the update from fields we control - taking req.body
    // wholesale would let a caller set any column on their own document
    const update = { fullname, bio };

    if (profilePic) {
      // Cloudinary happily fetches any URL it is handed, which turns this
      // endpoint into a request proxy. Uploads must be a browser data URI.
      if (typeof profilePic !== "string" || !profilePic.startsWith("data:image/")) {
        return res.json({ success: false, message: "Invalid image upload" });
      }
      const upload = await cloudinary.uploader.upload(profilePic);
      update.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    console.log("Error updating user profile", error);
    res.json({ success: false, message: "Error updating user profile" });
  }
};
