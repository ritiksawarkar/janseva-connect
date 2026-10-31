import React, { useState, useEffect } from "react";
import { departmentsApi } from "../../services/api";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import { SearchInput, FilterDropdown, ErrorState, LoadingSkeleton } from "../../components/admin/UIControls";
import { FormModal, ConfirmationModal } from "../../components/admin/Modals";
import {
  Building2,
  Plus,
  Edit2,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

export function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add / Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    responsible_categories: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatusDept, setTargetStatusDept] = useState(null);

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [departmentDetails, setDepartmentDetails] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, [statusFilter]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await departmentsApi.getDepartments({
        search,
        status: statusFilter
      });
      if (res.success) {
        setDepartments(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load departments.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDepartments();
  };

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      responsible_categories: ""
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
      email: dept.email || "",
      phone: dept.phone || "",
      address: dept.address || "",
      responsible_categories: Array.isArray(dept.responsible_categories)
        ? dept.responsible_categories.join(", ")
        : ""
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("Name and Department Code are required.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      responsible_categories: formData.responsible_categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    };

    setIsSubmitting(true);
    try {
      if (editingDept) {
        await departmentsApi.update(editingDept.id, payload);
      } else {
        await departmentsApi.create(payload);
      }
      setIsFormModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert("Operation failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!targetStatusDept) return;
    setIsSubmitting(true);
    try {
      const nextStatus = targetStatusDept.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await departmentsApi.updateStatus(targetStatusDept.id, { status: nextStatus });
      setIsStatusModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert("Status update failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetails = async (deptId) => {
    try {
      const res = await departmentsApi.getDepartmentById(deptId);
      if (res.success) {
        setDepartmentDetails(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      alert("Error loading details: " + err.message);
    }
  };

  const columns = [
    {
      header: "Code",
      accessor: "code",
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
          {row.code}
        </span>
      )
    },
    {
      header: "Department Name",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-[11px] text-slate-500 truncate max-w-xs">{row.description}</p>
        </div>
      )
    },
    {
      header: "Contact",
      accessor: "email",
      render: (row) => (
        <div className="text-slate-600 text-[11px]">
          <div>{row.email || "No email"}</div>
          <div>{row.phone || "No phone"}</div>
        </div>
      )
    },
    {
      header: "Officers",
      accessor: "officers_count",
      render: (row) => (
        <span className="inline-flex items-center text-xs font-semibold text-slate-700">
          <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
          {row.officers_count || 0} active
        </span>
      )
    },
    {
      header: "Workload",
      accessor: "complaints_count",
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900">{row.complaints_count || 0} total</span>
          <span className="text-amber-600 ml-1">({row.pending_count || 0} pending)</span>
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
            onClick={() => openDetails(row.id)}
            title="Inspect Details & Officers"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => openEditModal(row)}
            title="Edit Department"
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setTargetStatusDept(row);
              setIsStatusModalOpen(true);
            }}
            title={row.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
            Government Department Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure municipal departments, codes, responsible complaint categories, and operational status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Department
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by department name, code, or description..."
            onClear={() => {
              setSearch("");
              fetchDepartments();
            }}
          />
        </form>

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

      {error && <ErrorState message={error} onRetry={fetchDepartments} />}

      {/* Table */}
      <DataTable
        columns={columns}
        data={departments}
        isLoading={isLoading}
        emptyTitle="No departments found"
        emptyDescription="Create a department using the 'Add Department' button above."
      />

      {/* Add / Edit Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingDept ? "Edit Department" : "Register Government Department"}
        subtitle="Configure department metadata, contact points, and handled civic categories."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Public Works Department"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unique Department Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. PWD-02"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description & Civic Scope
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Primary responsibilities and jurisdictional boundaries..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="pwd@janseva.gov.in"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Phone / Helpline
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 022 24567802"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Office / Headquarter Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Civic Complex, Floor 2, Sector 12"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Responsible Categories (Comma Separated)
            </label>
            <input
              type="text"
              value={formData.responsible_categories}
              onChange={(e) => setFormData({ ...formData, responsible_categories: e.target.value })}
              placeholder="e.g. Potholes, Road Damage, Footpath, Bridge Maintenance"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
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
              {isSubmitting ? "Saving..." : editingDept ? "Save Changes" : "Create Department"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Deactivate/Activate Confirmation */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleStatusChange}
        title={`${targetStatusDept?.status === "ACTIVE" ? "Deactivate" : "Activate"} Department`}
        message={`Are you sure you want to mark ${targetStatusDept?.name} as ${targetStatusDept?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}? Inactive departments cannot receive new complaint assignments, but historical data is preserved.`}
        confirmText={targetStatusDept?.status === "ACTIVE" ? "Deactivate" : "Activate"}
        confirmVariant={targetStatusDept?.status === "ACTIVE" ? "danger" : "success"}
        isLoading={isSubmitting}
      />

      {/* Department Detail Modal with Officers */}
      <FormModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={departmentDetails?.name || "Department Details"}
        subtitle={`Code: ${departmentDetails?.code} • Status: ${departmentDetails?.status}`}
      >
        {departmentDetails && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {departmentDetails.description || "No description provided."}
            </p>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Email:</span> {departmentDetails.email || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Phone:</span> {departmentDetails.phone || "N/A"}
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-slate-800">Address:</span> {departmentDetails.address || "N/A"}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-1 text-blue-600" />
                Active Department Officers ({departmentDetails.officers?.length || 0})
              </h4>
              {departmentDetails.officers?.length === 0 ? (
                <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-lg">
                  No officers assigned to this department yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {departmentDetails.officers?.map((o) => (
                    <div key={o.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{o.full_name}</p>
                        <p className="text-[11px] text-slate-500">{o.designation} • {o.employee_id}</p>
                      </div>
                      <span className="text-[11px] text-slate-500">{o.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}

export default DepartmentManagement;
