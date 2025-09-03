const mongoose = require("mongoose");
const userSchema =  new mongoose.Schema(
  {
    profilePic: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [6, "password must be at least of 6 chracters"],
      //   match: [
      //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      //     "Password must be minimum 6 characters, include at least one uppercase letter, one lowercase letter, one number and one special character",
      //   ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User" , userSchema);