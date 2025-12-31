import { Router } from "express";
import { commitmentsController } from "./commitments.controller";
import { authenticate, validateApiSecret } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { readRateLimiter, writeRateLimiter, deleteRateLimiter } from "../middleware/rateLimiter";
import {
  createCommitmentSchema,
  updateCommitmentSchema,
} from "./commitments.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  readRateLimiter,
  commitmentsController.getCommitments.bind(commitmentsController)
);

router.get(
  "/upcoming",
  readRateLimiter,
  commitmentsController.getUpcomingCommitments.bind(commitmentsController)
);

router.get(
  "/:id",
  readRateLimiter,
  commitmentsController.getCommitmentById.bind(commitmentsController)
);

router.post(
  "/",
  writeRateLimiter,
  validateApiSecret,
  validate(createCommitmentSchema),
  commitmentsController.createCommitment.bind(commitmentsController)
);

router.put(
  "/:id",
  writeRateLimiter,
  validateApiSecret,
  validate(updateCommitmentSchema),
  commitmentsController.updateCommitment.bind(commitmentsController)
);

router.delete(
  "/:id",
  deleteRateLimiter,
  validateApiSecret,
  commitmentsController.deleteCommitment.bind(commitmentsController)
);

export default router;

