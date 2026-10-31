import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";

export async function getServices(req, res) {
  const store = getStore();
  const { search = "", category, department_id, verification_status, publication_status } = req.query;

  let services = [...store.public_services];

  if (category && category !== "ALL") {
    services = services.filter((s) => s.category === category);
  }
  if (department_id && department_id !== "ALL") {
    services = services.filter((s) => s.department_id === parseInt(department_id, 10));
  }
  if (verification_status && verification_status !== "ALL") {
    services = services.filter((s) => s.verification_status === verification_status);
  }
  if (publication_status && publication_status !== "ALL") {
    services = services.filter((s) => s.publication_status === publication_status);
  }

  const enriched = services.map((s) => {
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
          s.service_name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      )
    });
  }

  return res.json({
    success: true,
    data: enriched
  });
}

export async function getServiceById(req, res) {
  const store = getStore();
  const serviceId = parseInt(req.params.id, 10);
  const service = store.public_services.find((s) => s.id === serviceId);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Public service not found."
    });
  }

  const dept = store.departments.find((d) => d.id === service.department_id);
  const versions = store.service_versions
    .filter((v) => v.service_id === serviceId)
    .sort((a, b) => b.version_number - a.version_number);

  return res.json({
    success: true,
    data: {
      ...service,
      department_name: dept ? dept.name : "Unassigned",
      versions
    }
  });
}

export async function createService(req, res) {
  const store = getStore();
  const {
    service_name,
    description,
    category,
    eligibility,
    required_documents,
    fees,
    application_steps,
    department_id,
    official_application_url,
    official_source_url,
    verification_status = "PENDING",
    publication_status = "DRAFT"
  } = req.body;

  if (!service_name || !description || !category) {
    return res.status(400).json({
      success: false,
      message: "Service name, description, and category are required."
    });
  }

  const newService = {
    id: store.public_services.length + 1,
    service_name: service_name.trim(),
    description: description.trim(),
    category: category.trim(),
    eligibility: eligibility ? eligibility.trim() : "",
    required_documents: Array.isArray(required_documents) ? required_documents : [],
    fees: fees ? fees.trim() : "Free",
    application_steps: Array.isArray(application_steps) ? application_steps : [],
    department_id: department_id ? parseInt(department_id, 10) : null,
    official_application_url: official_application_url ? official_application_url.trim() : "",
    official_source_url: official_source_url ? official_source_url.trim() : "",
    verification_status,
    publication_status,
    current_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  store.public_services.push(newService);

  // Initial version record
  store.service_versions.push({
    id: store.service_versions.length + 1,
    service_id: newService.id,
    version_number: 1,
    service_snapshot: { ...newService },
    source_url: newService.official_source_url,
    updated_by: req.user.id,
    change_summary: "Initial service created.",
    created_at: new Date().toISOString()
  });

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "SERVICE_CREATED",
    entity_type: "PUBLIC_SERVICE",
    entity_id: newService.id,
    new_values: newService
  });

  return res.status(201).json({
    success: true,
    message: "Public service created successfully.",
    data: newService
  });
}

export async function updateService(req, res) {
  const store = getStore();
  const serviceId = parseInt(req.params.id, 10);
  const service = store.public_services.find((s) => s.id === serviceId);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Public service not found."
    });
  }

  const oldSnapshot = { ...service };
  const {
    service_name,
    description,
    category,
    eligibility,
    required_documents,
    fees,
    application_steps,
    department_id,
    official_application_url,
    official_source_url,
    change_summary
  } = req.body;

  if (service_name) service.service_name = service_name.trim();
  if (description) service.description = description.trim();
  if (category) service.category = category.trim();
  if (eligibility !== undefined) service.eligibility = eligibility.trim();
  if (required_documents !== undefined) service.required_documents = required_documents;
  if (fees !== undefined) service.fees = fees.trim();
  if (application_steps !== undefined) service.application_steps = application_steps;
  if (department_id !== undefined) service.department_id = department_id ? parseInt(department_id, 10) : null;
  if (official_application_url !== undefined) service.official_application_url = official_application_url.trim();
  if (official_source_url !== undefined) service.official_source_url = official_source_url.trim();

  service.current_version = (service.current_version || 1) + 1;
  service.updated_at = new Date().toISOString();

  // Archive version
  store.service_versions.push({
    id: store.service_versions.length + 1,
    service_id: serviceId,
    version_number: service.current_version,
    service_snapshot: { ...service },
    source_url: service.official_source_url,
    updated_by: req.user.id,
    change_summary: change_summary || `Updated to version ${service.current_version}`,
    created_at: new Date().toISOString()
  });

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "SERVICE_UPDATED",
    entity_type: "PUBLIC_SERVICE",
    entity_id: serviceId,
    old_values: oldSnapshot,
    new_values: service
  });

  return res.json({
    success: true,
    message: "Service updated and new version archived successfully.",
    data: service
  });
}

export async function verifyService(req, res) {
  const store = getStore();
  const serviceId = parseInt(req.params.id, 10);
  const service = store.public_services.find((s) => s.id === serviceId);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found."
    });
  }

  const { verification_status } = req.body;
  service.verification_status = verification_status || "VERIFIED";
  service.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: `SERVICE_VERIFICATION_${service.verification_status}`,
    entity_type: "PUBLIC_SERVICE",
    entity_id: serviceId,
    new_values: { verification_status: service.verification_status }
  });

  return res.json({
    success: true,
    message: `Service verification status set to ${service.verification_status}.`,
    data: service
  });
}

export async function publishService(req, res) {
  const store = getStore();
  const serviceId = parseInt(req.params.id, 10);
  const service = store.public_services.find((s) => s.id === serviceId);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found."
    });
  }

  const { publication_status } = req.body;
  service.publication_status = publication_status || "PUBLISHED";
  service.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: `SERVICE_PUBLISH_${service.publication_status}`,
    entity_type: "PUBLIC_SERVICE",
    entity_id: serviceId,
    new_values: { publication_status: service.publication_status }
  });

  return res.json({
    success: true,
    message: `Service publication status set to ${service.publication_status}.`,
    data: service
  });
}

export async function getServiceVersions(req, res) {
  const store = getStore();
  const serviceId = parseInt(req.params.id, 10);
  const versions = store.service_versions
    .filter((v) => v.service_id === serviceId)
    .sort((a, b) => b.version_number - a.version_number);

  return res.json({
    success: true,
    data: versions
  });
}
