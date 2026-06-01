import { Router } from "express";
import profileController from "../controllers/profileController.js";
import isLoggedIn from "../utils/isLoggedIn.js";
import { validate } from "../error/validateMiddleware.js";
import { profileValidations } from "../validations/profileValidations.js";

const router = Router();

router.get("/data/contribution-stats", profileController.getContributionStats);
router.get("/card/contribution-stats", profileController.getContributionCard);

router.get("/data/language-stats" , profileController.getLanguageStats);
router.get("/card/language-stats" , profileController.getLanguageCard);

router.get("/user-languages", isLoggedIn, profileController.getUserLanguages);

router.post("/section/generate-introduction", isLoggedIn, validate(profileValidations.introductionSchema) , profileController.generateIntroduction);
router.post("/section/generate-techstack", isLoggedIn, validate(profileValidations.techstackSchema), profileController.generateTechStack);
router.post("/section/generate-stats", isLoggedIn, validate(profileValidations.statsSchema), profileController.generateStatsSection);
router.post("/section/generate-repos", isLoggedIn, validate(profileValidations.reposSchema), profileController.generateRepoSection);
router.post("/section/generate-socials", isLoggedIn, validate(profileValidations.socialsSchema), profileController.generateSocialsSection);

export default router;