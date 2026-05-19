import { RequestHandler, urlencoded } from "express";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";
import appError from "../error/appError.js";
import getUserContributions from "../github/getContributionStats.js";
import { generateContributionStatsCard } from "../github/generateStatsCard.js";
import { getLanguageStats, LanguagesInterface } from "../github/getLanguageStats.js";

//Interfaces
import { ContributionsInterface } from "../github/getContributionStats.js";
import { generateLanguageCard } from "../github/generateLanguageCard.js";
import {redisClient} from "../cache/redisConnect.js";
import User, { IUser } from "../models/UserModel.js";
import { getGithubIdByUsername } from "../utils/githubUtils.js";
import { addJobs, doesJobExist } from "../queue/statsQueue.js";
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

		//Redis Check
		const key = `contribution_stats:${username}`;
		const cachedData = await redisClient.get(key);
		if(cachedData){
			return res.status(200).json({
				success: true,
				data: JSON.parse(cachedData) as ContributionsInterface,
			});
		}
		

		//MONGODB instant document check and return 
		let contributionsData: ContributionsInterface | null = null;

		const githubId = await getGithubIdByUsername(username);
		if(!githubId){
			return next(new appError(404, "GitHub user not found"));
		}

		const githubIdExists = await  User.githubIdExists(githubId);
		if(githubIdExists){
			const user = await User.findByGithubId(githubId);
			if(user?.userGithubData?.contributionsStats?.updatedAt){ //exists
				contributionsData = user.userGithubData.contributionsStats.data as ContributionsInterface;

				//Add to Worker Queue (IMPLEMENTING THIS) to update MongoDB with fresh data,(MONGODB Data Update + Redis Cache Invalidation and Update)
				let jobExists = await doesJobExist("get-contribution-stats", username);
				if(!jobExists){
					await addJobs("get-contribution-stats", username, githubId);
				}
			}else{
				contributionsData = await getUserContributions(username);	
			}
		}else{
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
		if(cachedData){
			return res.status(200).json({
				success: true,
				data: JSON.parse(cachedData) as LanguagesInterface,
			});
		}

		//MONGODB instant document check and return 
		let languageStats: LanguagesInterface | null = null;

		const githubId = await getGithubIdByUsername(username);
		if(!githubId){
			return next(new appError(404, "GitHub user not found"));
		}

		const githubIdExists = await  User.githubIdExists(githubId);
		if(githubIdExists){
			const user = await User.findByGithubId(githubId);
			if(user?.userGithubData?.languagesStats?.updatedAt){ //exists
				languageStats = user?.userGithubData?.languagesStats?.data as LanguagesInterface;
			
				//Add to Worker Queue (IMPLEMENTING THIS) to update MongoDB with fresh data,(MONGODB Data Update + Redis Cache Invalidation and Update)
				let jobExists = await doesJobExist("get-language-stats", username);
				if(!jobExists){
					await addJobs("get-language-stats", username, githubId);
				}
			}else{
				languageStats = await getLanguageStats(username);
			}
		}else{
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
		const {color_scheme} = req.query as { color_scheme?: string };

		if (!username) {
			return next(
				new appError(400, "Username is required and should be a string"),
			);
		}

		try {
			const githubId = await getGithubIdByUsername(username);
			if(!githubId){
				return next(new appError(404, "GitHub user not found"));
			}

			const user : IUser | null = await User.findByGithubId(githubId);
			let contributionsData = null;
			if(user && user?.userGithubData?.contributionsStats?.updatedAt){
				contributionsData = user?.userGithubData?.contributionsStats?.data as ContributionsInterface;

				const jobExists = await doesJobExist("get-contribution-stats", username);
				if(!jobExists){
					await addJobs("get-contribution-stats", username, githubId);
				}
			}else{
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
			if(!githubId){
				return next(new appError(404, "GitHub user not found"));
			}

			let languageStats = null;


			const user : IUser | null = await User.findByGithubId(githubId);
			if(user && user?.userGithubData?.languagesStats?.updatedAt){
				languageStats = user?.userGithubData?.languagesStats?.data as LanguagesInterface;
				const jobExists = await doesJobExist("get-language-stats", username);
				if(!jobExists){
					await addJobs("get-language-stats", username, githubId);
				}
			}else{
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

};

export default profileController;
