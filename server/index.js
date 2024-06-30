import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";

import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Welcome to the Real Estate API");
});

app.use("/server/user", userRouter);

app.use("/server/auth", authRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message,
  });
});

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));

// app.get("/test", (req, res) => {
//   res.json({ message: "Real Estate API" });
// });
