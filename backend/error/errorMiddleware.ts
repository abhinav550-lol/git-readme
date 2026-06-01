import type { NextFunction , Request , Response } from "express";
import appError from "./appError.js";
import { ZodError } from "zod";

const formatZodErrors = (error: ZodError) => {
  return error.issues.map((issue) => {
	const path = issue.path.join(".");

	return {
	  field: path.replace(/^body\./, "").replace(/^query\./, "").replace(/^params\./, ""),
	  location: issue.path[0] || "unknown",
	  message: issue.message,
	};
  });
};

function capitalize(str: string) {
	if (str.length === 0) return str;
	return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function errorMiddleware(
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (err instanceof appError) {
		return res.status(err.status).json({
			success: false,
			message: err.message,
			name: err.name
		});
	}	

	if(err instanceof ZodError){
		const formattedErrors = formatZodErrors(err);

		return res.status(400).json({
			success: false,
			message: formattedErrors.map(e => `${capitalize(e.message)}`).join(" \n"),
			name: "ZodValidationError",
			errors: formattedErrors
		});
	}

	console.log("Unexpected error: ", err);

	return res.status(500).json({
		success: false,
		message: "Something went wrong",
		name: "Unknown Error"
	});
}

export default errorMiddleware	