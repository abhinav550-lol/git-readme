import { Router } from "express";
import profileController from "../controllers/profileController.js";
import isLoggedIn from "../utils/isLoggedIn.js";

const router = Router();

router.get("/data/contribution-stats", profileController.getContributionStats);
router.get("/card/contribution-stats", profileController.getContributionCard);

router.get("/data/language-stats" , profileController.getLanguageStats);
router.get("/card/language-stats" , profileController.getLanguageCard);

router.get("/user-languages", isLoggedIn, profileController.getUserLanguages);

router.post("/section/generate-introduction", isLoggedIn, profileController.generateIntroduction);
router.post("/section/generate-techstack", isLoggedIn, profileController.generateTechStack);
router.post("/section/generate-stats", isLoggedIn, profileController.generateStatsSection);
router.post("/section/generate-repos", isLoggedIn, profileController.generateRepoSection);
router.post("/section/generate-socials", isLoggedIn, profileController.generateSocialsSection);

export default router;