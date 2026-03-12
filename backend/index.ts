import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --------------- Middleware ---------------

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------- Routes ---------------

app.get("/api/test", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "🚀 Backend is up and running!",
  });
});

// --------------- Start Server ---------------

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
