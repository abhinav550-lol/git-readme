import { RequestHandler } from "express";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";
import appError from "../error/appError.js";
import getUserContributions from "../github/getContributionStats.js";
import { generateContributionStatsCard } from "../github/generateStatsCard.js";

//Interfaces
import { ContributionsInterface } from "../github/getContributionStats.js";
interface ProfileController {
	generateProfile: RequestHandler;
	getContributionStats: RequestHandler;
	getContributionCard: RequestHandler;
	getLanguageStats: RequestHandler;
	getLanguageCard: RequestHandler;
}

const profileController: ProfileController = {
	/** Generates a user profile README*/
	generateProfile: wrapAsyncErrors(async (req, res, next) => { }),

	/** Generates contribution Stats*/
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
	/** Generates contribution Stats Card
	 * @params request - username, color_scheme as string 
	 * 
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

	getLanguageCard: wrapAsyncErrors(async (req, res, next) => { }),
	getLanguageStats: wrapAsyncErrors(async (req, res, next) => { }),
};

export default profileController;
