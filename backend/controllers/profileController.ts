import { RequestHandler } from "express";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";
import appError from "../error/appError.js";

interface ProfileController {
  generateProfile: RequestHandler; 
  generateStatsCard : RequestHandler;
  generateLanguagesCard : RequestHandler;
}


const profileController : ProfileController  = {
	generateProfile : wrapAsyncErrors(async (req , res , next) => {

	}),
	generateStatsCard : wrapAsyncErrors(async (req , res , next) => {
		const username = req.query.username?.toString() || req.session.user?.login;

		if (!username) {
			return next(new appError(400, "Username is required"));
		}

		const now = new Date();
		const to = now.toISOString().slice(0, 10);
		const fromDate = new Date(now);
		fromDate.setFullYear(now.getFullYear() - 1);
		const from = fromDate.toISOString().slice(0, 10);

		const contributionsResponse = await fetch(
			`https://github.com/users/${encodeURIComponent(username)}/contributions?from=${from}&to=${to}`,
			{
				headers: {
					Accept: "text/html",
					"User-Agent": "git-readme-app",
				},
			},
		);	

		console.log(contributionsResponse)

		if (!contributionsResponse.ok) {
			return next(new appError(400, "Failed to fetch public GitHub contributions"));
		}

		const contributionsMarkup = await contributionsResponse.text();
		const rectTagMatches = contributionsMarkup.match(/<rect[^>]*>/g) || [];

		const contributionDays: Array<{ date: string; contributionCount: number }> = [];

		for (const tag of rectTagMatches) {
			const dateMatch = tag.match(/data-date="([^"]+)"/);
			const countMatch = tag.match(/data-count="(\d+)"/);

			if (dateMatch && countMatch) {
				contributionDays.push({
					date: dateMatch[1],
					contributionCount: Number.parseInt(countMatch[1], 10),
				});
			}
		}

		if (contributionDays.length === 0) {
			return next(new appError(404, "No public contribution data found for this user"));
		}

		contributionDays.sort((a, b) => a.date.localeCompare(b.date));

		const totalContributions = contributionDays.reduce(
			(total: number, day: { contributionCount: number }) => total + (day.contributionCount || 0),
			0,
		);

		let currentStreak = 0;
		for (let i = contributionDays.length - 1; i >= 0; i -= 1) {
			if (contributionDays[i].contributionCount > 0) {
				currentStreak += 1;
			} else {
				break;
			}
		}

		let longestStreak = 0;
		let runningStreak = 0;
		let maxContributionsInADay = 0;

		for (const day of contributionDays) {
			if (day.contributionCount > 0) {
				runningStreak += 1;
				if (runningStreak > longestStreak) {
					longestStreak = runningStreak;
				}
			} else {
				runningStreak = 0;
			}

			if (day.contributionCount > maxContributionsInADay) {
				maxContributionsInADay = day.contributionCount;
			}
		}

		const statsCard = {
			username,
			totalContributions,
			currentStreak,
			longestStreak,
			maxContributionsInADay,
			totalDaysTracked: contributionDays.length,
		};

		
	
		return res.status(200).json({
			success: true,
			message: "Stats card generated successfully",
			statsCard,
		});
	}),
	generateLanguagesCard : wrapAsyncErrors(async (req , res , next) => {
	
	})
};






export default profileController;