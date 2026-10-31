import { getStore, isDbConnected, query } from "../config/db.js";

export async function logAdminAction({
  actor_id,
  actor_name,
  actor_role,
  action,
  entity_type,
  entity_id,
  old_values = {},
  new_values = {},
  ip_address = "127.0.0.1"
}) {
  const store = getStore();
  const timestamp = new Date().toISOString();

  const auditEntry = {
    id: store && store.audit_logs ? store.audit_logs.length + 1 : 1,
    actor_id,
    actor_name,
    actor_role,
    action,
    entity_type,
    entity_id: String(entity_id),
    old_values,
    new_values,
    ip_address,
    created_at: timestamp
  };

  if (store && store.audit_logs) {
    store.audit_logs.unshift(auditEntry);
  }

  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, entity_type, entity_id, old_values, new_values, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          actor_id,
          actor_name,
          actor_role,
          action,
          entity_type,
          String(entity_id),
          JSON.stringify(old_values),
          JSON.stringify(new_values),
          ip_address,
          timestamp
        ]
      );
    } catch (err) {
      console.warn("Failed to write audit log to PostgreSQL:", err.message);
    }
  }

  return auditEntry;
}

export function getAuditLogs(limit = 100) {
  const store = getStore();
  return store ? store.audit_logs.slice(0, limit) : [];
}
