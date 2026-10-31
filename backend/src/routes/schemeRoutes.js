import { Router } from "express";
import {
  getSchemes,
  getFeatured,
  getSchemeById,
  getCategories,
} from "../controllers/schemeController.js";

const router = Router();

router.get("/featured", getFeatured);
router.get("/categories", getCategories);
router.get("/", getSchemes);
router.get("/:id", getSchemeById);

export default router;
