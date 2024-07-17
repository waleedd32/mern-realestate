import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import Listing from "../models/listing.model.js";

const router = express.Router();

router.post("/create", verifyToken, async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
});

export default router;
