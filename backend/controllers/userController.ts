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

interface UserController {
  authorizeGithub: RequestHandler; //perms params as elevated scopes , elevated_perms == true in query
  callbackGithub: RequestHandler; 
  logoutGithub: RequestHandler //destroys session and clears cookie
  getUser: RequestHandler; //get user, if required in the frontend
}

const userController: UserController = {
  authorizeGithub: wrapAsyncErrors(async (req: Request, res: Response , next : NextFunction) => {
	const baseAuthUrl = "https://github.com/login/oauth/authorize";


	const state = crypto.randomBytes(16).toString("hex");

	const {elevated_perms} = req.query;
	const perms = elevated_perms === "true" ? "read:user user:email repo" : "read:user user:email";

	const params = new URLSearchParams({
	  client_id: process.env.GITHUB_CLIENT_ID!,
	  redirect_uri: `${process.env.GITHUB_REDIRECT_URI!}`,
	  scope: perms,
	  state : state
	});
	
	req.session.oauthState = state;

	const authUrl = `${baseAuthUrl}?${params.toString()}`;																																			
	res.redirect(authUrl);
  }),
  callbackGithub: wrapAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
		const { code , state} = req.query;

		if(!state || state !== req.session.oauthState){
			return new appError(400, "Invalid State Parameter");
		}

		if(!code){
			return new appError(400, "Authorization code not found");
		}

		const tokenResponse = await fetch("https://github.com/login/oauth/access_token" , {
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

		req.session.tokenData = tokenData;
		req.session.githubAccessToken = tokenData.access_token;

		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`,
				Accept: "application/vnd.github+json",
			},
		});

		if (!githubUserResponse.ok) {
			return next(new appError(400, "Failed to fetch GitHub user profile"));
		}

		const githubUser = await githubUserResponse.json();
		let email: string | null = githubUser.email ?? null;

		if (!email) {
			const emailsResponse = await fetch("https://api.github.com/user/emails", {
				headers: {
					Authorization: `Bearer ${tokenData.access_token}`,
					Accept: "application/vnd.github+json",
				},
			});

			if (emailsResponse.ok) {
				const emails = await emailsResponse.json();
				if (Array.isArray(emails)) {
					const primaryVerifiedEmail = emails.find(
						(item: { email?: string; primary?: boolean; verified?: boolean }) =>
							item.primary && item.verified,
					);
					email = primaryVerifiedEmail?.email ?? null;
				}
			}
		}

		req.session.user = {
			login: githubUser.login,
			id: githubUser.id,
			avatar_url: githubUser.avatar_url,
			name: githubUser.name,
			email,
		};

		delete req.session.oauthState;
		
		return res.redirect(process.env.FRONTEND_URL!);
	},
  ),

  logoutGithub: wrapAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
      req.session.destroy((err) => {
        if (err) return next(new appError(500, "Logout failed"));
        res.clearCookie("connect.sid");
        res.redirect(process.env.FRONTEND_URL!);
      });
    },
  ),
  getUser: wrapAsyncErrors(async (req: Request, res: Response) => {
    if (!req.session.user) {
      return res.status(200).json({
        success: true,
        message: "No user yet.",
        user: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      user: req.session.user,
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

