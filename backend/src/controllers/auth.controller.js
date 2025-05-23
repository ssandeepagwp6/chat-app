import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const singup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({message: "Please fill all fields"}); // 400 Bad Request
        }

        if (password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }

        const user = await User.findOne({email});

        if (user) return res.status(400).json({message: "User already exists"});

        const salt  = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            return res.status(400).json({message: "Invalid user data"});
            res.status(500).json({message: "Internal server error"});
        }

    } catch (error) {

    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});

        if (!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log("Error in login controller: ", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie("jwt","", {MaxAge: 0});
        res.status(200).json({message: "Logged out successfully"});

    } catch (error) {
        console.log("Error in logout controller: ", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const updateProfile = async (req, res) => {
    try {
      const { profilePic, fullName } = req.body;
      const userId = req.user._id;
  
      const updateFields = {};
  
      // Handle profile picture update
      if (profilePic) {
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        updateFields.profilePic = uploadResponse.secure_url;
      }
  
      // Handle full name update
      if (fullName && fullName.trim()) {
        updateFields.fullName = fullName.trim();
      }
  
      // If no valid fields to update
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
  
      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
        new: true,
      });
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error in updateProfile:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };  

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller: ", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};
