import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { schemesApi } from "../../services/api";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import { SearchInput, FilterDropdown, ErrorState } from "../../components/admin/UIControls";
import { FormModal } from "../../components/admin/Modals";
import {
  Award,
  Plus,
  Edit2,
  CheckCircle,
  History,
  ExternalLink,
  SlidersHorizontal
} from "lucide-react";

export function SchemeManagement() {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [pubFilter, setPubFilter] = useState("ALL");
  const [verFilter, setVerFilter] = useState("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Version History Modal
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedSchemeVersions, setSelectedSchemeVersions] = useState([]);
  const [currentSchemeName, setCurrentSchemeName] = useState("");

  useEffect(() => {
    fetchSchemes();
  }, [levelFilter, pubFilter, verFilter]);

  const fetchSchemes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await schemesApi.getSchemes({
        search,
        scheme_level: levelFilter,
        publication_status: pubFilter,
        verification_status: verFilter
      });
      if (res.success) setSchemes(res.data);
    } catch (err) {
      setError(err.message || "Failed to load government schemes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  const handlePublishToggle = async (scheme) => {
    const nextStatus = scheme.publication_status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    try {
      await schemesApi.publish(scheme.id, { publication_status: nextStatus });
      fetchSchemes();
    } catch (err) {
      alert("Status change failed: " + err.message);
    }
  };

  const handleVerify = async (scheme) => {
    try {
      await schemesApi.verify(scheme.id, { verification_status: "VERIFIED" });
      fetchSchemes();
    } catch (err) {
      alert("Verification failed: " + err.message);
    }
  };

  const viewVersions = async (scheme) => {
    try {
      const res = await schemesApi.getVersions(scheme.id);
      if (res.success) {
        setSelectedSchemeVersions(res.data);
        setCurrentSchemeName(scheme.scheme_name);
        setIsVersionModalOpen(true);
      }
    } catch (err) {
      alert("Error fetching versions: " + err.message);
    }
  };

  const columns = [
    {
      header: "Scheme Name",
      accessor: "scheme_name",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.scheme_name}</p>
          <p className="text-[11px] text-slate-500 truncate max-w-xs">{row.description}</p>
        </div>
      )
    },
    {
      header: "Level / Scope",
      accessor: "scheme_level",
      render: (row) => (
        <div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
              row.scheme_level === "CENTRAL"
                ? "bg-purple-100 text-purple-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {row.scheme_level}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">{row.state || "All India"}</p>
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
      header: "Target Group",
      accessor: "beneficiary_group",
      render: (row) => (
        <span className="text-slate-600 text-xs truncate max-w-[160px] block">
          {row.beneficiary_group || "General Public"}
        </span>
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
            title="Version Archives"
            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate(`/admin/schemes/${row.id}/edit`)}
            title="Edit Scheme & Eligibility Rules"
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {row.verification_status !== "VERIFIED" && (
            <button
              onClick={() => handleVerify(row)}
              title="Verify Scheme Data"
              className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handlePublishToggle(row)}
            title={row.publication_status === "PUBLISHED" ? "Unpublish Scheme" : "Publish to Portal"}
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
            Government Scheme Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer central and state welfare schemes, configure structured citizen eligibility criteria, and archive updates.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/schemes/new")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Welfare Scheme
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search schemes by name, beneficiary group, or keywords..."
            onClear={() => {
              setSearch("");
              fetchSchemes();
            }}
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <FilterDropdown
            label="Scheme Level"
            value={levelFilter}
            onChange={setLevelFilter}
            options={[
              { label: "All Levels", value: "ALL" },
              { label: "Central", value: "CENTRAL" },
              { label: "State", value: "STATE" }
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

      {error && <ErrorState message={error} onRetry={fetchSchemes} />}

      <DataTable
        columns={columns}
        data={schemes}
        isLoading={isLoading}
        emptyTitle="No schemes found"
        emptyDescription="Add welfare schemes using the button above."
      />

      {/* Version History Modal */}
      <FormModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        title="Scheme Version Archives"
        subtitle={`Audit archives for "${currentSchemeName}"`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3 text-xs">
          {selectedSchemeVersions.length === 0 ? (
            <p className="text-slate-400 py-4 text-center">No previous version history archived.</p>
          ) : (
            selectedSchemeVersions.map((v) => (
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

export default SchemeManagement;
