import express from "express";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();

    res.status(201).json("User created successfully!");
  } catch (error) {
    // Passing the error to the next middleware for centralized error handling
    next(error);

    // Here two other possible ways handling error
    // Second method: we can use a custom error handler function to create a more specific error
    // next(errorHandler(550, "got error from function"));

    // Third method: we can Handle the error response directly within the route
    // res.status(500).json(error.message);
  }
});

export default router;
