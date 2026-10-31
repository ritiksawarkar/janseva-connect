import { Router } from "express";
import { register, login, getMe, getProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.get("/profile", authenticate, getProfile);

export default router;
