import { Router } from "express";
import profileController from "../controllers/profileController.js";
import isLoggedIn from "../utils/isLoggedIn.js";

const router = Router();

router.get("/data/contribution-stats", profileController.getContributionStats);




export default router;