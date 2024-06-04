import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json());


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

app.use("/server/auth", authRouter);

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
