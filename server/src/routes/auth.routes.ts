import { Router } from "express";
import { handleSignUp , handleLogin ,logout } from "../controllers/auth.controller";

const router = Router(); 

router.route("/signup").post(handleSignUp);
router.route("/login").post(handleLogin);
router.route("/logout").get(logout);

export default router; 


