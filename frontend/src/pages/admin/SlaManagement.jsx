import React, { useState, useEffect } from "react";
import { slaApi, departmentsApi } from "../../services/api";
import DataTable from "../../components/admin/DataTable";
import StatusBadge, { PriorityBadge } from "../../components/admin/StatusBadge";
import { FilterDropdown, ErrorState, LoadingSkeleton } from "../../components/admin/UIControls";
import { FormModal, ConfirmationModal } from "../../components/admin/Modals";
import {
  Clock,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar
} from "lucide-react";

export function SlaManagement() {
  const [rules, setRules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    department_id: "",
    category: "All",
    priority: "HIGH",
    duration_value: "24",
    duration_unit: "HOURS",
    escalation_threshold: "80"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetRule, setTargetRule] = useState(null);

  useEffect(() => {
    fetchInitial();
  }, [deptFilter, priorityFilter]);

  const fetchInitial = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rulesRes, deptRes] = await Promise.all([
        slaApi.getRules({
          department_id: deptFilter,
          priority: priorityFilter
        }),
        departmentsApi.getDepartments({ status: "ACTIVE" })
      ]);

      if (rulesRes.success) setRules(rulesRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      setError(err.message || "Failed to load SLA rules.");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRule(null);
    setFormData({
      name: "",
      department_id: "",
      category: "All",
      priority: "HIGH",
      duration_value: "24",
      duration_unit: "HOURS",
      escalation_threshold: "80"
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      department_id: rule.department_id ? String(rule.department_id) : "",
      category: rule.category || "All",
      priority: rule.priority,
      duration_value: String(rule.duration_value),
      duration_unit: rule.duration_unit,
      escalation_threshold: String(rule.escalation_threshold || 80)
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.duration_value) {
      alert("Rule name and duration are required.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
      category: formData.category.trim(),
      priority: formData.priority,
      duration_value: parseInt(formData.duration_value, 10),
      duration_unit: formData.duration_unit,
      escalation_threshold: parseInt(formData.escalation_threshold, 10)
    };

    setIsSubmitting(true);
    try {
      if (editingRule) {
        await slaApi.updateRule(editingRule.id, payload);
      } else {
        await slaApi.createRule(payload);
      }
      setIsFormModalOpen(false);
      fetchInitial();
    } catch (err) {
      alert("Error saving SLA rule: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!targetRule) return;
    setIsSubmitting(true);
    try {
      await slaApi.updateStatus(targetRule.id, { is_active: !targetRule.is_active });
      setIsStatusModalOpen(false);
      fetchInitial();
    } catch (err) {
      alert("Status change failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Rule Name",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-[11px] text-slate-500">
            Applies to: {row.category} ({row.department_name})
          </p>
        </div>
      )
    },
    {
      header: "Priority Level",
      accessor: "priority",
      render: (row) => <PriorityBadge priority={row.priority} />
    },
    {
      header: "Resolution Target",
      accessor: "duration_value",
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.duration_value} {row.duration_unit.toLowerCase()}
        </span>
      )
    },
    {
      header: "Escalation Trigger",
      accessor: "escalation_threshold",
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-800 font-bold border border-amber-200">
          At {row.escalation_threshold}% elapsed
        </span>
      )
    },
    {
      header: "Status",
      accessor: "is_active",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.is_active
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {row.is_active ? "Active Rule" : "Inactive"}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => openEditModal(row)}
            title="Edit Rule"
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setTargetRule(row);
              setIsStatusModalOpen(true);
            }}
            title={row.is_active ? "Deactivate Rule" : "Activate Rule"}
            className={`p-1.5 rounded-lg transition ${
              row.is_active
                ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {row.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Service Level Agreement (SLA) Rules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure target resolution timelines by priority and department. Deadlines start upon verification or assignment.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create SLA Rule
        </button>
      </div>

      {/* Demo Benchmark Info Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-bold text-blue-900">Standard Demonstration SLA Benchmarks:</p>
          <p className="text-slate-600 mt-0.5">
            Emergency: 12-24h • High Priority: 24h • Medium: 3 days (72h) • Low: 7 days (168h)
          </p>
        </div>
        <span className="text-[11px] text-blue-700 bg-white px-2.5 py-1 rounded-md border border-blue-200 font-semibold shrink-0">
          Calculated in UTC • Displayed in IST
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <FilterDropdown
          label="Department"
          value={deptFilter}
          onChange={setDeptFilter}
          options={[
            { label: "All Departments", value: "ALL" },
            ...departments.map((d) => ({ label: d.name, value: String(d.id) }))
          ]}
        />

        <FilterDropdown
          label="Priority"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { label: "All Priorities", value: "ALL" },
            { label: "Emergency", value: "EMERGENCY" },
            { label: "High", value: "HIGH" },
            { label: "Medium", value: "MEDIUM" },
            { label: "Low", value: "LOW" }
          ]}
        />
      </div>

      {error && <ErrorState message={error} onRetry={fetchInitial} />}

      <DataTable
        columns={columns}
        data={rules}
        isLoading={isLoading}
        emptyTitle="No SLA rules found"
        emptyDescription="Create an SLA rule using the button above."
      />

      {/* Add / Edit SLA Rule Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingRule ? "Edit SLA Policy Rule" : "Configure New SLA Rule"}
        subtitle="Establish automated turnaround timelines for citizen complaints."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rule Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. High Priority Sanitation Resolution Timeline"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department Scope
              </label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="">All Departments (Global)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Civic Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Garbage or All"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="EMERGENCY">EMERGENCY</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Resolution Duration *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.duration_value}
                onChange={(e) => setFormData({ ...formData, duration_value: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Duration Unit *
              </label>
              <select
                value={formData.duration_unit}
                onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="HOURS">Hours</option>
                <option value="DAYS">Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Escalation Warning Trigger (% of duration elapsed)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={formData.escalation_threshold}
              onChange={(e) => setFormData({ ...formData, escalation_threshold: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              When a complaint crosses this percentage of the deadline, an automated warning is logged.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              {isSubmitting ? "Saving..." : editingRule ? "Update SLA Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Status Toggle Modal */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleStatusToggle}
        title={`${targetRule?.is_active ? "Deactivate" : "Activate"} SLA Rule`}
        message={`Are you sure you want to change status for rule "${targetRule?.name}"? Historical complaints will preserve their original deadline snapshots.`}
        confirmText={targetRule?.is_active ? "Deactivate" : "Activate"}
        confirmVariant={targetRule?.is_active ? "danger" : "success"}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default SlaManagement;
