import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";

export async function getNotifications(req, res) {
  const store = getStore();
  const { recipient_role, type, delivery_status, search = "" } = req.query;

  let notifications = [...store.notifications];

  if (recipient_role && recipient_role !== "ALL") {
    notifications = notifications.filter((n) => n.recipient_role === recipient_role);
  }
  if (type && type !== "ALL") {
    notifications = notifications.filter((n) => n.type === type);
  }
  if (delivery_status && delivery_status !== "ALL") {
    notifications = notifications.filter((n) => n.delivery_status === delivery_status);
  }

  const enriched = notifications.map((n) => {
    const user = store.users.find((u) => u.id === n.recipient_id);
    return {
      ...n,
      recipient_name: user ? user.full_name : "BroadCast / User",
      recipient_email: user ? user.email : ""
    };
  });

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    return res.json({
      success: true,
      data: enriched.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q) ||
          n.recipient_name.toLowerCase().includes(q)
      )
    });
  }

  return res.json({
    success: true,
    data: enriched
  });
}

export async function getNotificationById(req, res) {
  const store = getStore();
  const notifId = parseInt(req.params.id, 10);
  const notif = store.notifications.find((n) => n.id === notifId);

  if (!notif) {
    return res.status(404).json({
      success: false,
      message: "Notification not found."
    });
  }

  const user = store.users.find((u) => u.id === notif.recipient_id);

  return res.json({
    success: true,
    data: {
      ...notif,
      recipient: user
        ? {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
          }
        : null
    }
  });
}

export async function createPlatformAnnouncement(req, res) {
  const store = getStore();
  const { title, message, target_role = "ALL", delivery_channel = "IN_APP" } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: "Title and announcement message are required."
    });
  }

  let recipients = store.users.filter((u) => u.status === "ACTIVE");
  if (target_role !== "ALL") {
    recipients = recipients.filter((u) => u.role === target_role);
  }

  const createdNotifications = [];
  for (const recipient of recipients) {
    const notif = await createNotification({
      recipient_id: recipient.id,
      recipient_role: recipient.role,
      title: `[Announcement] ${title.trim()}`,
      message: message.trim(),
      type: "Platform Announcement",
      delivery_channel,
      delivery_status: delivery_channel.includes("SIMULATED") ? "SIMULATED" : "DELIVERED",
      metadata: { announcement_by: req.user.full_name, target_role }
    });
    createdNotifications.push(notif);
  }

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "PLATFORM_ANNOUNCEMENT_BROADCAST",
    entity_type: "NOTIFICATION",
    entity_id: "BROADCAST",
    new_values: { title, target_role, recipients_count: recipients.length }
  });

  return res.status(201).json({
    success: true,
    message: `Announcement broadcast to ${recipients.length} users successfully.`,
    data: {
      sentCount: recipients.length,
      sampleNotification: createdNotifications[0]
    }
  });
}

export async function retryNotification(req, res) {
  const store = getStore();
  const notifId = parseInt(req.params.id, 10);
  const notif = store.notifications.find((n) => n.id === notifId);

  if (!notif) {
    return res.status(404).json({
      success: false,
      message: "Notification not found."
    });
  }

  notif.delivery_status = notif.delivery_channel.includes("SIMULATED") ? "SIMULATED" : "DELIVERED";
  notif.created_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "NOTIFICATION_RETRIED",
    entity_type: "NOTIFICATION",
    entity_id: notifId,
    new_values: { delivery_status: notif.delivery_status }
  });

  return res.json({
    success: true,
    message: "Notification re-dispatched successfully.",
    data: notif
  });
}
