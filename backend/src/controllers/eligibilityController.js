import { evaluateEligibility } from "../services/eligibilityService.js";
import { eligibilityCheckSchema } from "../validators/eligibilityValidator.js";

export async function checkEligibility(req, res) {
  try {
    const parseResult = eligibilityCheckSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid eligibility submission data",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const evaluation = await evaluateEligibility(parseResult.data);
    res.json(evaluation);
  } catch (error) {
    console.error("Error evaluating eligibility:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while processing scheme eligibility.",
    });
  }
}
