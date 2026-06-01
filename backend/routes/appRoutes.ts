import { Router } from "express";
import {appController} from "../controllers/appController.js";
const router = Router();

router.get("/user-count", appController.getUserCount);

export default router;