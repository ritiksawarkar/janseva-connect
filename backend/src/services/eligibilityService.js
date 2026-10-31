import { query } from "../config/db.js";

export async function evaluateEligibility(citizenInput) {
  const {
    age,
    state,
    district,
    annualIncome,
    education,
    occupation,
    gender,
    category,
    hasPuccaHouse,
    isRationCardHolder,
    ownsLand,
  } = citizenInput;

  // Fetch all active schemes along with their eligibility rules
  const schemesSql = `
    SELECT 
      sc.id,
      sc.name,
      sc.slug,
      sc.description,
      sc.benefits,
      sc.category,
      sc.scheme_level,
      sc.state,
      sc.beneficiary_group,
      sc.official_application_url,
      sc.source_url,
      sc.is_verified,
      d.name as department_name
    FROM schemes sc
    LEFT JOIN departments d ON sc.department_id = d.id
    WHERE sc.status = 'ACTIVE'
    ORDER BY sc.is_featured DESC, sc.id ASC
  `;
  const schemesRes = await query(schemesSql);
  const schemes = schemesRes.rows;

  const rulesSql = `
    SELECT 
      id,
      scheme_id,
      rule_type,
      operator,
      expected_value,
      is_mandatory,
      description
    FROM scheme_eligibility_rules
    ORDER BY is_mandatory DESC, id ASC
  `;
  const rulesRes = await query(rulesSql);
  const rulesByScheme = {};
  for (const r of rulesRes.rows) {
    if (!rulesByScheme[r.scheme_id]) {
      rulesByScheme[r.scheme_id] = [];
    }
    rulesByScheme[r.scheme_id].push(r);
  }

  const results = [];

  for (const scheme of schemes) {
    const rules = rulesByScheme[scheme.id] || [];
    const matchedCriteria = [];
    const unmatchedCriteria = [];
    const unknownCriteria = [];

    // Evaluate state match at scheme level
    const normState = (state || "").toLowerCase().trim();
    const schemeState = (scheme.state || "").toLowerCase().trim();

    if (schemeState !== "all india" && normState && !schemeState.includes(normState) && !normState.includes(schemeState)) {
      unmatchedCriteria.push(`Scheme is restricted to residents of ${scheme.state} (Citizen provided: ${state})`);
    } else if (normState) {
      matchedCriteria.push(`State requirement met: ${scheme.state === "All India" ? "Valid across India" : scheme.state}`);
    }

    for (const rule of rules) {
      const expVal = rule.expected_value;
      const ruleType = rule.rule_type.toUpperCase();

      switch (ruleType) {
        case "AGE_MIN": {
          const minAge = typeof expVal === "number" ? expVal : parseInt(expVal, 10);
          if (typeof age === "number" && !isNaN(age)) {
            if (age >= minAge) {
              matchedCriteria.push(`Minimum age requirement met: ≥ ${minAge} years (Citizen is ${age})`);
            } else {
              if (rule.is_mandatory) {
                unmatchedCriteria.push(`Age requirement not met: Minimum ${minAge} years required (Citizen is ${age})`);
              } else {
                unknownCriteria.push(`Minimum age preference: ${minAge} years (Citizen is ${age})`);
              }
            }
          } else {
            unknownCriteria.push(`Age verification required: ${rule.description}`);
          }
          break;
        }

        case "AGE_MAX": {
          const maxAge = typeof expVal === "number" ? expVal : parseInt(expVal, 10);
          if (typeof age === "number" && !isNaN(age)) {
            if (age <= maxAge) {
              matchedCriteria.push(`Maximum age requirement met: ≤ ${maxAge} years (Citizen is ${age})`);
            } else {
              if (rule.is_mandatory) {
                unmatchedCriteria.push(`Maximum age exceeded: Cap is ${maxAge} years (Citizen is ${age})`);
              } else {
                unknownCriteria.push(`Maximum age preference: ${maxAge} years`);
              }
            }
          } else {
            unknownCriteria.push(`Age verification required: ${rule.description}`);
          }
          break;
        }

        case "ANNUAL_INCOME_MAX": {
          const maxIncome = typeof expVal === "number" ? expVal : parseFloat(expVal);
          if (typeof annualIncome === "number" && !isNaN(annualIncome)) {
            if (annualIncome <= maxIncome) {
              matchedCriteria.push(
                `Income criteria met: Annual income ₹${annualIncome.toLocaleString("en-IN")} is within the limit of ₹${maxIncome.toLocaleString("en-IN")}`
              );
            } else {
              if (rule.is_mandatory) {
                unmatchedCriteria.push(
                  `Income exceeds ceiling: Annual family income ₹${annualIncome.toLocaleString("en-IN")} exceeds maximum cap of ₹${maxIncome.toLocaleString("en-IN")}`
                );
              } else {
                unknownCriteria.push(`Income threshold preference: ₹${maxIncome.toLocaleString("en-IN")}`);
              }
            }
          } else {
            unknownCriteria.push(`Income verification needed: ${rule.description}`);
          }
          break;
        }

        case "STATE": {
          const targetState = (typeof expVal === "string" ? expVal : String(expVal)).toLowerCase().trim();
          if (targetState !== "all india" && normState) {
            if (normState.includes(targetState) || targetState.includes(normState)) {
              matchedCriteria.push(`State domicile criteria met: ${expVal}`);
            } else {
              if (rule.is_mandatory) {
                unmatchedCriteria.push(`State domicile requirement not met: Required ${expVal}`);
              }
            }
          }
          break;
        }

        case "GENDER": {
          const expectedGender = (typeof expVal === "string" ? expVal : String(expVal)).toLowerCase().trim();
          const citizenGender = (gender || "").toLowerCase().trim();
          if (citizenGender && citizenGender !== "prefer not to say") {
            if (citizenGender === expectedGender) {
              matchedCriteria.push(`Gender requirement met: ${expVal}`);
            } else {
              if (rule.is_mandatory) {
                unmatchedCriteria.push(`Gender requirement not met: Scheme applies to ${expVal} applicants only`);
              }
            }
          } else {
            unknownCriteria.push(`Gender requirement requires confirmation: ${rule.description}`);
          }
          break;
        }

        case "OCCUPATION": {
          const allowedOccupations = Array.isArray(expVal) ? expVal.map((o) => String(o).toLowerCase()) : [String(expVal).toLowerCase()];
          const citizenOcc = (occupation || "").toLowerCase().trim();
          if (citizenOcc) {
            const matches = allowedOccupations.some((o) => citizenOcc.includes(o) || o.includes(citizenOcc));
            if (matches) {
              matchedCriteria.push(`Occupation requirement met: ${occupation}`);
            } else {
              if (rule.is_mandatory) {
                unmatchedCriteria.push(`Occupation criteria not met: Required ${allowedOccupations.join(", ")}, declared ${occupation}`);
              } else {
                unknownCriteria.push(`Occupation preference: ${rule.description}`);
              }
            }
          } else {
            unknownCriteria.push(`Occupation condition requires confirmation: ${rule.description}`);
          }
          break;
        }

        case "EDUCATION": {
          const allowedEducation = Array.isArray(expVal) ? expVal.map((e) => String(e).toLowerCase()) : [String(expVal).toLowerCase()];
          const citizenEdu = (education || "").toLowerCase().trim();
          if (citizenEdu) {
            const matches = allowedEducation.some((e) => citizenEdu.includes(e) || e.includes(citizenEdu));
            if (matches) {
              matchedCriteria.push(`Education level requirement met: ${education}`);
            } else {
              if (rule.is_mandatory) {
                unknownCriteria.push(`Specific course/qualification verification needed: ${rule.description}`);
              }
            }
          } else {
            unknownCriteria.push(`Education criteria verification needed: ${rule.description}`);
          }
          break;
        }

        default: {
          unknownCriteria.push(rule.description || "Specific condition requires departmental document check");
          break;
        }
      }
    }

    // Determine Classification
    let status = "POSSIBLY_ELIGIBLE";
    let reason = "";

    if (unmatchedCriteria.length > 0) {
      status = "UNLIKELY_ELIGIBLE";
      reason = `Did not meet ${unmatchedCriteria.length} mandatory requirement(s): ${unmatchedCriteria[0]}`;
    } else if (matchedCriteria.length >= 2 && unknownCriteria.length === 0) {
      status = "LIKELY_ELIGIBLE";
      reason = `All checked criteria (${matchedCriteria.length} rules) match the official guidelines.`;
    } else if (matchedCriteria.length >= 2 && unknownCriteria.length <= 2) {
      status = "LIKELY_ELIGIBLE";
      reason = `Primary criteria (${matchedCriteria.length} checks) match. Preliminary match indicates high likelihood of eligibility pending document verification.`;
    } else if (matchedCriteria.length > 0) {
      status = "POSSIBLY_ELIGIBLE";
      reason = `Demographic profile is compatible. Requires official verification of ${unknownCriteria.length} specific document or family status condition(s).`;
    } else {
      status = "POSSIBLY_ELIGIBLE";
      reason = `General eligibility guidelines apply. Please review scheme details and official portal criteria.`;
    }

    results.push({
      schemeId: scheme.id,
      schemeName: scheme.name,
      slug: scheme.slug,
      category: scheme.category,
      schemeLevel: scheme.scheme_level,
      beneficiaryGroup: scheme.beneficiary_group,
      departmentName: scheme.department_name,
      officialApplicationUrl: scheme.official_application_url,
      sourceUrl: scheme.source_url,
      isVerified: scheme.is_verified,
      status,
      matchedCriteria,
      unmatchedCriteria,
      unknownCriteria,
      reason,
    });
  }

  // Sort results: LIKELY_ELIGIBLE first, then POSSIBLY_ELIGIBLE, then UNLIKELY_ELIGIBLE
  const priority = {
    LIKELY_ELIGIBLE: 1,
    POSSIBLY_ELIGIBLE: 2,
    UNLIKELY_ELIGIBLE: 3,
  };

  results.sort((a, b) => {
    if (priority[a.status] !== priority[b.status]) {
      return priority[a.status] - priority[b.status];
    }
    return b.matchedCriteria.length - a.matchedCriteria.length;
  });

  return {
    success: true,
    disclaimer:
      "These results are preliminary informational matches based on the information provided. Final eligibility and approval are determined by the responsible government authority.",
    evaluatedCount: results.length,
    counts: {
      likely: results.filter((r) => r.status === "LIKELY_ELIGIBLE").length,
      possibly: results.filter((r) => r.status === "POSSIBLY_ELIGIBLE").length,
      unlikely: results.filter((r) => r.status === "UNLIKELY_ELIGIBLE").length,
    },
    results,
  };
}
