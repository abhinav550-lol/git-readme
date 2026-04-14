import type { NextFunction , Request , Response } from "express";
import appError from "./appError.js";

function errorMiddleware(err : unknown , req : Request , res : Response , next : NextFunction){
	if(err instanceof appError){
		return res.status(err.status).json({
			success : false,
			message : err.message,
			name : err.name
		})
	}
	return res.status(500).json({
		success : false,
		message : "Something went wrong",
		name : "Unknown Error"
	})
}

export default errorMiddleware	