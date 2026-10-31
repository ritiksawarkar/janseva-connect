import { query } from '../config/db.js';

/**
 * Nearby Complaint Discovery Engine
 * Uses parameterized Haversine spherical distance calculation
 * Protects citizen privacy with approximate distance and generalized location
 */
export const findNearbyComplaints = async ({
  latitude,
  longitude,
  radius = 2, // km
  category = null,
  keywords = null,
  excludeComplaintId = null,
  currentUserId = null,
  page = 1,
  limit = 10
}) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const searchRadius = parseFloat(radius);
  const offset = (page - 1) * limit;

  const conditions = [
    'c.is_public = TRUE',
    'c.status NOT IN (\'RESOLVED\', \'REJECTED\')',
    'c.latitude IS NOT NULL',
    'c.longitude IS NOT NULL'
  ];
  const params = [lat, lng, searchRadius];
  let paramIdx = 4;

  if (category && category.trim()) {
    conditions.push(`LOWER(c.category) = LOWER($${paramIdx})`);
    params.push(category.trim());
    paramIdx++;
  }

  if (keywords && keywords.trim()) {
    conditions.push(`(LOWER(c.title) LIKE $${paramIdx} OR LOWER(c.description) LIKE $${paramIdx} OR LOWER(c.area) LIKE $${paramIdx})`);
    params.push(`%${keywords.trim().toLowerCase()}%`);
    paramIdx++;
  }

  if (excludeComplaintId) {
    conditions.push(`c.id != $${paramIdx}`);
    params.push(excludeComplaintId);
    paramIdx++;
  }

  // Haversine formula in KM: 6371 * acos(...)
  const haversineFormula = `
    (6371 * acos(
      LEAST(1.0, GREATEST(-1.0, 
        cos(radians($1)) * cos(radians(c.latitude)) * cos(radians(c.longitude) - radians($2)) + 
        sin(radians($1)) * sin(radians(c.latitude))
      ))
    ))
  `;

  const whereClause = conditions.join(' AND ');

  const sql = `
    WITH distance_calc AS (
      SELECT 
        c.id,
        c.tracking_id,
        c.citizen_id,
        c.title,
        c.description,
        c.category,
        c.subcategory,
        c.state,
        c.district,
        c.area,
        c.landmark,
        c.priority,
        c.status,
        c.supporter_count,
        c.created_at,
        ROUND(c.latitude::numeric, 2) AS approx_latitude,
        ROUND(c.longitude::numeric, 2) AS approx_longitude,
        ${haversineFormula} AS distance_km,
        d.name AS department_name
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE ${whereClause}
    )
    SELECT 
      dc.*,
      ${currentUserId ? `EXISTS (SELECT 1 FROM complaint_supporters cs WHERE cs.complaint_id = dc.id AND cs.citizen_id = ${parseInt(currentUserId, 10)}) AS has_joined` : 'FALSE AS has_joined'},
      ${currentUserId ? `(dc.citizen_id = ${parseInt(currentUserId, 10)}) AS is_own_complaint` : 'FALSE AS is_own_complaint'}
    FROM distance_calc dc
    WHERE dc.distance_km <= $3
    ORDER BY dc.distance_km ASC, dc.supporter_count DESC
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1};
  `;

  params.push(limit, offset);

  // Count query for pagination
  const countSql = `
    WITH distance_calc AS (
      SELECT 
        c.id,
        ${haversineFormula} AS distance_km
      FROM complaints c
      WHERE ${whereClause}
    )
    SELECT COUNT(*) AS total
    FROM distance_calc
    WHERE distance_km <= $3;
  `;

  const [resultsRes, countRes] = await Promise.all([
    query(sql, params),
    query(countSql, params.slice(0, paramIdx - 1))
  ]);

  const total = parseInt(countRes.rows[0].total, 10);
  const totalPages = Math.ceil(total / limit) || 1;

  // Enhance each result with formatted distance and similarity explanation
  const formattedResults = resultsRes.rows.map((row) => {
    const dist = parseFloat(row.distance_km);
    let distanceLabel = '';
    if (dist < 1) {
      distanceLabel = `${Math.round(dist * 1000)} m away`;
    } else {
      distanceLabel = `${dist.toFixed(1)} km away`;
    }

    let similarityExplanation = 'Active public grievance in your local vicinity.';
    if (category && row.category.toLowerCase() === category.toLowerCase()) {
      similarityExplanation = `Matching issue category (${row.category}) within your area.`;
    } else if (dist < 0.5) {
      similarityExplanation = 'Immediate neighborhood report (under 500m).';
    }

    return {
      id: row.id,
      trackingId: row.tracking_id,
      title: row.title,
      description: row.description,
      category: row.category,
      subcategory: row.subcategory,
      state: row.state,
      district: row.district,
      area: row.area,
      landmark: row.landmark,
      status: row.status,
      priority: row.priority,
      supporterCount: row.supporter_count || 0,
      departmentName: row.department_name,
      createdAt: row.created_at,
      distanceKm: Math.round(dist * 10) / 10,
      distanceLabel,
      similarityExplanation,
      hasJoined: Boolean(row.has_joined),
      isOwnComplaint: Boolean(row.is_own_complaint)
    };
  });

  return {
    results: formattedResults,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

export default {
  findNearbyComplaints
};

