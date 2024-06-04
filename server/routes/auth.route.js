import express from "express";

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  console.log(req.body);
});

export default router;
