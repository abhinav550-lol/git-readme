import { NextFunction, Response , Request , RequestHandler } from "express";
import App from "../models/appModel.js";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";

interface appControllerInterface{
	getUserCount : RequestHandler;
}

const appController : appControllerInterface = {
	getUserCount : wrapAsyncErrors(async (req : Request,  res : Response  , next : NextFunction) => {
		const foundApp = await App.findOne({appId : 1440});

		if(!foundApp){
			return res.status(200).json({
				success : true,
				message : "App Not Found, returning default count of 0",
				data : 0,
				error : null	
			});
		}

		return res.status(200).json({ 
			success : true,
			message : "User count fetched successfully",
			data : foundApp.userCount,
			error : null	
		});
	})
};


export {appController};