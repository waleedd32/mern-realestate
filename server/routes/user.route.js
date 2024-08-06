import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import Listing from "../models/listing.model.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Hello World" });
});

router.post("/update/:id", verifyToken, async (req, res, next) => {
  // User ID check
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only update your own account!"));
  }

  try {
    // Password hashing
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // User update operation
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    // Excluding password from the response
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
});

router.delete("/delete/:id", verifyToken, async (req, res, next) => {
  // User ID check
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only delete your own account!"));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token_voiollamikatahansa");
    res.status(200).json("User has been deleted!");
  } catch (error) {
    next(error);
  }
});

router.get("/listings/:id", verifyToken, async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own listings!"));
  }
});

export default router;
