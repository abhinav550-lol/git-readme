import { RequestHandler } from "express";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";
import appError from "../error/appError.js";
import getUserContributions from "../github/getContributionStats.js";

interface ProfileController {
  getContributionStats : RequestHandler;
  generateProfile: RequestHandler; 
  generateStatsCard : RequestHandler;
  generateLanguagesCard : RequestHandler;
  getStatsCard : RequestHandler;
}


const profileController : ProfileController  = {
	getContributionStats : wrapAsyncErrors(async (req , res , next) => {
		const {username}  = req.query as { username?: string };
		
		if(!username) {
			return next(new appError(400 , "Username is required and should be a string"));
		}	

		try{
			const contributionsData = await getUserContributions(username);
			
			return res.status(200).json({
			success : true,
			data : contributionsData,
		});
		}catch(err){
			if(err instanceof appError){
				return next(err);
			}
			return next(new appError(500 ,   "Internal Server Error"));
		}
	}),
	getStatsCard : wrapAsyncErrors(async (req , res , next) => {

	}),
	generateProfile : wrapAsyncErrors(async (req , res , next) => {

	}),
	generateStatsCard : wrapAsyncErrors(async (req , res , next) => {

	}),
	generateLanguagesCard : wrapAsyncErrors(async (req , res , next) => {
	
	}),
};






export default profileController;