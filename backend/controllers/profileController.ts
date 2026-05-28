import { RequestHandler, urlencoded } from "express";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";
import appError from "../error/appError.js";
import getUserContributions from "../github/getContributionStats.js";
import { generateContributionStatsCard } from "../github/generateStatsCard.js";
import { getLanguageStats, LanguagesInterface } from "../github/getLanguageStats.js";

//Interfaces
import { ContributionsInterface } from "../github/getContributionStats.js";
import { generateLanguageCard } from "../github/generateLanguageCard.js";
import { redisClient } from "../cache/redisConnect.js";
import User, { IUser } from "../models/UserModel.js";
import { getGithubIdByUsername } from "../utils/githubUtils.js";
import { addJobs, doesJobExist } from "../queue/statsQueue.js";
import { sendPrompt } from "../ai/generateResponse.js";
import { systemPrompts, userPrompts } from "../ai/prompts.js";
interface ProfileController {
	generateProfile: RequestHandler;
	getContributionStats: RequestHandler;
	getContributionCard: RequestHandler;
	getLanguageStats: RequestHandler;
	getLanguageCard: RequestHandler;
	generateIntroduction: RequestHandler;
	generateTechStack : RequestHandler;
	getUserLanguages : RequestHandler;
}

const profileController: ProfileController = {
	/**
	 * Generates a profile README payload for the authenticated user.
	 * 
	 */
	generateProfile: wrapAsyncErrors(async (req, res, next) => {
		
	}),

	/**
	 * Fetches raw contribution statistics for a GitHub username.
	 * Expects `username` in the query string and returns JSON data.
	 */
	getContributionStats: wrapAsyncErrors(async (req, res, next) => {
		const { username } = req.query as { username?: string };

		if (typeof username !== "string" || username.trim() === "") {
			return next(new appError(400, "Valid username is required"));
		}

		//Redis Check
		const key = `contribution_stats:${username}`;
		const cachedData = await redisClient.get(key);
		if (cachedData) {
			return res.status(200).json({
				success: true,
				data: JSON.parse(cachedData) as ContributionsInterface,
			});
		}


		//MONGODB instant document check and return 
		let contributionsData: ContributionsInterface | null = null;

		const githubId = await getGithubIdByUsername(username);
		if (!githubId) {
			return next(new appError(404, "GitHub user not found"));
		}

		const githubIdExists = await User.githubIdExists(githubId);
		if (githubIdExists) {
			const user = await User.findByGithubId(githubId);
			if (user?.userGithubData?.contributionsStats?.updatedAt) { //exists
				contributionsData = user.userGithubData.contributionsStats.data as ContributionsInterface;

				//Add to Worker Queue (IMPLEMENTING THIS) to update MongoDB with fresh data,(MONGODB Data Update + Redis Cache Invalidation and Update)
				const isOld = (Date.now() - user.userGithubData.contributionsStats.updatedAt.getTime()) > (3000 * 60 * 60);

				if (isOld) {
					let jobExists = await doesJobExist("get-contribution-stats", username);
					if (!jobExists) {
						await addJobs("get-contribution-stats", username, githubId);
					}
				}
			} else {
				contributionsData = await getUserContributions(username);
			}
		} else {
			contributionsData = await getUserContributions(username);
		}

		//Set Redis Cache for 3 hours
		await redisClient.set(key, JSON.stringify(contributionsData), {
			EX: 60 * 3 * 60 //3 hours
		});

		return res.status(200).json({
			success: true,
			data: contributionsData,
		});
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

		//Redis Check
		const key = `language_stats:${username}`;
		const cachedData = await redisClient.get(key);
		if (cachedData) {
			return res.status(200).json({
				success: true,
				data: JSON.parse(cachedData) as LanguagesInterface,
			});
		}

		//MONGODB instant document check and return 
		let languageStats: LanguagesInterface | null = null;

		const githubId = await getGithubIdByUsername(username);
		if (!githubId) {
			return next(new appError(404, "GitHub user not found"));
		}

		const githubIdExists = await User.githubIdExists(githubId);
		if (githubIdExists) {
			const user = await User.findByGithubId(githubId);
			if (user?.userGithubData?.languagesStats?.updatedAt) { //exists
				languageStats = user?.userGithubData?.languagesStats?.data as LanguagesInterface;

				//Add to Worker Queue (IMPLEMENTING THIS) to update MongoDB with fresh data,(MONGODB Data Update + Redis Cache Invalidation and Update)
				const isOld = (Date.now() - user.userGithubData.languagesStats.updatedAt.getTime()) > (3000 * 60 * 60);

				if (isOld) {
					let jobExists = await doesJobExist("get-language-stats", username);
					if (!jobExists) {
						await addJobs("get-language-stats", username, githubId);
					}
				}
			} else {
				languageStats = await getLanguageStats(username);
			}
		} else {
			//both cache failed (user not of app) so user get delayed response but fresh data, also update MongoDB with new data and timestamp
			languageStats = await getLanguageStats(username);
		}

		//Set Redis Cache for 3 hours
		await redisClient.set(key, JSON.stringify(languageStats), {
			EX: 60 * 3 * 60 //3 hours
		});

		return res.status(200).json({
			success: true,
			data: languageStats,
		});
	}),
	/**
	 * Generates an SVG contribution stats card for a GitHub username.
	 * Query params: `username` (required), `color_scheme` (optional).
	 */
	getContributionCard: wrapAsyncErrors(async (req, res, next) => {
		const { username } = req.query as { username?: string };
		const { color_scheme } = req.query as { color_scheme?: string };

		if (!username) {
			return next(
				new appError(400, "Username is required and should be a string"),
			);
		}

		try {
			const githubId = await getGithubIdByUsername(username);
			if (!githubId) {
				return next(new appError(404, "GitHub user not found"));
			}

			const user: IUser | null = await User.findByGithubId(githubId);
			let contributionsData = null;
			if (user && user?.userGithubData?.contributionsStats?.updatedAt) {
				contributionsData = user?.userGithubData?.contributionsStats?.data as ContributionsInterface;

				const jobExists = await doesJobExist("get-contribution-stats", username);
				if (!jobExists) {
					await addJobs("get-contribution-stats", username, githubId);
				}
			} else {
				contributionsData = await getUserContributions(username);
			}

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
			const githubId = await getGithubIdByUsername(username);
			if (!githubId) {
				return next(new appError(404, "GitHub user not found"));
			}

			let languageStats = null;


			const user: IUser | null = await User.findByGithubId(githubId);
			if (user && user?.userGithubData?.languagesStats?.updatedAt) {
				languageStats = user?.userGithubData?.languagesStats?.data as LanguagesInterface;
				const jobExists = await doesJobExist("get-language-stats", username);
				if (!jobExists) {
					await addJobs("get-language-stats", username, githubId);
				}
			} else {
				languageStats = await getLanguageStats(username)
			}

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
	 * Takes general information about user and generates a brief introduction paragraph for the user, which can be used in the profile README.
	 */
	generateIntroduction : wrapAsyncErrors(async (req, res, next) => {
		const {info , temperature} = req.body as {info?: string , temperature?: number};

		const githubId = req.session?.githubId;
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}

		if (typeof info !== "string" || info.trim() === "") {
			return next(new appError(400, "Valid information is required in the request body"));
		}

		if(typeof temperature !== "number" || temperature < 0 || temperature > 1) {
			return next(new appError(400, "Temperature should be a number between 0 and 1"));
		}
		
		const infoResponse : string = await sendPrompt(systemPrompts["introduction"], userPrompts.generateIntroduction(info) , {temperature: temperature || 0.5 , maxTokens: 200}); 
		
		const user = await User.findByGithubId(githubId);
		if (!user) {
			return next(new appError(404, "User not found"));
		}

		user.userPortfolioData.introduction = infoResponse;
		await user.save();

		return res.status(200).json({
			success: true,
			message : "Introduction generated successfully",
			introduction: infoResponse,
			error: null
		});
	}),
	/**
	 * Fetches the user's languages saved in DB, which can be used to show on profile README and also to generate a tech stack section for the profile README.
	 */
	getUserLanguages : wrapAsyncErrors(async (req, res, next) => {
		const githubId = req.session?.githubId;
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}

		const user = await User.findByGithubId(githubId);
		if (!user) {
			return next(new appError(404, "User not found"));
		}

		let languages = [] as string[];
		if(user.userGithubData.languagesStats && user.userGithubData.languagesStats.data?.languages) {
			languages = Object.keys(user.userGithubData.languagesStats.data.languages);
		};

		return res.status(200).json({
			success: true,
			message: "User languages fetched successfully",
			languages: languages || []
		});
	}),
	/**
 	* Based on user's languages saved in DB
	* and also dropdown to add more languages and generate a tech stack section for the profile README.
	*/
	generateTechStack : wrapAsyncErrors(async (req, res, next) => {
		const {languages} = req.body as {languages?: string[]};

		const githubId = req.session?.githubId;
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}
		
		if (!Array.isArray(languages) || languages.some(lang => typeof lang !== "string" || lang.trim() === "")) {
			return next(new appError(400, "Languages should be an array of non-empty strings"));
		}
		
		const techStackResponse : string = await sendPrompt(systemPrompts["tech_stack"], userPrompts.generateTechStack(languages) , {temperature: 0.5 , maxTokens: 300});

		const user = await User.findByGithubId(githubId);
		if (!user) {
			return next(new appError(404, "User not found"));
		}
		
		user.userPortfolioData.techStack = techStackResponse;
		await user.save();

		return res.status(200).json({
			success: true,
			message : "Tech stack generated successfully",
			techStack: techStackResponse,
			error: null
		});
	})

};

export default profileController;
