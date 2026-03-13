import { NextFunction, Request, Response } from "express";
import appError from "../error/appError.js";

export default function isLoggedIn(req : Request , res : Response , next : NextFunction){
	if(req.session && req.session.user){
		next();
	}
	else{
		return next(new appError(401 , "Unauthorized"));
	}
} 

