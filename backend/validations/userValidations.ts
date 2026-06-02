import { z } from "zod";
import { RequestValidationSchema } from "../error/validateMiddleware.js";


interface UserValidations {
	pushReadmeSchema: RequestValidationSchema;
}

export const userValidations: UserValidations = {
	pushReadmeSchema: z.object({
		body: z.object({
			readmeContent: z.string().min(1, "README content is required"),
		}),
	}),
};