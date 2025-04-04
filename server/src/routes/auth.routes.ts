import { Router } from "express";
import { handleSignUp , handleLogin ,logout } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { signUpSchema } from "../zod/schemas";

const router = Router(); 

router.route("/signup").post(validate(signUpSchema), handleSignUp);
router.route("/login").post(handleLogin);
router.route("/logout").get(logout);

export default router; 


