import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";

export async function getSlaRules(req, res) {
  const store = getStore();
  const { department_id, priority, is_active } = req.query;

  let rules = [...store.sla_rules];

  if (department_id && department_id !== "ALL") {
    rules = rules.filter((r) => r.department_id === parseInt(department_id, 10));
  }
  if (priority && priority !== "ALL") {
    rules = rules.filter((r) => r.priority === priority);
  }
  if (is_active !== undefined) {
    const activeBool = is_active === "true" || is_active === true;
    rules = rules.filter((r) => r.is_active === activeBool);
  }

  const enriched = rules.map((r) => {
    const dept = store.departments.find((d) => d.id === r.department_id);
    return {
      ...r,
      department_name: dept ? dept.name : "All Departments"
    };
  });

  return res.json({
    success: true,
    data: enriched
  });
}

export async function createSlaRule(req, res) {
  const store = getStore();
  const { name, department_id, category, priority, duration_value, duration_unit = "HOURS", escalation_threshold = 80 } = req.body;

  if (!name || !category || !priority || !duration_value) {
    return res.status(400).json({
      success: false,
      message: "Rule name, category, priority, and duration value are required."
    });
  }

  const newRule = {
    id: store.sla_rules.length + 1,
    name: name.trim(),
    department_id: department_id ? parseInt(department_id, 10) : null,
    category: category.trim(),
    priority,
    duration_value: parseInt(duration_value, 10),
    duration_unit: duration_unit.toUpperCase(),
    escalation_threshold: parseInt(escalation_threshold, 10),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  store.sla_rules.push(newRule);

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "SLA_RULE_CREATED",
    entity_type: "SLA_RULE",
    entity_id: newRule.id,
    new_values: newRule
  });

  return res.status(201).json({
    success: true,
    message: "SLA rule created successfully.",
    data: newRule
  });
}

export async function updateSlaRule(req, res) {
  const store = getStore();
  const ruleId = parseInt(req.params.id, 10);
  const rule = store.sla_rules.find((r) => r.id === ruleId);

  if (!rule) {
    return res.status(404).json({
      success: false,
      message: "SLA rule not found."
    });
  }

  const oldValues = { ...rule };
  const { name, department_id, category, priority, duration_value, duration_unit, escalation_threshold, is_active } = req.body;

  if (name) rule.name = name.trim();
  if (department_id !== undefined) rule.department_id = department_id ? parseInt(department_id, 10) : null;
  if (category) rule.category = category.trim();
  if (priority) rule.priority = priority;
  if (duration_value !== undefined) rule.duration_value = parseInt(duration_value, 10);
  if (duration_unit) rule.duration_unit = duration_unit.toUpperCase();
  if (escalation_threshold !== undefined) rule.escalation_threshold = parseInt(escalation_threshold, 10);
  if (is_active !== undefined) rule.is_active = !!is_active;

  rule.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "SLA_RULE_UPDATED",
    entity_type: "SLA_RULE",
    entity_id: ruleId,
    old_values: oldValues,
    new_values: rule
  });

  return res.json({
    success: true,
    message: "SLA rule updated successfully.",
    data: rule
  });
}

export async function updateSlaRuleStatus(req, res) {
  const store = getStore();
  const ruleId = parseInt(req.params.id, 10);
  const rule = store.sla_rules.find((r) => r.id === ruleId);

  if (!rule) {
    return res.status(404).json({
      success: false,
      message: "SLA rule not found."
    });
  }

  const { is_active } = req.body;
  rule.is_active = !!is_active;
  rule.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: rule.is_active ? "SLA_RULE_ACTIVATED" : "SLA_RULE_DEACTIVATED",
    entity_type: "SLA_RULE",
    entity_id: ruleId,
    new_values: { is_active: rule.is_active }
  });

  return res.json({
    success: true,
    message: `SLA rule is now ${rule.is_active ? "active" : "inactive"}.`,
    data: rule
  });
}
