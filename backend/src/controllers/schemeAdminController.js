import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";

export async function getSchemes(req, res) {
  const store = getStore();
  const { search = "", category, scheme_level, state, verification_status, publication_status } = req.query;

  let schemes = [...store.government_schemes];

  if (category && category !== "ALL") {
    schemes = schemes.filter((s) => s.category === category);
  }
  if (scheme_level && scheme_level !== "ALL") {
    schemes = schemes.filter((s) => s.scheme_level === scheme_level);
  }
  if (state && state !== "ALL") {
    schemes = schemes.filter((s) => s.state === state);
  }
  if (verification_status && verification_status !== "ALL") {
    schemes = schemes.filter((s) => s.verification_status === verification_status);
  }
  if (publication_status && publication_status !== "ALL") {
    schemes = schemes.filter((s) => s.publication_status === publication_status);
  }

  const enriched = schemes.map((s) => {
    const dept = store.departments.find((d) => d.id === s.department_id);
    return {
      ...s,
      department_name: dept ? dept.name : "Unassigned"
    };
  });

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    return res.json({
      success: true,
      data: enriched.filter(
        (s) =>
          s.scheme_name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.beneficiary_group && s.beneficiary_group.toLowerCase().includes(q))
      )
    });
  }

  return res.json({
    success: true,
    data: enriched
  });
}

export async function getSchemeById(req, res) {
  const store = getStore();
  const schemeId = parseInt(req.params.id, 10);
  const scheme = store.government_schemes.find((s) => s.id === schemeId);

  if (!scheme) {
    return res.status(404).json({
      success: false,
      message: "Government scheme not found."
    });
  }

  const dept = store.departments.find((d) => d.id === scheme.department_id);
  const versions = store.scheme_versions
    .filter((v) => v.scheme_id === schemeId)
    .sort((a, b) => b.version_number - a.version_number);

  return res.json({
    success: true,
    data: {
      ...scheme,
      department_name: dept ? dept.name : "Unassigned",
      versions
    }
  });
}

export async function createScheme(req, res) {
  const store = getStore();
  const {
    scheme_name,
    description,
    objectives,
    benefits,
    category,
    scheme_level = "CENTRAL",
    state,
    beneficiary_group,
    eligibility_criteria,
    structured_eligibility = {},
    required_documents = [],
    application_procedure,
    department_id,
    official_application_url,
    official_source_url,
    verification_status = "PENDING",
    publication_status = "DRAFT"
  } = req.body;

  if (!scheme_name || !description || !category) {
    return res.status(400).json({
      success: false,
      message: "Scheme name, description, and category are required."
    });
  }

  const newScheme = {
    id: store.government_schemes.length + 1,
    scheme_name: scheme_name.trim(),
    description: description.trim(),
    objectives: objectives ? objectives.trim() : "",
    benefits: benefits ? benefits.trim() : "",
    category: category.trim(),
    scheme_level,
    state: state ? state.trim() : "All India",
    beneficiary_group: beneficiary_group ? beneficiary_group.trim() : "",
    eligibility_criteria: eligibility_criteria ? eligibility_criteria.trim() : "",
    structured_eligibility: structured_eligibility || {},
    required_documents: Array.isArray(required_documents) ? required_documents : [],
    application_procedure: application_procedure ? application_procedure.trim() : "",
    department_id: department_id ? parseInt(department_id, 10) : null,
    official_application_url: official_application_url ? official_application_url.trim() : "",
    official_source_url: official_source_url ? official_source_url.trim() : "",
    verification_status,
    publication_status,
    current_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  store.government_schemes.push(newScheme);

  // Archive initial version
  store.scheme_versions.push({
    id: store.scheme_versions.length + 1,
    scheme_id: newScheme.id,
    version_number: 1,
    scheme_snapshot: { ...newScheme },
    source_url: newScheme.official_source_url,
    updated_by: req.user.id,
    change_summary: "Initial scheme added.",
    created_at: new Date().toISOString()
  });

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "SCHEME_CREATED",
    entity_type: "GOVERNMENT_SCHEME",
    entity_id: newScheme.id,
    new_values: newScheme
  });

  return res.status(201).json({
    success: true,
    message: "Government scheme created successfully.",
    data: newScheme
  });
}

export async function updateScheme(req, res) {
  const store = getStore();
  const schemeId = parseInt(req.params.id, 10);
  const scheme = store.government_schemes.find((s) => s.id === schemeId);

  if (!scheme) {
    return res.status(404).json({
      success: false,
      message: "Scheme not found."
    });
  }

  const oldSnapshot = { ...scheme };
  const {
    scheme_name,
    description,
    objectives,
    benefits,
    category,
    scheme_level,
    state,
    beneficiary_group,
    eligibility_criteria,
    structured_eligibility,
    required_documents,
    application_procedure,
    department_id,
    official_application_url,
    official_source_url,
    change_summary
  } = req.body;

  if (scheme_name) scheme.scheme_name = scheme_name.trim();
  if (description) scheme.description = description.trim();
  if (objectives !== undefined) scheme.objectives = objectives.trim();
  if (benefits !== undefined) scheme.benefits = benefits.trim();
  if (category) scheme.category = category.trim();
  if (scheme_level) scheme.scheme_level = scheme_level;
  if (state !== undefined) scheme.state = state.trim();
  if (beneficiary_group !== undefined) scheme.beneficiary_group = beneficiary_group.trim();
  if (eligibility_criteria !== undefined) scheme.eligibility_criteria = eligibility_criteria.trim();
  if (structured_eligibility !== undefined) scheme.structured_eligibility = structured_eligibility;
  if (required_documents !== undefined) scheme.required_documents = required_documents;
  if (application_procedure !== undefined) scheme.application_procedure = application_procedure.trim();
  if (department_id !== undefined) scheme.department_id = department_id ? parseInt(department_id, 10) : null;
  if (official_application_url !== undefined) scheme.official_application_url = official_application_url.trim();
  if (official_source_url !== undefined) scheme.official_source_url = official_source_url.trim();

  scheme.current_version = (scheme.current_version || 1) + 1;
  scheme.updated_at = new Date().toISOString();

  // Archive new version
  store.scheme_versions.push({
    id: store.scheme_versions.length + 1,
    scheme_id: schemeId,
    version_number: scheme.current_version,
    scheme_snapshot: { ...scheme },
    source_url: scheme.official_source_url,
    updated_by: req.user.id,
    change_summary: change_summary || `Updated to version ${scheme.current_version}`,
    created_at: new Date().toISOString()
  });

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "SCHEME_UPDATED",
    entity_type: "GOVERNMENT_SCHEME",
    entity_id: schemeId,
    old_values: oldSnapshot,
    new_values: scheme
  });

  return res.json({
    success: true,
    message: "Scheme updated and new version archived successfully.",
    data: scheme
  });
}

export async function verifyScheme(req, res) {
  const store = getStore();
  const schemeId = parseInt(req.params.id, 10);
  const scheme = store.government_schemes.find((s) => s.id === schemeId);

  if (!scheme) {
    return res.status(404).json({
      success: false,
      message: "Scheme not found."
    });
  }

  const { verification_status } = req.body;
  scheme.verification_status = verification_status || "VERIFIED";
  scheme.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: `SCHEME_VERIFICATION_${scheme.verification_status}`,
    entity_type: "GOVERNMENT_SCHEME",
    entity_id: schemeId,
    new_values: { verification_status: scheme.verification_status }
  });

  return res.json({
    success: true,
    message: `Scheme verification status set to ${scheme.verification_status}.`,
    data: scheme
  });
}

export async function publishScheme(req, res) {
  const store = getStore();
  const schemeId = parseInt(req.params.id, 10);
  const scheme = store.government_schemes.find((s) => s.id === schemeId);

  if (!scheme) {
    return res.status(404).json({
      success: false,
      message: "Scheme not found."
    });
  }

  const { publication_status } = req.body;
  scheme.publication_status = publication_status || "PUBLISHED";
  scheme.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: `SCHEME_PUBLISH_${scheme.publication_status}`,
    entity_type: "GOVERNMENT_SCHEME",
    entity_id: schemeId,
    new_values: { publication_status: scheme.publication_status }
  });

  return res.json({
    success: true,
    message: `Scheme publication status set to ${scheme.publication_status}.`,
    data: scheme
  });
}

export async function getSchemeVersions(req, res) {
  const store = getStore();
  const schemeId = parseInt(req.params.id, 10);
  const versions = store.scheme_versions
    .filter((v) => v.scheme_id === schemeId)
    .sort((a, b) => b.version_number - a.version_number);

  return res.json({
    success: true,
    data: versions
  });
}
