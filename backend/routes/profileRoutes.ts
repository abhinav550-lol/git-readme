import { Router } from "express";
import profileController from "../controllers/profileController.js";
import isLoggedIn from "../utils/isLoggedIn.js";

const router = Router();

router.get("/stats-card", profileController.generateStatsCard);

export default router;