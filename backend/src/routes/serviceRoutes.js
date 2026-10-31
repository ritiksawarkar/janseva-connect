import { Router } from "express";
import {
  getServices,
  getServiceById,
  getCategories,
  getDepartments,
} from "../controllers/serviceController.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/departments", getDepartments);
router.get("/", getServices);
router.get("/:id", getServiceById);

export default router;
