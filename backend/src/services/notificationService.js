import { getStore, isDbConnected, query } from "../config/db.js";

export async function createNotification({
  recipient_id,
  recipient_role,
  title,
  message,
  type,
  delivery_channel = "IN_APP",
  delivery_status = "DELIVERED",
  metadata = {}
}) {
  const store = getStore();
  const timestamp = new Date().toISOString();

  const notification = {
    id: store && store.notifications ? store.notifications.length + 1 : 1,
    recipient_id,
    recipient_role,
    title,
    message,
    type,
    delivery_channel,
    delivery_status,
    is_read: false,
    metadata,
    created_at: timestamp
  };

  if (store && store.notifications) {
    store.notifications.unshift(notification);
  }

  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO notifications (recipient_id, recipient_role, title, message, type, delivery_channel, delivery_status, is_read, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          recipient_id,
          recipient_role,
          title,
          message,
          type,
          delivery_channel,
          delivery_status,
          false,
          JSON.stringify(metadata),
          timestamp
        ]
      );
    } catch (err) {
      console.warn("Failed to persist notification to DB:", err.message);
    }
  }

  return notification;
}
