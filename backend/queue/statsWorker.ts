import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import mongoose from "mongoose";

import { connection } from "./queueRedisConnect.js";
import {
	getLanguageStats,
	LanguagesInterface,
} from "../github/getLanguageStats.js";
import getUserContributions from "../github/getContributionStats.js";
import User from "../models/userModel.js";
import appError from "../error/appError.js";
import { redisClient } from "../cache/redisConnect.js";

const connectMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI!);
		console.log("✅ Connected to MongoDB");
	} catch (err) {
		console.error("❌ Error connecting to MongoDB:", err);
		process.exit(1);
	}
};

const connectRedis = async () => {
	try {
		await redisClient.connect();
		console.log("✅ Connected to Redis");
	} catch (err) {
		console.error("❌ Error connecting to Redis:", err);
		process.exit(1);
	}
};

const workerFunctions = {
	getContributionStats: async (username: string, githubId: string) => {
		const contributionsData = await getUserContributions(username);

		const user = await User.findByGithubId(githubId);

		if (!user) {
			console.warn(`User with GitHub ID ${githubId} not found in database.`);
			throw new appError(
				404,
				"User not found in database. Contribution stats update failed.",
			);
		}

		user.userGithubData.contributionsStats = {
			data: contributionsData,
			updatedAt: (new Date()),
		};



		await user.save();

		const key = `contribution_stats:${username}`;

		await redisClient.del(key);
		await redisClient.set(key, JSON.stringify(contributionsData), {
			EX: 60 * 60 * 3, // 3 hours
		});

		console.log(
			`✅ Contribution stats updated for ${username} GitHub ID: ${githubId}`,
		);
	},

	getLanguageStats: async (username: string, githubId: string) => {
		const languageStats: LanguagesInterface = await getLanguageStats(username);

		const user = await User.findByGithubId(githubId);

		if (!user) {
			console.warn(`User with GitHub ID ${githubId} not found in database.`);
			throw new appError(
				404,
				"User not found in database. Language stats update failed.",
			);
		}

		user.userGithubData.languagesStats = {
			data: languageStats,
			updatedAt: (new Date()),
		};

		await user.save();

		const key = `language_stats:${username}`;

		await redisClient.del(key);
		await redisClient.set(key, JSON.stringify(languageStats), {
			EX: 60 * 60 * 3, // 3 hours
		});

		console.log(
			`✅ Language stats updated for ${username} GitHub ID: ${githubId}`,
		);
	},
};

const startWorker = async () => {
	await connectRedis();
	await connectMongoDB();

	const statsWorker = new Worker(
		"statsQueue",
		async (job) => {
			console.log(`Processing job ${job.id}:`, job.data);

			switch (job.name) {
				case "get-contribution-stats":
					await workerFunctions.getContributionStats(
						job.data.username,
						job.data.githubId,
					);
					break;

				case "get-language-stats":
					await workerFunctions.getLanguageStats(
						job.data.username,
						job.data.githubId,
					);
					break;

				default:
					console.warn(`Unknown job type: ${job.name}`);
					throw new Error(`Unknown job type: ${job.name}`);
			}

			return { success: true };
		},
		{
			connection,
			concurrency: 4,
		},
	);

	statsWorker.on("completed", (job) => {
		console.log(`✅ Job ${job.id} completed`);
	});

	statsWorker.on("failed", (job, err) => {
		console.error(`❌ Job ${job?.id} failed:`, err.message);
	});

	console.log("🚀 Stats worker started");
};

startWorker().catch((err) => {
	console.error("❌ Worker failed to start:", err);
	process.exit(1);
});
