import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";

export async function getSettings(req, res) {
  const store = getStore();

  const settingsMap = {};
  store.platform_settings.forEach((s) => {
    settingsMap[s.setting_key] = s.setting_value;
  });

  return res.json({
    success: true,
    data: settingsMap
  });
}

export async function updateSettings(req, res) {
  const store = getStore();
  const { setting_key, setting_value, category = "GENERAL" } = req.body;

  if (!setting_key || setting_value === undefined) {
    return res.status(400).json({
      success: false,
      message: "setting_key and setting_value are required."
    });
  }

  // Prevent modifying sensitive security internals
  if (setting_key.toLowerCase().includes("secret") || setting_key.toLowerCase().includes("jwt")) {
    return res.status(403).json({
      success: false,
      message: "Security credentials cannot be modified via platform settings API."
    });
  }

  let setting = store.platform_settings.find((s) => s.setting_key === setting_key);
  const oldVal = setting ? setting.setting_value : null;

  if (setting) {
    setting.setting_value = { ...setting.setting_value, ...setting_value };
    setting.updated_by = req.user.id;
    setting.updated_at = new Date().toISOString();
  } else {
    setting = {
      id: store.platform_settings.length + 1,
      setting_key,
      category,
      setting_value,
      updated_by: req.user.id,
      updated_at: new Date().toISOString()
    };
    store.platform_settings.push(setting);
  }

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "PLATFORM_SETTINGS_UPDATED",
    entity_type: "SETTINGS",
    entity_id: setting_key,
    old_values: oldVal,
    new_values: setting.setting_value
  });

  return res.json({
    success: true,
    message: "Settings updated successfully.",
    data: setting
  });
}

export async function getAuditLogsEndpoint(req, res) {
  const store = getStore();
  const { action, entity_type, limit = 100 } = req.query;

  let logs = [...store.audit_logs];

  if (action && action !== "ALL") {
    logs = logs.filter((l) => l.action.includes(action));
  }
  if (entity_type && entity_type !== "ALL") {
    logs = logs.filter((l) => l.entity_type === entity_type);
  }

  return res.json({
    success: true,
    data: logs.slice(0, parseInt(limit, 10))
  });
}
