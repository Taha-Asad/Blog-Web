const express = require("express");
const { registerUser } = require("../controllers/userController");

const authRouter = express.Router();

authRouter.post("/register" , registerUser)
module.exports = authRouter;