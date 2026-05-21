/*
Register GitHub App
Implement login with user access token
Save user session in your own DB
Implement app installation flow
Generate installation token
Read repo info
Generate README with AI
Update README.md
Add webhook automation later
*/

import crypto from "crypto";
import { NextFunction, Request, RequestHandler, Response } from "express";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";
import appError from "../error/appError.js";
import User from "../models/UserModel.js";
import { getGithubEmailByToken, getGithubUserByToken } from "../utils/githubUtils.js";
import { addJobs, doesJobExist } from "../queue/statsQueue.js";
import { decrypt } from "../utils/tokenCrypt.js";
import { getAllUserRepositories, getRepoReadme } from "../github/githubUtils.js";

interface UserController {
	authorizeGithub: RequestHandler; //perms params as elevated scopes , elevated_perms == true in query
	callbackGithub: RequestHandler;
	logoutGithub: RequestHandler //destroys session and clears cookie
	getUserRepos: RequestHandler;
	getRepoReadme: RequestHandler;
}

const userController: UserController = {
	/**
	 * Initiates GitHub OAuth flow by redirecting to GitHub's authorization URL.
	 * Accepts an optional query parameter `elevated_perms` to request additional scopes.
	 */
	authorizeGithub: wrapAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
		const baseAuthUrl = "https://github.com/login/oauth/authorize";


		const state = crypto.randomBytes(16).toString("hex");

		const { elevated_perms } = req.query;
		const perms = elevated_perms === "true" ? "read:user user:email repo" : "read:user user:email";

		const params = new URLSearchParams({
			client_id: process.env.GITHUB_CLIENT_ID!,
			redirect_uri: `${process.env.GITHUB_REDIRECT_URI!}`,
			scope: perms,
			state: state
		});

		req.session.oauthState = state;

		const authUrl = `${baseAuthUrl}?${params.toString()}`;
		res.redirect(authUrl);
	}),
	/**
 * Github OAuth callback handler that processes the authorization code, exchanges it for an access token, and retrieves user information.
 * Expects `code` and `state` as query parameters from GitHub's redirect.
 * Validates the `state` parameter to prevent CSRF attacks.
 */
	callbackGithub: wrapAsyncErrors(
		async (req: Request, res: Response, next: NextFunction) => {
			const { code, state } = req.query;

			if (!state || state !== req.session.oauthState) {
				return new appError(400, "Invalid State Parameter");
			}

			if (!code) {
				return new appError(400, "Authorization code not found");
			}

			const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json"
				},
				body: JSON.stringify({
					client_id: process.env.GITHUB_CLIENT_ID,
					client_secret: process.env.GITHUB_CLIENT_SECRET,
					code,
					redirect_uri: `${process.env.GITHUB_REDIRECT_URI!}`,
					state
				})
			})


			const tokenData = await tokenResponse.json();


			if (!tokenData?.access_token) {
				return next(new appError(400, "Failed to get access token from GitHub"));
			}

			if (!tokenData?.scope) {
				return next(new appError(400, "Failed to get scopes from GitHub"));
			}

			const githubUser = await getGithubUserByToken(tokenData.access_token);

			if (!githubUser) {
				return next(new appError(400, "Failed to fetch user data from GitHub"));
			}

			const email: string = githubUser?.email ? githubUser.email : (await getGithubEmailByToken(tokenData.access_token));

			const foundUser = await User.findByGithubId(githubUser.id);
			if (!foundUser) {
				await User.create({
					githubId: githubUser.id,
					accessToken: tokenData.access_token,
					email: email,
					perms: tokenData.scope.includes("repo") ? "elevated" : "normal"
				});
			} else {
				if (foundUser.perms === "normal" && tokenData.scope.includes("repo")) {
					foundUser.perms = "elevated";
				}

				if (foundUser.perms === "elevated" && !tokenData.scope.includes("repo")) {
					foundUser.perms = "normal";
				}

				foundUser.accessToken = tokenData.access_token;
				await foundUser.save();
			}

			//Worker For Generating application-specific data JSON
			const languageStatsJobExists = await doesJobExist("get-language-stats", githubUser.login);
			const contributionStatsJobExists = await doesJobExist("get-contribution-stats", githubUser.login);

			if (!languageStatsJobExists) {
				await addJobs("get-language-stats", githubUser.login, githubUser.id);
			}

			if (!contributionStatsJobExists) {
				await addJobs("get-contribution-stats", githubUser.login, githubUser.id);
			}

			return res.redirect(process.env.FRONTEND_URL!);
		},
	),
	/**
 * Logs out the user by destroying the session and clearing the authentication cookie.
 * Redirects to the frontend URL after logout.
 * Accepts an optional query parameter `elevated_perms` to request additional scopes.
 */
	logoutGithub: wrapAsyncErrors(
		async (req: Request, res: Response, next: NextFunction) => {
			req.session.destroy((err) => {
				if (err) return next(new appError(500, "Logout failed"));
				res.clearCookie("connect.sid");
				res.redirect(process.env.FRONTEND_URL!);
			});
		},
	),
	/**
	 * Gets the authenticated user's GitHub repositories using the stored access token.
	 */
	getUserRepos: wrapAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
		const githubId = req.session.githubId;
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}

		const foundUser = await User.findByGithubId(githubId);
		if (!foundUser) {
			return next(new appError(404, "User not found by the GithubID in session"));
		}

		if (foundUser.perms !== "elevated") {
			return next(new appError(403, "Please authorize with elevated permissions to access repositories data"));
		}

		const decryptedToken = decrypt(foundUser.accessToken);

		const repos = await getAllUserRepositories(decryptedToken);

		return res.status(200).json({
			success: true,
			message: "Fetched user repositories successfully",
			error: null,
			repositories: repos
		});
	}),
	/**
	 * Requires repoName as a URL parameter and returns the README content of that repository for the authenticated user.
	 * Gets the README content for a specific repository.
	 */
	getRepoReadme: wrapAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
		const githubId = req.session.githubId;
		if (!githubId) {
			return next(new appError(401, "Unauthorized"));
		}

		const foundUser = await User.findByGithubId(githubId);
		if (!foundUser) {
			return next(new appError(404, "User not found by the GithubID in session"));
		}

		if (foundUser.perms !== "elevated") {
			return next(new appError(403, "Please authorize with elevated permissions to access repositories data"));
		}

		const decryptedToken = decrypt(foundUser.accessToken);

		const repoName = req.params.repoName;
		if (typeof repoName !== "string" || repoName.trim() === "") {
			return next(new appError(400, "Invalid repository name"));
		}

		const readmeContent = await getRepoReadme(foundUser.login, repoName, decryptedToken);

		return res.status(200).json({
			success: true,
			message: "Fetched repository README successfully",
			error: null,
			readme: readmeContent
		});
	}),
};

export default userController;

/*


{
  login: 'abhinav550-lol',
  id: 194940960,
  avatar_url: 'https://avatars.githubusercontent.com/u/194940960?v=4',
  name: 'Abhinav Mishra',
  email: 'maabhinav550@gmail.com'
}
{
  access_token: 'gho_XXXXXXXXXX',
  token_type: 'bearer',
  scope: 'read:user,repo,user:email'
}


*/

