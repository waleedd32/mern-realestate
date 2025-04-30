import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import cors from "cors";

import cookieParser from "cookie-parser";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["https://mernrealestate-woad.vercel.app"],
    // origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "DELETE"],
    credentials: true,
  })
);

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
app.use("/server/listing", listingRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message,
  });
});

/* 
  Vercel automatically sets process.env.VERCEL to "1" in its serverless environment. 
  So, app.listen() is only called locally to start the server. 
  On Vercel, this file is imported as a function and the app is exported instead.
*/
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () =>
    console.log(`Server is running locally on http://localhost:${PORT}`)
  );
}
// app.get("/test", (req, res) => {
//   res.json({ message: "Real Estate API" });
// });

// Exporting the app lets Vercel attach its own listener in the cloud (so export default app; is only for vercel deployment).
export default app;
