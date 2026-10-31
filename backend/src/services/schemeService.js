import { query } from "../config/db.js";

export async function fetchSchemes(filters) {
  const { page, limit, search, category, state, beneficiary_group, is_verified, sort } = filters;
  const offset = (page - 1) * limit;

  const conditions = ["sc.status = 'ACTIVE'"];
  const params = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(sc.name ILIKE $${paramIndex} OR sc.description ILIKE $${paramIndex} OR sc.objectives ILIKE $${paramIndex} OR sc.category ILIKE $${paramIndex} OR sc.beneficiary_group ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    conditions.push(`sc.category = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  if (state && state !== "All India") {
    conditions.push(`(sc.state = $${paramIndex} OR sc.state = 'All India')`);
    params.push(state);
    paramIndex++;
  }

  if (beneficiary_group) {
    conditions.push(`sc.beneficiary_group ILIKE $${paramIndex}`);
    params.push(`%${beneficiary_group}%`);
    paramIndex++;
  }

  if (typeof is_verified === "boolean") {
    conditions.push(`sc.is_verified = $${paramIndex}`);
    params.push(is_verified);
    paramIndex++;
  }

  let orderBy = "sc.is_featured DESC, sc.created_at DESC";
  if (sort === "name_asc") {
    orderBy = "sc.name ASC";
  } else if (sort === "name_desc") {
    orderBy = "sc.name DESC";
  } else if (sort === "featured") {
    orderBy = "sc.is_featured DESC, sc.name ASC";
  } else if (sort === "latest") {
    orderBy = "sc.created_at DESC";
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total
  const countSql = `
    SELECT COUNT(sc.id) as total
    FROM schemes sc
    ${whereClause}
  `;
  const countResult = await query(countSql, params);
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  // Fetch paginated rows
  const dataSql = `
    SELECT 
      sc.id,
      sc.name,
      sc.slug,
      sc.description,
      sc.objectives,
      sc.benefits,
      sc.category,
      sc.scheme_level,
      sc.state,
      sc.beneficiary_group,
      sc.eligibility_description,
      sc.documents,
      sc.application_steps,
      sc.responsible_department,
      sc.official_application_url,
      sc.source_url,
      sc.is_verified,
      sc.is_featured,
      sc.status,
      sc.last_verified_at,
      sc.created_at,
      sc.updated_at,
      d.id as department_id,
      d.name as department_name,
      d.code as department_code,
      COUNT(r.id) as rules_count
    FROM schemes sc
    LEFT JOIN departments d ON sc.department_id = d.id
    LEFT JOIN scheme_eligibility_rules r ON r.scheme_id = sc.id
    ${whereClause}
    GROUP BY sc.id, d.id, d.name, d.code
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);
  const dataResult = await query(dataSql, params);

  return {
    schemes: dataResult.rows.map((r) => ({
      ...r,
      rules_count: parseInt(r.rules_count, 10),
    })),
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

export async function fetchFeaturedSchemes(limit = 4) {
  const sql = `
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
      sc.is_verified,
      sc.is_featured,
      sc.official_application_url,
      sc.source_url,
      sc.last_verified_at,
      d.name as department_name
    FROM schemes sc
    LEFT JOIN departments d ON sc.department_id = d.id
    WHERE sc.status = 'ACTIVE' AND sc.is_verified = true
    ORDER BY sc.is_featured DESC, sc.created_at DESC
    LIMIT $1
  `;
  const result = await query(sql, [limit]);
  return result.rows;
}

export async function fetchSchemeByIdOrSlug(idOrSlug) {
  const isNumeric = /^\d+$/.test(idOrSlug);
  const condition = isNumeric ? "sc.id = $1" : "sc.slug = $1";

  const sql = `
    SELECT 
      sc.id,
      sc.name,
      sc.slug,
      sc.description,
      sc.objectives,
      sc.benefits,
      sc.category,
      sc.scheme_level,
      sc.state,
      sc.beneficiary_group,
      sc.eligibility_description,
      sc.documents,
      sc.application_steps,
      sc.responsible_department,
      sc.official_application_url,
      sc.source_url,
      sc.is_verified,
      sc.is_featured,
      sc.status,
      sc.last_verified_at,
      sc.created_at,
      sc.updated_at,
      d.id as department_id,
      d.name as department_name,
      d.code as department_code,
      d.description as department_description,
      d.contact_email as department_email,
      d.website_url as department_website
    FROM schemes sc
    LEFT JOIN departments d ON sc.department_id = d.id
    WHERE ${condition} AND sc.status = 'ACTIVE'
    LIMIT 1
  `;

  const result = await query(sql, [idOrSlug]);
  if (result.rows.length === 0) {
    return null;
  }

  const scheme = result.rows[0];

  // Fetch eligibility rules
  const rulesSql = `
    SELECT id, rule_type, operator, expected_value, is_mandatory, description
    FROM scheme_eligibility_rules
    WHERE scheme_id = $1
    ORDER BY is_mandatory DESC, id ASC
  `;
  const rulesResult = await query(rulesSql, [scheme.id]);
  scheme.rules = rulesResult.rows;

  return scheme;
}

export async function fetchSchemeCategories() {
  const sql = `
    SELECT category, COUNT(id) as count
    FROM schemes
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
