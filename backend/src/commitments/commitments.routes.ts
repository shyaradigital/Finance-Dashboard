import { Router } from "express";
import { commitmentsController } from "./commitments.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import {
  createCommitmentSchema,
  updateCommitmentSchema,
} from "./commitments.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  commitmentsController.getCommitments.bind(commitmentsController)
);

router.get(
  "/upcoming",
  commitmentsController.getUpcomingCommitments.bind(commitmentsController)
);

router.get(
  "/:id",
  commitmentsController.getCommitmentById.bind(commitmentsController)
);

router.post(
  "/",
  validate(createCommitmentSchema),
  commitmentsController.createCommitment.bind(commitmentsController)
);

router.put(
  "/:id",
  validate(updateCommitmentSchema),
  commitmentsController.updateCommitment.bind(commitmentsController)
);

router.delete(
  "/:id",
  commitmentsController.deleteCommitment.bind(commitmentsController)
);

export default router;

