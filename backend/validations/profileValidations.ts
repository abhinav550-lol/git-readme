import { z } from "zod";
import { RequestValidationSchema } from "../error/validateMiddleware.js";

interface ProfileValidations {
	introductionSchema: RequestValidationSchema;
	techstackSchema: RequestValidationSchema;
	statsSchema: RequestValidationSchema;
	reposSchema: RequestValidationSchema;
	socialsSchema: RequestValidationSchema;
}

const repoItemSchema = z.object({
	repo: z.object({
		name: z.string().min(1, "Repository name is required"),
		description: z
			.string()
			.nullable()
			.refine((value) => value === null || value.trim().length > 0, {
				message: "Repository description cannot be empty when provided",
			}),
		html_url: z.url("Repository URL must be a valid URL"),
	}),
	readmeContent: z.string().min(1, "Repository README content is required"),
});

export const profileValidations: ProfileValidations = {
	introductionSchema: z.object({
		body: z.object({
			info: z
				.string()
				.min(20, "Information must be at least 20 characters long"),
			temperature: z
				.number()
				.min(0, "Temperature must be at least 0")
				.max(1, "Temperature must be at most 1"),
		}),
	}),
	techstackSchema: z.object({
		body: z.object({
			languages: z
				.array(z.string())
				.min(1, "At least one programming language must be provided"),
		}),
	}),
	statsSchema: z.object({
		body: z.object({
			type: z.enum(
				["classic", "modern"],
				"Type must be either 'classic' or 'modern'",
			),
			theme: z.enum(
				["dark", "light"],
				"Theme must be either 'dark' or 'light'",
			),
		}),
	}),
	reposSchema: z.object({
		body: z.object({
			repos: z
				.array(repoItemSchema)
				.min(1, "At least one repository must be provided"),
		}),
	}),
	socialsSchema: z.object({
		body: z.object({
			socialLinks: z
				.array(
					z.object({
						name: z.string().min(1, "Social platform name cannot be empty"),
						url: z.url("Social link must be a valid URL"),
					}),
				)
				.min(1, "At least one social link must be provided"),
		}),
	}),

};
