import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Content-Type:", req.get("Content-Type"));

  // Check if req.body exists and has required properties
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      message:
        "Invalid request body. Please send JSON data with Content-Type: application/json",
    });
  }

  const { fullName, email, password } = req.body;

  // Validate required fields
  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "Please provide fullName, email, and password",
    });
  }

  try {
    //has the password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);

      await newUser.save();

      return res.status(201).json({
        message: "User registered successfully.",
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePicture: newUser.profilePicture,
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid user data." });
    }
  } catch (err) {
    console.error("Error during user signup:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    generateToken(user._id, res);

    res.status(200).json({
      message: "Login successful.",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    console.error("Error during user logout:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required." });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json({
      message: "Profile picture updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error checking authentication:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};
