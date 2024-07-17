import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import Listing from "../models/listing.model.js";

const router = express.Router();

router.post("/create", verifyToken, async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

export default router;
