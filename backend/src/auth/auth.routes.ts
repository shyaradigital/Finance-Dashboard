import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { authRateLimiter } from "../middleware/rateLimiter";
import {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "./auth.schemas";

const router = Router();

// Public routes
router.post(
  "/signup",
  authRateLimiter,
  validate(signupSchema),
  authController.signup.bind(authController)
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refresh.bind(authController)
);

router.post("/logout", authController.logout.bind(authController));

// Protected routes
router.get("/me", authenticate, authController.getMe.bind(authController));

router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile.bind(authController)
);

router.put(
  "/password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword.bind(authController)
);

router.delete(
  "/account",
  authenticate,
  authController.deleteAccount.bind(authController)
);

export default router;

