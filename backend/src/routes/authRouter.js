const express = require("express");
const {
  registerUser,
  loginUser,
  logOutUser,
  updateUser,
  checkAuth,
  verifyUser,
} = require("../controllers/userController");
const { protectRoute } = require("../middlewares/authMiddleware");

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/verify", verifyUser);

authRouter.post("/login", loginUser);
authRouter.post("/logout", logOutUser);
authRouter.put("/update-profile", protectRoute, updateUser);
authRouter.get("/check", protectRoute, checkAuth);
module.exports = authRouter;
