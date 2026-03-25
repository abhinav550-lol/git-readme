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
  authorizeGithub: wrapAsyncErrors(async (req: Request, res: Response) => {
		
  }),

  callbackGithub: wrapAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
		
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

/*
Session after login 
{
  login: 'abhinav550-lol',
  id: 194940960,
  avatar_url: 'https://avatars.githubusercontent.com/u/194940960?v=4',
  name: 'Abhinav Mishra',
  email: null
}
and the access token too
*/

export default userController;
