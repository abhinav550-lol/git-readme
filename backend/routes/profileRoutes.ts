import { Router } from "express";
import profileController from "../controllers/profileController.js";
import isLoggedIn from "../utils/isLoggedIn.js";
import createRateLimit from "../utils/rateLimit.js";
import { validate } from "../error/validateMiddleware.js";
import { profileValidations } from "../validations/profileValidations.js";

const router = Router();
const sectionGenerationRateLimit = createRateLimit({
	limit: 500,
	windowMs: 60_000,
	keyPrefix: "profile-section-generation",
});

//Stats and Cards
router.get("/data/contribution-stats", profileController.getContributionStats);
router.get("/card/contribution-stats", profileController.getContributionCard);

router.get("/data/language-stats" , profileController.getLanguageStats);
router.get("/card/language-stats" , profileController.getLanguageCard);

//Sections Generation
router.post("/section/generate-introduction", isLoggedIn, sectionGenerationRateLimit, validate(profileValidations.introductionSchema) , profileController.generateIntroduction);
router.post("/section/generate-techstack", isLoggedIn, sectionGenerationRateLimit, validate(profileValidations.techstackSchema), profileController.generateTechStack);
router.post("/section/generate-stats", isLoggedIn, sectionGenerationRateLimit, validate(profileValidations.statsSchema), profileController.generateStatsSection);
router.post("/section/generate-repos", isLoggedIn, sectionGenerationRateLimit, validate(profileValidations.reposSchema), profileController.generateRepoSection);
router.post("/section/generate-socials", isLoggedIn, sectionGenerationRateLimit, validate(profileValidations.socialsSchema), profileController.generateSocialsSection);

//Complete Profile Generation
router.post("/section/generate-profile", isLoggedIn, validate(profileValidations.completeProfileSchema), profileController.generateProfile);

//Additional Prompt
router.post("/section/generate-additional", isLoggedIn, validate(profileValidations.additionalPromptSchema), profileController.generateResponseForAdditionalPrompt);
export default router;