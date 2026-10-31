import { Router } from "express";
import { checkEligibility } from "../controllers/eligibilityController.js";

const router = Router();

router.post("/check", checkEligibility);

export default router;
