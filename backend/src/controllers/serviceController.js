import {
  fetchServices,
  fetchServiceByIdOrSlug,
  fetchServiceCategories,
  fetchServiceDepartments,
} from "../services/serviceService.js";
import { getServicesQuerySchema, serviceIdParamSchema } from "../validators/serviceValidator.js";

export async function getServices(req, res) {
  try {
    const parseResult = getServicesQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const data = await fetchServices(parseResult.data);
    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving public services.",
    });
  }
}

export async function getServiceById(req, res) {
  try {
    const parseResult = serviceIdParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid service identifier",
      });
    }

    const service = await fetchServiceByIdOrSlug(parseResult.data.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "The requested public service was not found.",
      });
    }

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Error fetching service details:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving service details.",
    });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await fetchServiceCategories();
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching service categories:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving categories.",
    });
  }
}

export async function getDepartments(req, res) {
  try {
    const departments = await fetchServiceDepartments();
    res.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Error fetching service departments:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving departments.",
    });
  }
}
