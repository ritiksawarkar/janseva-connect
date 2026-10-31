import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { servicesApi, departmentsApi } from "../../services/api";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import { SearchInput, FilterDropdown, ErrorState } from "../../components/admin/UIControls";
import { FormModal, ConfirmationModal } from "../../components/admin/Modals";
import {
  Compass,
  Plus,
  Edit2,
  Eye,
  CheckCircle,
  Globe,
  Layers,
  History,
  ExternalLink
} from "lucide-react";

export function ServiceManagement() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [pubFilter, setPubFilter] = useState("ALL");
  const [verFilter, setVerFilter] = useState("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Version History Modal
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedServiceVersions, setSelectedServiceVersions] = useState([]);
  const [currentServiceName, setCurrentServiceName] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, [categoryFilter, deptFilter, pubFilter, verFilter]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [svcRes, deptRes] = await Promise.all([
        servicesApi.getServices({
          search,
          category: categoryFilter,
          department_id: deptFilter,
          publication_status: pubFilter,
          verification_status: verFilter
        }),
        departmentsApi.getDepartments({ status: "ACTIVE" })
      ]);

      if (svcRes.success) setServices(svcRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      setError(err.message || "Failed to load public services.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInitialData();
  };

  const handlePublishToggle = async (service) => {
    const nextStatus = service.publication_status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    try {
      await servicesApi.publish(service.id, { publication_status: nextStatus });
      fetchInitialData();
    } catch (err) {
      alert("Status change failed: " + err.message);
    }
  };

  const handleVerify = async (service) => {
    try {
      await servicesApi.verify(service.id, { verification_status: "VERIFIED" });
      fetchInitialData();
    } catch (err) {
      alert("Verification failed: " + err.message);
    }
  };

  const viewVersions = async (service) => {
    try {
      const res = await servicesApi.getVersions(service.id);
      if (res.success) {
        setSelectedServiceVersions(res.data);
        setCurrentServiceName(service.service_name);
        setIsVersionModalOpen(true);
      }
    } catch (err) {
      alert("Error fetching versions: " + err.message);
    }
  };

  const columns = [
    {
      header: "Service Name",
      accessor: "service_name",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.service_name}</p>
          <p className="text-[11px] text-slate-500 truncate max-w-xs">{row.description}</p>
        </div>
      )
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
          {row.category}
        </span>
      )
    },
    {
      header: "Department",
      accessor: "department_name",
      render: (row) => (
        <span className="font-medium text-slate-800">{row.department_name}</span>
      )
    },
    {
      header: "Fees",
      accessor: "fees",
      render: (row) => (
        <span className="text-slate-600 font-mono text-[11px]">{row.fees || "Free"}</span>
      )
    },
    {
      header: "Verification",
      accessor: "verification_status",
      render: (row) => <StatusBadge status={row.verification_status} />
    },
    {
      header: "Publication",
      accessor: "publication_status",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.publication_status === "PUBLISHED"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {row.publication_status}
        </span>
      )
    },
    {
      header: "Ver.",
      accessor: "current_version",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-600">v{row.current_version || 1}</span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => viewVersions(row)}
            title="Version History"
            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate(`/admin/services/${row.id}/edit`)}
            title="Edit Service"
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {row.verification_status !== "VERIFIED" && (
            <button
              onClick={() => handleVerify(row)}
              title="Verify Service Info"
              className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handlePublishToggle(row)}
            title={row.publication_status === "PUBLISHED" ? "Unpublish Service" : "Publish to Portal"}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
              row.publication_status === "PUBLISHED"
                ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {row.publication_status === "PUBLISHED" ? "Unpublish" : "Publish"}
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
            Public Services Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage public services directory, eligibility requirements, application steps, and versioned publications.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/services/new")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Public Service
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search services by title, category, or description..."
            onClear={() => {
              setSearch("");
              fetchInitialData();
            }}
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
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
            label="Publication"
            value={pubFilter}
            onChange={setPubFilter}
            options={[
              { label: "All", value: "ALL" },
              { label: "Published", value: "PUBLISHED" },
              { label: "Draft / Unpublished", value: "DRAFT" }
            ]}
          />

          <FilterDropdown
            label="Verification"
            value={verFilter}
            onChange={setVerFilter}
            options={[
              { label: "All", value: "ALL" },
              { label: "Verified", value: "VERIFIED" },
              { label: "Pending", value: "PENDING" }
            ]}
          />
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchInitialData} />}

      <DataTable
        columns={columns}
        data={services}
        isLoading={isLoading}
        emptyTitle="No public services found"
        emptyDescription="Add new public services using the button above."
      />

      {/* Version History Modal */}
      <FormModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        title="Service Version Archives"
        subtitle={`Audit records for "${currentServiceName}"`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3 text-xs">
          {selectedServiceVersions.length === 0 ? (
            <p className="text-slate-400 py-4 text-center">No previous version history archived.</p>
          ) : (
            selectedServiceVersions.map((v) => (
              <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">Version {v.version_number}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(v.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{v.change_summary || "Routine update"}</p>
                {v.source_url && (
                  <p className="text-blue-600 text-[11px] truncate flex items-center">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Source: {v.source_url}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </FormModal>
    </div>
  );
}

export default ServiceManagement;
