import React, { useState, useEffect } from "react";
import { notificationsApi } from "../../services/api";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import { SearchInput, FilterDropdown, ErrorState, LoadingSkeleton } from "../../components/admin/UIControls";
import { FormModal } from "../../components/admin/Modals";
import {
  Bell,
  Megaphone,
  RefreshCw,
  Send,
  Eye,
  Mail,
  CheckCircle,
  AlertTriangle,
  Smartphone
} from "lucide-react";

export function NotificationsManagement() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Broadcast Announcement Modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    target_role: "ALL",
    delivery_channel: "IN_APP"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [roleFilter, statusFilter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await notificationsApi.getNotifications({
        search,
        recipient_role: roleFilter,
        delivery_status: statusFilter
      });
      if (res.success) setNotifications(res.data);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotifications();
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      alert("Title and message are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await notificationsApi.createAnnouncement(broadcastForm);
      setIsBroadcastModalOpen(false);
      setBroadcastForm({ title: "", message: "", target_role: "ALL", delivery_channel: "IN_APP" });
      fetchNotifications();
    } catch (err) {
      alert("Broadcast failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (id) => {
    try {
      await notificationsApi.retry(id);
      fetchNotifications();
    } catch (err) {
      alert("Retry failed: " + err.message);
    }
  };

  const openDetails = (notif) => {
    setSelectedNotif(notif);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      header: "Title & Message",
      accessor: "title",
      render: (row) => (
        <div className="max-w-md">
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">{row.message}</p>
        </div>
      )
    },
    {
      header: "Target Recipient",
      accessor: "recipient_role",
      render: (row) => (
        <div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
              row.recipient_role === "ADMIN"
                ? "bg-blue-100 text-blue-800"
                : row.recipient_role === "DEPARTMENT_OFFICER"
                ? "bg-purple-100 text-purple-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {row.recipient_role}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">{row.recipient_name}</p>
        </div>
      )
    },
    {
      header: "Type",
      accessor: "type",
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">{row.type}</span>
      )
    },
    {
      header: "Channel",
      accessor: "delivery_channel",
      render: (row) => (
        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {row.delivery_channel}
        </span>
      )
    },
    {
      header: "Status",
      accessor: "delivery_status",
      render: (row) => {
        const isSimulated = row.delivery_status === "SIMULATED";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              row.delivery_status === "DELIVERED"
                ? "bg-emerald-100 text-emerald-800"
                : isSimulated
                ? "bg-cyan-100 text-cyan-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {row.delivery_status}
          </span>
        );
      }
    },
    {
      header: "Timestamp",
      accessor: "created_at",
      render: (row) => (
        <span className="text-slate-500 text-[11px]">
          {new Date(row.created_at).toLocaleString()}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => openDetails(row)}
            title="Inspect Notification"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
          </button>

          {(row.delivery_status === "FAILED" || row.delivery_status === "SIMULATED") && (
            <button
              onClick={() => handleRetry(row.id)}
              title="Retry Delivery"
              className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
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
            Notification & Broadcast Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit system delivery logs, in-app notifications, and broadcast platform-wide administrative announcements.
          </p>
        </div>

        <button
          onClick={() => setIsBroadcastModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center self-start sm:self-auto"
        >
          <Megaphone className="w-4 h-4 mr-1.5" />
          Broadcast Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title, message content, or recipient name..."
            onClear={() => {
              setSearch("");
              fetchNotifications();
            }}
          />
        </form>

        <FilterDropdown
          label="Target Role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { label: "All Roles", value: "ALL" },
            { label: "Citizens", value: "CITIZEN" },
            { label: "Department Officers", value: "DEPARTMENT_OFFICER" },
            { label: "Admins", value: "ADMIN" }
          ]}
        />

        <FilterDropdown
          label="Delivery Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "All Statuses", value: "ALL" },
            { label: "Delivered", value: "DELIVERED" },
            { label: "Simulated", value: "SIMULATED" },
            { label: "Failed", value: "FAILED" }
          ]}
        />
      </div>

      {error && <ErrorState message={error} onRetry={fetchNotifications} />}

      <DataTable
        columns={columns}
        data={notifications}
        isLoading={isLoading}
        emptyTitle="No notifications found"
        emptyDescription="System notifications will appear as users interact with the portal."
      />

      {/* Broadcast Announcement Modal */}
      <FormModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Platform Announcement"
        subtitle="Dispatches notifications to users registered in the system."
      >
        <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              placeholder="e.g. Monsoon Preparedness Alert & Emergency Ward Contacts"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Audience *
              </label>
              <select
                value={broadcastForm.target_role}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, target_role: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="ALL">All Users (Citizens & Staff)</option>
                <option value="CITIZEN">Citizens Only</option>
                <option value="DEPARTMENT_OFFICER">Department Officers Only</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Delivery Channel
              </label>
              <select
                value={broadcastForm.delivery_channel}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, delivery_channel: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="IN_APP">In-App Notification</option>
                <option value="EMAIL_SIMULATED">Simulated Email Broadcast</option>
                <option value="SMS_SIMULATED">Simulated SMS Broadcast</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Announcement Message *
            </label>
            <textarea
              rows={4}
              required
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              placeholder="Detailed notification announcement text delivered to recipient inbox..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? "Broadcasting..." : "Dispatch Announcement"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Inspect Notification Modal */}
      <FormModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Notification Audit Record"
        subtitle={`ID #${selectedNotif?.id} • Created ${selectedNotif ? new Date(selectedNotif.created_at).toLocaleString() : ""}`}
      >
        {selectedNotif && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 text-sm">{selectedNotif.title}</span>
              <p className="text-slate-700 pt-1 leading-relaxed">{selectedNotif.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Recipient:</span> {selectedNotif.recipient_name}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Role:</span> {selectedNotif.recipient_role}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Channel:</span> {selectedNotif.delivery_channel}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Status:</span> {selectedNotif.delivery_status}
              </div>
            </div>

            {selectedNotif.metadata && Object.keys(selectedNotif.metadata).length > 0 && (
              <div>
                <span className="font-semibold text-slate-800 mb-1 block">Context Metadata:</span>
                <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedNotif.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
}

export default NotificationsManagement;
