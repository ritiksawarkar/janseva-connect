import { query } from "../config/db.js";

export async function fetchServices(filters) {
  const { page, limit, search, category, department_id, department, is_verified, sort } = filters;
  const offset = (page - 1) * limit;

  const conditions = ["s.status = 'ACTIVE'"];
  const params = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(s.name ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex} OR s.category ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    conditions.push(`s.category = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  if (department_id) {
    conditions.push(`s.department_id = $${paramIndex}`);
    params.push(department_id);
    paramIndex++;
  } else if (department) {
    conditions.push(`d.name ILIKE $${paramIndex}`);
    params.push(`%${department}%`);
    paramIndex++;
  }

  if (typeof is_verified === "boolean") {
    conditions.push(`s.is_verified = $${paramIndex}`);
    params.push(is_verified);
    paramIndex++;
  }

  let orderBy = "s.created_at DESC";
  if (sort === "name_asc") {
    orderBy = "s.name ASC";
  } else if (sort === "name_desc") {
    orderBy = "s.name DESC";
  } else if (sort === "popular") {
    orderBy = "s.id ASC";
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total
  const countSql = `
    SELECT COUNT(s.id) as total
    FROM services s
    LEFT JOIN departments d ON s.department_id = d.id
    ${whereClause}
  `;
  const countResult = await query(countSql, params);
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  // Fetch paginated rows
  const dataSql = `
    SELECT 
      s.id,
      s.name,
      s.slug,
      s.description,
      s.eligibility,
      s.fees,
      s.documents,
      s.application_steps,
      s.category,
      s.official_application_url,
      s.official_source_url,
      s.is_verified,
      s.status,
      s.current_version,
      s.created_at,
      s.updated_at,
      d.id as department_id,
      d.name as department_name,
      d.code as department_code,
      d.website_url as department_website
    FROM services s
    LEFT JOIN departments d ON s.department_id = d.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);
  const dataResult = await query(dataSql, params);

  return {
    services: dataResult.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export async function fetchServiceByIdOrSlug(idOrSlug) {
  const isNumeric = /^\d+$/.test(idOrSlug);
  const condition = isNumeric ? "s.id = $1" : "s.slug = $1";

  const sql = `
    SELECT 
      s.id,
      s.name,
      s.slug,
      s.description,
      s.eligibility,
      s.fees,
      s.documents,
      s.application_steps,
      s.category,
      s.official_application_url,
      s.official_source_url,
      s.is_verified,
      s.status,
      s.current_version,
      s.created_at,
      s.updated_at,
      d.id as department_id,
      d.name as department_name,
      d.code as department_code,
      d.description as department_description,
      d.contact_email as department_email,
      d.website_url as department_website
    FROM services s
    LEFT JOIN departments d ON s.department_id = d.id
    WHERE ${condition} AND s.status = 'ACTIVE'
    LIMIT 1
  `;

  const result = await query(sql, [idOrSlug]);
  if (result.rows.length === 0) {
    return null;
  }

  const service = result.rows[0];

  // Fetch version history
  const versionsSql = `
    SELECT id, version_number, source_url, verified_at, updated_by, created_at
    FROM service_versions
    WHERE service_id = $1
    ORDER BY version_number DESC
  `;
  const versionsResult = await query(versionsSql, [service.id]);
  service.versions = versionsResult.rows;

  return service;
}

export async function fetchServiceCategories() {
  const sql = `
    SELECT category, COUNT(id) as count
    FROM services
    WHERE status = 'ACTIVE'
    GROUP BY category
    ORDER BY count DESC, category ASC
  `;
  const result = await query(sql);
  return result.rows.map((r) => ({
    category: r.category,
    count: parseInt(r.count, 10),
  }));
}

export async function fetchServiceDepartments() {
  const sql = `
    SELECT DISTINCT d.id, d.name, d.code, COUNT(s.id) as service_count
    FROM departments d
    JOIN services s ON s.department_id = d.id
    WHERE s.status = 'ACTIVE'
    GROUP BY d.id, d.name, d.code
    ORDER BY service_count DESC, d.name ASC
  `;
  const result = await query(sql);
  return result.rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    service_count: parseInt(r.service_count, 10),
  }));
}
