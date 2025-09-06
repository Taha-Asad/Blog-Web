const userModel = require("../models/userModel");
const { passwordEncryption, comparePassword } = require("../libs/hashPassword");
const crypto = require("crypto");
const generateToken = require("../libs/TokenGen");
const SendEmail = require("../libs/nodemailer.js");
const registerUser = async (req, res) => {
  try {
    const { name, userName, profilePic, email, bio, password, role } = req.body;

    // Validate required fields
    if (!name || !userName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if email exists
    const userEmailExistence = await userModel.findOne({ email });
    if (userEmailExistence) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
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

    const hashedPassword = await passwordEncryption(password);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresInMinutes = 15;
    const verificationCodeExpiresAt = new Date(
      Date.now() + expiresInMinutes * 60 * 1000
    );
    const user = await userModel.create({
      name,
      userName,
      email,
      password: hashedPassword,
      profilePic,
      bio,
      role: role || "user",
      isVerified: false,
      verificationCode,
      verificationCodeExpires: verificationCodeExpiresAt,
    });

    generateToken(user._id, res);
    const verifyUrl = `${process.env.CLIENT_URL}/verify?email=${user.email}&code=${verificationCode}`;

    await SendEmail(
      user.email,
      "Verify your account - Blog Website",
      "verificationCode",
      {
        siteName: "Blog Website",
        logoUrl: "https://yourcdn.com/logo.png",
        username: user.userName,
        purpose: "account verification",
        verifyUrl,
        verificationCode,
        expiresAt: verificationCodeExpiresAt.toLocaleTimeString(),
        expiresIn: `${expiresInMinutes} minutes`,
        supportEmail: process.env.EMAIL_USER,
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "User created successfully. Please check your email for verification code.",
      user,
    });
  } catch (error) {
    console.error("Error creating User:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Email and code are required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    // Check code and expiry
    if (user.verificationCode !== code) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    if (
      user.verificationCodeExpires &&
      user.verificationCodeExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined; // clear code
    user.verificationCodeExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    console.error("Verification error:", error.message);
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
    const { userName, email, password, profilePic, bio } = req.body;
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
    if (!userName && !email && !password && !profilePic && !bio) {
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

    if (bio) {
      updateData.bio = bio;
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
  verifyUser,
};
