import express from "express";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

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

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Request Body:", req.body);

  try {
    const validUser = await User.findOne({ email: email });
    if (!validUser) return next(errorHandler(404, "User not found!"));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials!"));

    console.log("JWT Secret:", process.env.JWT_SECERET);

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECERET);
    const { password: pass, ...rest } = validUser._doc;

    res
      .cookie("access_token_voiollamikatahansa", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/", // Ensuring cookie to be available on all pages

        maxAge: 365 * 24 * 60 * 60 * 1000, // 12 months, Without it the cookie is a “session cookie” and disappears when the user closes the browser.
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
    // res.status(500).json(error.message);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECERET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token_voiollamikatahansa", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          path: "/", // Ensure cookie is available on all pages
          maxAge: 365 * 24 * 60 * 60 * 1000, // 12 months
        })
        .status(200)
        .json({ ...rest, newUser: false });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECERET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie("access_token_voiollamikatahansa", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          path: "/", // Ensure cookie is available on all pages
          maxAge: 365 * 24 * 60 * 60 * 1000, // 12 months
        })
        .status(200)
        .json({ ...rest, newUser: true });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/signout", async (req, res, next) => {
  try {
    res.clearCookie("access_token_voiollamikatahansa");
    res.status(200).json("User has been logged out!");
  } catch (error) {
    next(error);
  }
});

export default router;
