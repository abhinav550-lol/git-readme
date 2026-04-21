import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { connectRedis } from "./cache/redisConnect.js";


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

import "express-session";

declare module "express-session" {
	interface SessionData {
		oauthState?: string;
		githubId? : string
	}
}

const isProduction = process.env.NODE_ENV === "production";

app.use(
	session({
		secret: process.env.SESSION_SECRET || "default-secret-change-me",
		resave: false,
		saveUninitialized: false,
		//sameSite : "lax",
		cookie: {
			httpOnly: true,
			secure: isProduction,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		},
	})
);

// --------------- Routes ---------------

import userRoutes from './routes/userRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import errorMiddleware from "./error/errorMiddleware.js";

app.get('/health', (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Health check passed!"
	})
})


app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);


app.use(errorMiddleware);
// --------------- Start Server ---------------
async function run() {
	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		throw new Error("MONGODB_URI is not set");
	}

	await mongoose.connect(mongoUri);
	console.log("Connected to MongoDB successfully");
	await connectRedis();

	app.listen(PORT, () => {
		console.log(`✅ Server running on http://localhost:${PORT}`);
	});
}

run().catch((err) => {
	console.error("Error starting server:", err);
	process.exit(1);
});
