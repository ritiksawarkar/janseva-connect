import React, { useState, useEffect } from "react";
import { officersApi, departmentsApi } from "../../services/api";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import { SearchInput, FilterDropdown, ErrorState, LoadingSkeleton } from "../../components/admin/UIControls";
import { FormModal, ConfirmationModal } from "../../components/admin/Modals";
import {
  ShieldCheck,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Eye
} from "lucide-react";

export function OfficerManagement() {
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add/Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    employee_id: "",
    department_id: "",
    designation: "",
    temporary_password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetOfficer, setTargetOfficer] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [deptFilter, statusFilter]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [offRes, deptRes] = await Promise.all([
        officersApi.getOfficers({
          search,
          department_id: deptFilter,
          status: statusFilter
        }),
        departmentsApi.getDepartments({ status: "ACTIVE" })
      ]);

      if (offRes.success) setOfficers(offRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      setError(err.message || "Failed to load officers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInitialData();
  };

  const openAddModal = () => {
    setEditingOfficer(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      employee_id: "",
      department_id: departments.length > 0 ? String(departments[0].id) : "",
      designation: "",
      temporary_password: "Officer@123"
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (officer) => {
    setEditingOfficer(officer);
    setFormData({
      full_name: officer.full_name,
      email: officer.email,
      phone: officer.phone || "",
      employee_id: officer.employee_id,
      department_id: String(officer.department_id || ""),
      designation: officer.designation || "",
      temporary_password: ""
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingOfficer) {
        await officersApi.update(editingOfficer.id, {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          department_id: parseInt(formData.department_id, 10),
          designation: formData.designation.trim()
        });
      } else {
        await officersApi.create({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          employee_id: formData.employee_id.trim().toUpperCase(),
          department_id: parseInt(formData.department_id, 10),
          designation: formData.designation.trim(),
          temporary_password: formData.temporary_password || "Officer@123"
        });
      }

      setIsFormModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert("Error saving officer: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!targetOfficer) return;
    setIsSubmitting(true);
    try {
      const nextStatus = targetOfficer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await officersApi.updateStatus(targetOfficer.id, { status: nextStatus });
      setIsStatusModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert("Status change failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Employee ID",
      accessor: "employee_id",
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
          {row.employee_id}
        </span>
      )
    },
    {
      header: "Officer Name",
      accessor: "full_name",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.full_name}</p>
          <p className="text-[11px] text-slate-500">{row.designation}</p>
        </div>
      )
    },
    {
      header: "Department",
      accessor: "department_name",
      render: (row) => (
        <span className="font-semibold text-slate-800">{row.department_name}</span>
      )
    },
    {
      header: "Contact",
      accessor: "email",
      render: (row) => (
        <div className="text-slate-600 text-[11px]">
          <div>{row.email}</div>
          <div>{row.phone || "No mobile"}</div>
        </div>
      )
    },
    {
      header: "Workload",
      accessor: "assigned_count",
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900">{row.assigned_count || 0} assigned</span>
          <span className="text-emerald-600 ml-1">({row.completed_count || 0} closed)</span>
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => openEditModal(row)}
            title="Edit Officer"
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setTargetOfficer(row);
              setIsStatusModalOpen(true);
            }}
            title={row.status === "ACTIVE" ? "Deactivate Account" : "Activate Account"}
            className={`p-1.5 rounded-lg transition ${
              row.status === "ACTIVE"
                ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {row.status === "ACTIVE" ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
            Department Officer Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and maintain department officer accounts with role DEPARTMENT_OFFICER for grievance handling.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Register Officer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, employee ID, or designation..."
            onClear={() => {
              setSearch("");
              fetchInitialData();
            }}
          />
        </form>

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
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "All Statuses", value: "ALL" },
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" }
          ]}
        />
      </div>

      {error && <ErrorState message={error} onRetry={fetchInitialData} />}

      <DataTable
        columns={columns}
        data={officers}
        isLoading={isLoading}
        emptyTitle="No officers found"
        emptyDescription="Register department officers using the button above."
      />

      {/* Add / Edit Officer Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingOfficer ? "Edit Officer Profile" : "Register Department Officer"}
        subtitle="Officer accounts are assigned role DEPARTMENT_OFFICER and authenticated via JWT."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Rajesh Kumar"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employee Identification ID *
              </label>
              <input
                type="text"
                required
                disabled={!!editingOfficer}
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="e.g. EMP-SWM-105"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:bg-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                disabled={!!editingOfficer}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="officer.name@janseva.gov.in"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Department *
              </label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Designation / Title *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Junior Civil Engineer"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          {!editingOfficer && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Temporary Password
              </label>
              <input
                type="text"
                value={formData.temporary_password}
                onChange={(e) => setFormData({ ...formData, temporary_password: e.target.value })}
                placeholder="Default: Officer@123"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Securely hashed with bcryptjs upon creation. Never stored in plaintext.
              </p>
            </div>
          )}

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
              {isSubmitting ? "Saving..." : editingOfficer ? "Save Changes" : "Create Officer Account"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Deactivate/Activate Confirmation */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleStatusChange}
        title={`${targetOfficer?.status === "ACTIVE" ? "Deactivate" : "Activate"} Officer Account`}
        message={`Are you sure you want to change account status for ${targetOfficer?.full_name} (${targetOfficer?.employee_id})? Inactive officers cannot receive new grievance assignments.`}
        confirmText={targetOfficer?.status === "ACTIVE" ? "Deactivate" : "Activate"}
        confirmVariant={targetOfficer?.status === "ACTIVE" ? "danger" : "success"}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default OfficerManagement;
