import { query } from "../config/db.js";

export async function getPlatformStats(req, res) {
  try {
    const servicesCountSql = `
      SELECT 
        COUNT(id) as total,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified
      FROM services
      WHERE status = 'ACTIVE';
    `;
    const schemesCountSql = `
      SELECT 
        COUNT(id) as total,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified
      FROM schemes
      WHERE status = 'ACTIVE';
    `;
    const deptsCountSql = `
      SELECT COUNT(id) as total
      FROM departments;
    `;
    const categoriesCountSql = `
      SELECT COUNT(DISTINCT category) as total
      FROM (
        SELECT category FROM services WHERE status = 'ACTIVE'
        UNION
        SELECT category FROM schemes WHERE status = 'ACTIVE'
      ) as combined_cats;
    `;

    const [servicesRes, schemesRes, deptsRes, catsRes] = await Promise.all([
      query(servicesCountSql),
      query(schemesCountSql),
      query(deptsCountSql),
      query(categoriesCountSql),
    ]);

    res.json({
      success: true,
      stats: {
        totalServices: parseInt(servicesRes.rows[0]?.total || "0", 10),
        verifiedServices: parseInt(servicesRes.rows[0]?.verified || "0", 10),
        totalSchemes: parseInt(schemesRes.rows[0]?.total || "0", 10),
        verifiedSchemes: parseInt(schemesRes.rows[0]?.verified || "0", 10),
        totalDepartments: parseInt(deptsRes.rows[0]?.total || "0", 10),
        totalCategories: parseInt(catsRes.rows[0]?.total || "0", 10),
      },
    });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving platform stats.",
    });
  }
}
