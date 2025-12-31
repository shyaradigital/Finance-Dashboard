import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { authRateLimiter, writeRateLimiter, deleteRateLimiter, readRateLimiter } from "../middleware/rateLimiter";
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
  authRateLimiter, // Add rate limiting to prevent abuse
  validate(refreshTokenSchema),
  authController.refresh.bind(authController)
);

router.post(
  "/logout",
  authenticate, // Require authentication for logout
  writeRateLimiter, // Add rate limiting to prevent abuse
  authController.logout.bind(authController)
);

// Protected routes
router.get(
  "/me",
  authenticate,
  readRateLimiter,
  authController.getMe.bind(authController)
);

router.put(
  "/profile",
  authenticate,
  writeRateLimiter,
  validateApiSecret,
  validate(updateProfileSchema),
  authController.updateProfile.bind(authController)
);

router.put(
  "/password",
  authenticate,
  writeRateLimiter,
  validateApiSecret,
  validate(changePasswordSchema),
  authController.changePassword.bind(authController)
);

router.delete(
  "/account",
  authenticate,
  deleteRateLimiter,
  validateApiSecret,
  authController.deleteAccount.bind(authController)
);

export default router;

