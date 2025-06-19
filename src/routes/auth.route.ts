import { Router } from "express";
import { logoutUser, signin, signup, verifyEmail } from "../controllers/auth.controller"
import { signinSchema, signupSchema, verifyEmailSchema } from "../schemas/authSchema"
import { validate } from "../middlewares/validate"
const authRoutes = Router();

// GET routes
authRoutes.get("/verify-email", validate(verifyEmailSchema), verifyEmail);
authRoutes.get("/logout", logoutUser);

// POST routes
authRoutes.post("/signup", validate(signupSchema), signup);
authRoutes.post("/signin", validate(signinSchema), signin);

export default authRoutes;