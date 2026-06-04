import { RequestHandler } from "express";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";
import appError from "../error/appError.js";
import getUserContributions from "../github/getContributionStats.js";
import { generateContributionStatsCard } from "../github/generateStatsCard.js";
import { getLanguageStats, LanguagesInterface } from "../github/getLanguageStats.js";
import { redisClient } from "../cache/redisConnect.js";
import { generateLanguageCard } from "../github/generateLanguageCard.js";
import { addJobs, doesJobExist } from "../queue/statsQueue.js";
import { sendPrompt } from "../ai/generateResponse.js";
import { systemPrompts, userPrompts } from "../ai/prompts.js";

//Interfaces
import { ContributionsInterface } from "../github/getContributionStats.js";
import User, { IUser } from "../models/userModel.js";
import { createContributionStatsLink, createLanguageStatsLink, generateProfileMarkdown } from "../github/utils/application.js";
import { getGithubIdByUsername } from "../github/utils/user.js";
import { cleanRepoReadme, GithubReadmeSection } from "../github/utils/repo.js";
import App, { incrementUserCount } from "../models/appModel.js";
import { LLMOptions, LLMs } from "../ai/LLMOptions.js";
interface ProfileController {
	//card and data apis
	getContributionStats: RequestHandler;
	getContributionCard: RequestHandler;
	getLanguageStats: RequestHandler;
	getLanguageCard: RequestHandler;
	
	//section creation handlers
	generateIntroduction: RequestHandler;
	generateTechStack : RequestHandler;
	generateStatsSection : RequestHandler;
	generateRepoSection : RequestHandler;
	generateSocialsSection : RequestHandler;
	generateProfile: RequestHandler;
	
	//additional user prompting
	generateResponseForAdditionalPrompt: RequestHandler;
}



const profileController: ProfileController = {
	/**
	 * Generates a profile README payload for the authenticated user.
	 * Based on the previous user choices
	 */
	generateProfile: wrapAsyncErrors(async (req, res, next) => {
		const githubId = req.session?.githubId || (process.env.NODE_ENV === "test" ? "194940960" : null);
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}
		
		const user = await User.findByGithubId(githubId);
		if(!user) {
			return next(new appError(404, "User not found"));
		}

		const { introduction, techstack, stats, repos, socials } = req.body;
		if(!introduction && !techstack && !stats && !repos && !socials) {
			return next(new appError(400, "At least one section must be selected to generate the profile"));
		}

		let profileData = [];
		if(introduction && user.userPortfolioData.introduction.length) profileData.push({section: "introduction", content: user.userPortfolioData.introduction});
		if(techstack && user.userPortfolioData.techStack) profileData.push({section: "techstack", content: user.userPortfolioData.techStack});
		if(stats && user.userPortfolioData.statsSection) profileData.push({section: "stats", content: user.userPortfolioData.statsSection});
		if(repos && user.userPortfolioData.repoSection) profileData.push({section: "repos", content: user.userPortfolioData.repoSection});
		if(socials && user.userPortfolioData.socialSection) profileData.push({section: "socials", content: user.userPortfolioData.socialSection});


		const profileMarkdown : string = `${generateProfileMarkdown(profileData)}`;
		await incrementUserCount(1440);
		
		user.userPortfolioData.lastEdited = new Date();
		await user.save();

		return res.status(200).json({
			success: true,
			message : "Profile generated successfully",
			error : null,
			data : profileMarkdown
		});
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

		const githubId = req.session?.githubId || (process.env.NODE_ENV === "test" ? "194940960" : null);
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}

		if (typeof info !== "string" || info.trim() === "") {
			return next(new appError(400, "Valid information is required in the request body"));
		}

		if(info.length < 20){
			return next(new appError(400, "Information provided is too short, please provide more details (at least 20 characters)"));
		}

		if(typeof temperature !== "number" || temperature < 0 || temperature > 1) {
			return next(new appError(400, "Temperature should be a number between 0 and 1"));
		}

		const avatarUrl = `https://avatars.githubusercontent.com/u/${githubId}`;
		const infoResponse : string = await sendPrompt(systemPrompts["introduction"], userPrompts.generateIntroduction(info , avatarUrl) , {temperature: temperature || 0.5 , maxTokens: 400}); 
		
		const user = await User.findByGithubId(githubId);
		if (!user) {
			return next(new appError(404, "User not found"));
		}

		user.userPortfolioData.introduction = infoResponse;
		user.userPortfolioData.lastEdited = new Date();
		await user.save();
 

		return res.status(200).json({
			success: true,
			message : "Introduction generated successfully",
			introduction: infoResponse,
			error: null
		});
	}),
	/**
 	* Based on user's languages saved in DB
	* and also dropdown to add more languages and generate a tech stack section for the profile README.
	*/
	generateTechStack : wrapAsyncErrors(async (req, res, next) => {
		const {languages} = req.body as {languages?: string[]};

		const githubId = req.session?.githubId || (process.env.NODE_ENV === "test" ? "194940960" : null);
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}
		
		if (!Array.isArray(languages) || languages.some(lang => typeof lang !== "string" || lang.trim() === "")) {
			return next(new appError(400, "Languages should be an array of non-empty strings"));
		}
		
		const techStackResponse : string = await sendPrompt(systemPrompts["tech_stack"], userPrompts.generateTechStack(languages) , {temperature: 0.5 , maxTokens: 2000});

		const user = await User.findByGithubId(githubId);
		if (!user) {
			return next(new appError(404, "User not found"));
		}
		
		user.userPortfolioData.techStack = techStackResponse;
		user.userPortfolioData.lastEdited = new Date();
		await user.save();

		return res.status(200).json({
			success: true,
			message : "Tech stack generated successfully",
			techStack: techStackResponse,
			error: null
		});
	}),
	/**
	* Choose between classic or modern stats section and theme by user's preference
	*/
	generateStatsSection : wrapAsyncErrors(async (req, res, next) => {
		const {type , theme} = req.body as {type?: string , theme?: string};
		
		const githubId = req.session?.githubId || (process.env.NODE_ENV === "test" ? "194940960" : null);	
		if(!githubId) {
			return next(new appError(401, "Unauthorized"));
		}

		console.log(type , theme)

		if(type !== "classic" && type !== "modern") {
			return next(new appError(400, "Type should be either 'classic' or 'modern'"));
		}

		if(!theme || theme !== "dark" && theme !== "light") {
			return next(new appError(400, "Theme should be either 'dark' or 'light'"));
		}

		const user = await User.findByGithubId(githubId);
		if(!user) {
			return next(new appError(404, "User not found"));
		}

		const username : string = user.login;
		
		const contributionStatsLink : string = createContributionStatsLink(type , username, theme);
		const languageStatsLink : string = createLanguageStatsLink(type , username, theme);

		const statsSectionMarkdown = [
		"## 📊 GitHub Stats",
		"",
		'<div align="center" style="margin: 10px;">',
		`  <img src="${contributionStatsLink}" alt="Contribution Stats" />`,
		"</div>",
		"",
		'<div align="center" style="margin: 10px;">',
		`  <img src="${languageStatsLink}" alt="Language Stats" />`,	
		"</div>",
	].join("\n");

		user.userPortfolioData.statsSection = statsSectionMarkdown;
		user.userPortfolioData.lastEdited = new Date();
		await user.save();

		return res.status(200).json({
			success: true,
			message : "Stats section generated successfully",
			statsSection: statsSectionMarkdown,
			error: null
		});
	}),
	/**
	 * Generates a repository section for the GitHub profile README based on the user's repositories.
	 */
	generateRepoSection : wrapAsyncErrors(async (req, res, next) => {
		const {repos} = req.body as {repos?: GithubReadmeSection[]};

		const githubId = req.session?.githubId || (process.env.NODE_ENV === "test" ? "194940960" : null);	
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}

		if(!Array.isArray(repos) || repos.some(repo => typeof repo.repo !== "object" || typeof repo.readmeContent !== "string")) {
			return next(new appError(400, "Repos should be an array of objects with 'repo' and 'readmeContent' properties"));
		}

		const user = await User.findByGithubId(githubId);
		if (!user) {
			return next(new appError(404, "User not found"));
		}

		const repoSection : {name : string , description : string , readmeContent : string , html_url : string}[] = []; 
		for(const repo of repos){
			repoSection.push({
				name: repo.repo.name,
				description: repo.repo.description || "",
				html_url: repo.repo.html_url,
				readmeContent: cleanRepoReadme(repo.readmeContent).slice(0, 1000) 
			});
		}

		const repoSectionMarkdown = await sendPrompt(systemPrompts["repo"], userPrompts.generateRepo(repoSection), {temperature: 0.5, maxTokens: 2000});

		user.userPortfolioData.repoSection = repoSectionMarkdown;
		user.userPortfolioData.lastEdited = new Date();
		await user.save();
		
		return res.status(200).json({
			success: true,
			message : "Repo section generated successfully",
			repoSection: repoSectionMarkdown,
			error: null
		});
	}),
	/**
	 * Generates a social section for the GitHub profile README based on the user's social media links.
	 */
	generateSocialsSection : wrapAsyncErrors(async (req, res, next) => {
		const {socialLinks} = req.body as {socialLinks?: {name : string , url : string}[]};

		const githubId = req.session?.githubId || (process.env.NODE_ENV === "test" ? "194940960" : null);
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}

		if(!Array.isArray(socialLinks) || socialLinks.some(link => typeof link !== "object" || typeof link.name !== "string" || typeof link.url !== "string" || link.name.trim() === "" || link.url.trim() === "")) {
			return next(new appError(400, "Social links should be an array of objects with 'name' and 'url' properties, both should be non-empty strings"));
		}

		const user = await User.findByGithubId(githubId);
		if (!user) {
			return next(new appError(404, "User not found"));
		}

		const socialSectionMarkdown = await sendPrompt(systemPrompts["social"], userPrompts.generateSocials(socialLinks), {temperature: 0.5, maxTokens: 1000});

		user.userPortfolioData.socialSection = socialSectionMarkdown;
		user.userPortfolioData.lastEdited = new Date();
		await user.save();

		return res.status(200).json({
			success: true,
			message : "Social section generated successfully",
			socialSection: socialSectionMarkdown,
			error: null
		});
	}),
	/**
	 * For additional user prompting to generate any custom section or content for the profile README based on user's input and choice of system prompt.
	 */
	generateResponseForAdditionalPrompt : wrapAsyncErrors(async (req, res, next) => {
		const {llmChoice , userPrompt , apiKey } = req.body as {llmChoice? : string , userPrompt?: string , apiKey?: string};
		
		const githubId = req.session?.githubId || (process.env.NODE_ENV === "test" ? "194940960" : null);

		if(!githubId) {
			return next(new appError(401, "Unauthorized"));
		}

		if(typeof userPrompt !== "string" || userPrompt.trim() === "") {
			return next(new appError(400, "Valid user prompt is required"));
		}

		if(typeof apiKey !== "string" || apiKey.trim() === "") {
			return next(new appError(400, "Valid API key is required"));
		}

		if(llmChoice !== "gemini" && llmChoice !== "chatgpt") {
			return next(new appError(400, "LLM choice should be either 'gemini' or 'chatgpt'"));
		}

		const llmFunction = LLMs[llmChoice as keyof LLMOptions];
		const response = await llmFunction(apiKey, userPrompt);

		return res.status(200).json({
			success: true,
			message : "Response generated successfully",
			response: response,
			error: null
		});
	})
};

export default profileController;
