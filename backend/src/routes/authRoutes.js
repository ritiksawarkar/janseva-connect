import { Router } from "express";
import { login, getProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, getProfile);

export default router;
