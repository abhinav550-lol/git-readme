import { Router } from "express";
import profileController from "../controllers/profileController.js";
import isLoggedIn from "../utils/isLoggedIn.js";

const router = Router();

router.get("/data/contribution-stats", profileController.getContributionStats);
router.get("/card/contribution-stats", profileController.getContributionCard);

router.get("/data/language-stats" , profileController.getLanguageStats);
router.get("/card/language-stats" , profileController.getLanguageCard);
export default router;