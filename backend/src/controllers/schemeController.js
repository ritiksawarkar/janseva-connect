import {
  fetchSchemes,
  fetchFeaturedSchemes,
  fetchSchemeByIdOrSlug,
  fetchSchemeCategories,
} from "../services/schemeService.js";
import { getSchemesQuerySchema, schemeIdParamSchema } from "../validators/schemeValidator.js";

export async function getSchemes(req, res) {
  try {
    const parseResult = getSchemesQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const data = await fetchSchemes(parseResult.data);
    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Error fetching schemes:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving government schemes.",
    });
  }
}

export async function getFeatured(req, res) {
  try {
    const limit = parseInt(req.query.limit || "4", 10);
    const featured = await fetchFeaturedSchemes(limit);
    res.json({
      success: true,
      schemes: featured,
    });
  } catch (error) {
    console.error("Error fetching featured schemes:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving featured schemes.",
    });
  }
}

export async function getSchemeById(req, res) {
  try {
    const parseResult = schemeIdParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheme identifier",
      });
    }

    const scheme = await fetchSchemeByIdOrSlug(parseResult.data.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "The requested government scheme was not found.",
      });
    }

    res.json({
      success: true,
      scheme,
    });
  } catch (error) {
    console.error("Error fetching scheme details:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving scheme details.",
    });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await fetchSchemeCategories();
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching scheme categories:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving categories.",
    });
  }
}
