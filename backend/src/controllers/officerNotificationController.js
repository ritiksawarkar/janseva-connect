import { getStore } from "../config/db.js";

export async function getOfficerNotifications(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const { type, is_read, limit = 20, page = 1 } = req.query;

    let list = (store.notifications || []).filter(
      (n) => n.recipient_id === officerId || (n.recipient_role === "DEPARTMENT_OFFICER" && !n.recipient_id)
    );

    if (type && type !== "ALL") {
      list = list.filter((n) => n.type === type);
    }

    if (is_read !== undefined && is_read !== "ALL") {
      const readBool = is_read === "true" || is_read === true;
      list = list.filter((n) => n.is_read === readBool);
    }

    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = list.length;
    const unreadCount = list.filter((n) => !n.is_read).length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIdx, startIdx + limitNum);

    return res.json({
      success: true,
      data: paginated,
      unread_count: unreadCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;

    const unreadCount = (store.notifications || []).filter(
      (n) =>
        (n.recipient_id === officerId || (n.recipient_role === "DEPARTMENT_OFFICER" && !n.recipient_id)) &&
        !n.is_read
    ).length;

    return res.json({ success: true, count: unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const notifId = parseInt(req.params.id, 10);

    const notif = (store.notifications || []).find((n) => n.id === notifId);
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    // Ownership check
    if (notif.recipient_id && notif.recipient_id !== officerId) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    notif.is_read = true;

    return res.json({
      success: true,
      message: "Notification marked as read.",
      data: notif
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;

    let updatedCount = 0;
    (store.notifications || []).forEach((n) => {
      if (
        (n.recipient_id === officerId || (n.recipient_role === "DEPARTMENT_OFFICER" && !n.recipient_id)) &&
        !n.is_read
      ) {
        n.is_read = true;
        updatedCount++;
      }
    });

    return res.json({
      success: true,
      message: `Marked ${updatedCount} notifications as read.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
