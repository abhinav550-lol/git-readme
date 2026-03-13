import { Request } from "express";
import appError from "../error/appError.js";

function destroySession(req : Request){
	req.session.destroy((e) => {
		if(e){
			return new appError(500 , "Failed to destroy session")
		}
	});	
}

export default destroySession