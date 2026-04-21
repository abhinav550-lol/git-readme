import { RequestHandler } from "express";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";
import appError from "../error/appError.js";
import getUserContributions from "../github/getContributionStats.js";
import { generateContributionStatsCard } from "../github/generateStatsCard.js";
import { getLanguageStats } from "../github/getLanguageStats.js";

//Interfaces
import { ContributionsInterface } from "../github/getContributionStats.js";
import { generateLanguageCard } from "../github/generateLanguageCard.js";
interface ProfileController {
	generateProfile: RequestHandler;
	getContributionStats: RequestHandler;
	getContributionCard: RequestHandler;
	getLanguageStats: RequestHandler;
	getLanguageCard: RequestHandler;
}

const profileController: ProfileController = {
	/**
	 * Generates a profile README payload for the authenticated user.
	 */
	generateProfile: wrapAsyncErrors(async (req, res, next) => { }),

	/**
	 * Fetches raw contribution statistics for a GitHub username.
	 * Expects `username` in the query string and returns JSON data.
	 */
	getContributionStats: wrapAsyncErrors(async (req, res, next) => {
		const { username } = req.query as { username?: string };

		if (typeof username !== "string" || username.trim() === "") {
			return next(new appError(400, "Valid username is required"));
		}

		const contributionsData: ContributionsInterface = await getUserContributions(username);

		return res.status(200).json({
			success: true,
			data: contributionsData,
		});
	}),
	/**
	 * Generates an SVG contribution stats card for a GitHub username.
	 * Query params: `username` (required), `color_scheme` (optional).
	 */
	getContributionCard: wrapAsyncErrors(async (req, res, next) => {
		const { username } = req.query as { username?: string };
		const {color_scheme} = req.query as { color_scheme?: string };

		if (!username) {
			return next(
				new appError(400, "Username is required and should be a string"),
			);
		}

		try {
			const contributionsData: ContributionsInterface =
				await getUserContributions(username);

			const svg = generateContributionStatsCard(contributionsData, color_scheme);

			return res
				.type("image/svg+xml")
				.set("Cache-Control", "public, max-age=3600")
				.send(svg);
		} catch (err) {
			if (err instanceof appError) {
				return next(err);
			}
			return next(new appError(500, "Internal Server Error"));
		}
	}),

	/**
	 * Generates an SVG language stats card for a GitHub username.
	 * Query params: `username` (required), `color_scheme` (optional).
	 */
	getLanguageCard: wrapAsyncErrors(async (req, res, next) => {
		const { username } = req.query as { username?: string };
		const { color_scheme } = req.query as { color_scheme?: string };

		if (typeof username !== "string" || username.trim() === "") {
			return next(new appError(400, "Valid username is required"));
		}

		try {
			const languageStats = await getLanguageStats(username);

			//Generate SVG card for language stats
			const svg = generateLanguageCard(languageStats, color_scheme);

			return res
			.type("image/svg+xml")
			.set("Cache-Control", "public, max-age=3600")
			.send(svg);
		} catch (err) {
			if (err instanceof appError) {
				return next(err);
			}
			return next(new appError(500, "Internal Server Error"));
		}
	}),

	/**
	 * Fetches language usage statistics for a GitHub username.
	 * Expects `username` in the query string and returns JSON data.
	 */
	getLanguageStats: wrapAsyncErrors(async (req, res, next) => {
		const { username } = req.query as { username?: string };

		if (typeof username !== "string" || username.trim() === "") {
			return next(new appError(400, "Valid username is required"));
		}

		const languageStats = await getLanguageStats(username);

		return res.status(200).json({
			success: true,
			data: languageStats,
		});
	}),
};

export default profileController;
