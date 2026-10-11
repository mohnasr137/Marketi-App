const path = require("path");
const fs = require("fs");
const User = require("../../models/user.js");

const addImage = async (req, res) => {
  try {
    const userId = req.userId;
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const imagePath = req.file.path.replace(/\\/g, "/");
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "User not found" });
    }

    // Safely delete previous custom avatar if one existed and is not default
    if (existingUser.image && !existingUser.image.includes("simple.jpg")) {
      const oldAvatarPath = path.join(__dirname, "../../", existingUser.image);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
        } catch (err) {
          console.warn("Could not delete previous avatar:", err.message);
        }
      }
    }

    await User.updateOne({ _id: userId }, { $set: { image: imagePath } });
    return res.status(200).json({
      message: "Avatar uploaded successfully",
      image: imagePath,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const userData = async (req, res) => {
  try {
    const userId = req.userId;
    const existingUser = await User.findById(userId).select(
      "name email gender image type address phone verify createdAt"
    );

    if (existingUser) {
      return res.status(200).json({
        user: existingUser,
        message: existingUser, // Maintain backward compatibility
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, gender, image, type, address, phone } = req.body;
    const query = {};

    if (name) query.name = name.trim();
    if (email) query.email = email.trim().toLowerCase();
    if (gender) query.gender = gender;
    if (image) query.image = image;
    if (type) query.type = type;
    if (address) query.address = address;
    if (phone) query.phone = phone.trim();

    if (Object.keys(query).length === 0) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    await User.updateOne({ _id: userId }, { $set: query });
    const updatedUser = await User.findById(userId).select(
      "name email gender image type address phone verify"
    );

    return res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addImage, userData, editUserData };
