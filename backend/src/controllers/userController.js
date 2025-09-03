const userModel = require("../models/userModel");
const { passwordEncryption, comparePassword } = require("../libs/hashPassword");
const crypto = require("crypto");
const generateToken = require("../libs/TokenGen");
const registerUser = async (req, res) => {
  try {
    const { name, userName, profilePic, email, password, role } = req.body;
    if (!name || !userName || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All Fields are Required" });

    const userEmailExistence = await userModel.findOne({
      email,
    });
    if (userEmailExistence)
      return res
        .status(400)
        .json({ success: false, message: "User by This Email Already Exists" });
    const userNameExistence = await userModel.findOne({ userName });

    if (userNameExistence) {
      const randomString = crypto.randomBytes(2).toString("hex");
      const suggestion = `${userName}_${randomString}`;

      return res.status(400).json({
        success: false,
        message: "Username already taken",
        suggestion,
      });
    }

    const hashedPassword = await passwordEncryption(password);
    const user = await userModel.create({
      name,
      userName,
      email,
      password: hashedPassword,
      profilePic,
      role: role || "user",
    });
    if (user) {
      generateToken(user._id, res);
      await user.save();
      return res
        .status(201)
        .json({ success: true, message: "User Created Successfully", user });
    }
  } catch (error) {
    console.error("Error creating User", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Credentials" });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Credentials" });
    }
    generateToken(user._id, res);
    return res
      .status(200)
      .json({ success: true, message: `User Logged In Successfully`, user });
  } catch (error) {
    console.error("Error loging User", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const logOutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res
      .status(200)
      .json({ success: true, message: `User logged Out successfully` });
  } catch (error) {
    console.error("Error loging out User", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userName, email, password, profilePic } = req.body;
    const userId = req.user._id;

    const existence = await userModel.findOne({ email });
    if (existence) {
      return res.status(400).json({
        success: false,
        message: `User by Email: ${email} already exists`,
      });
    }
    const userNameExistence = await userModel.findOne({ userName });
    if (userNameExistence) {
      const randomString = crypto.randomBytes(2).toString("hex");
      const suggestion = `${userName}_${randomString}`;

      return res.status(400).json({
        success: false,
        message: "Username already taken",
        suggestion,
      });
    }
    if (!userName && !email && !password && !profilePic) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide at least one field to update (email, password, or profilePic)",
      });
    }

    const updateData = {};

    if (userName) {
      updateData.userName = userName;
    }
    if (email) {
      updateData.email = email;
    }

    if (password) {
      // Hash password before saving
      const hashedPassword = await passwordEncryption(password);
      updateData.password = hashedPassword;
    }

    // if (profilePic) {
    //   const uploadedProfilePic = await cloudinary.uploader.upload(profilePic);
    //   updateData.profilePic = uploadedProfilePic.secure_url;
    // }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //remove sensitive fields before returning
    updatedUser.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updating User", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const checkAuth = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "User is authorized", user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  updateUser,
  checkAuth,
};
