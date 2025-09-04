const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db");
dotenv.config();
const app = express();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV || "development";

//console.log(PORT)


// Middlewares
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"], // <-- Update this if deploying
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Routes
const authRouter = require("./routes/authRouter");
// Public Routes
app.use("/api/v1/user" , authRouter);

connectDB();
app.listen(PORT , ()=>{
    console.log(`Server running successfully on Port: ${PORT}`);
});