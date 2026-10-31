import { query } from "../config/db.js";

export async function saveContactMessage({ name, email, subject, message }) {
  const sql = `
    INSERT INTO contact_messages (name, email, subject, message, status, created_at)
    VALUES ($1, $2, $3, $4, 'NEW', NOW())
    RETURNING id, name, email, subject, status, created_at;
  `;
  const result = await query(sql, [name, email, subject, message]);
  return result.rows[0];
}
