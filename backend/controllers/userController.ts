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
  authorizeGithub: RequestHandler;
  callbackGithub: RequestHandler;
  logoutGithub: RequestHandler;
  getUser: RequestHandler;
}

const userController: UserController = {
  authorizeGithub: wrapAsyncErrors(
    async (req: Request, res: Response) => {
      const state = crypto.randomUUID();
      req.session.oauthState = state;

      const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_uri: process.env.GITHUB_REDIRECT_URI!,
        state,
      });

      res.redirect(
        `https://github.com/login/oauth/authorize?${params.toString()}`
      );
    }
  ),

  callbackGithub: wrapAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
      const code = req.query.code as string;
      const state = req.query.state as string;

      if (!code) return next(new appError(400, "Invalid code"));
      if (!state || state !== req.session.oauthState) {
        return next(new appError(400, "Invalid OAuth state"));
      }

      delete req.session.oauthState;

      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.access_token) {
        return next(new appError(400, "GitHub authentication failed"));
      }

      const accessToken = data.access_token;

      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (!userRes.ok) {
        return next(new appError(400, "Failed to fetch GitHub user"));
      }

      const { login, id, avatar_url, name, email } = await userRes.json();

      req.session.user = {
        login,
        id,
        avatar_url,
        name,
        email,
      };

      req.session.githubAccessToken = accessToken;

      res.redirect(process.env.FRONTEND_URL!);
    }
  ),

  logoutGithub: wrapAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
	console.log(req.session.user)
	
      req.session.destroy((err) => {
        if (err) return next(new appError(500, "Logout failed"));
        res.clearCookie("connect.sid");
		res.redirect(process.env.FRONTEND_URL!);
	  });


    }
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