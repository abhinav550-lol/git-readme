import { Router } from "express";
import userController from "../controllers/userController.js";
import isLoggedIn from "../utils/isLoggedIn.js";

const router = Router();

//Auth Routes
router.get("/auth/github", userController.authorizeGithub);
router.get("/auth/github/callback", userController.callbackGithub);
router.get("/auth/github/logout", isLoggedIn , userController.logoutGithub);

router.get("/repos", isLoggedIn, userController.getUserRepos);
router.get("/repos/:repoName/readme", isLoggedIn, userController.getRepoReadme);

export default router;