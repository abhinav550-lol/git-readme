import { Router } from "express";
import userController from "../controllers/userController.js";
import isLoggedIn from "../utils/isLoggedIn.js";
import { validate } from "../error/validateMiddleware.js";
import { userValidations } from "../validations/userValidations.js";

const router = Router();

//Auth Routes
router.get("/auth/me" , isLoggedIn , userController.getCurrentUser);

router.get("/auth/github", userController.authorizeGithub);
router.get("/auth/github/callback", userController.callbackGithub);
router.post("/auth/github/logout", isLoggedIn , userController.logoutGithub);

//User Repos
router.get("/repos", isLoggedIn, userController.getUserRepos);
router.get("/repos/:repoName/readme", isLoggedIn, userController.getRepoReadme);
router.get("/user-languages", isLoggedIn, userController.getUserLanguages);
router.put("/profile-repo/readme", isLoggedIn, validate(userValidations.pushReadmeSchema) , userController.pushReadmeToProfileRepo);

export default router;