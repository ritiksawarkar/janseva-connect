import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  Shield,
  AlertTriangle,
  FileCheck2,
  Filter,
  ArrowRight
} from "lucide-react";
import { officerApi } from "../../services/api";
import { LoadingSkeleton, EmptyState, ErrorState, ToastNotification } from "../../components/officer/UIFeedback";

export function OfficerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("ALL");
  const [filterRead, setFilterRead] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await officerApi.getNotifications({
        type: filterType !== "ALL" ? filterType : undefined,
        is_read: filterRead !== "ALL" ? filterRead : undefined,
        limit: 50
      });
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unread_count || 0);
      } else {
        setError(res.message || "Failed to load notifications.");
      }
    } catch (err) {
      setError(err.message || "Error communicating with server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filterType, filterRead]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await officerApi.markRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      alert("Failed to update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await officerApi.markAllRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        setToastMessage("All notifications marked as read.");
      }
    } catch (err) {
      alert("Failed to mark all as read.");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "New Complaint Assigned":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "SLA Warning":
      case "Complaint Overdue":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "Resolution Approved":
        return <CheckCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toastMessage && (
        <ToastNotification message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Department Notifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational alerts, assignment updates, and SLA deadline notifications
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3 flex-wrap">
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Event Types</option>
            <option value="New Complaint Assigned">New Complaint Assigned</option>
            <option value="Assignment Accepted">Assignment Accepted</option>
            <option value="SLA Warning">SLA Warning</option>
            <option value="Resolution Approved">Resolution Approved</option>
          </select>
        </div>

        <div>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Read States</option>
            <option value="false">Unread Only</option>
            <option value="true">Read Only</option>
          </select>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadNotifications} />}

      {/* Notification List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} height="h-20" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications to show"
            message="You are completely caught up with all operational events and alerts."
          />
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 transition flex items-start justify-between gap-4 ${
                n.is_read ? "bg-white hover:bg-slate-50/70" : "bg-blue-50/40 hover:bg-blue-50/70"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{n.title}</span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(n.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                  {n.metadata?.complaint_id && (
                    <Link
                      to={`/officer/complaints/${n.metadata.complaint_id}`}
                      className="inline-flex items-center text-[11px] text-blue-600 hover:underline gap-1 font-semibold mt-1"
                    >
                      <span>Open Complaint {n.metadata.tracking_id ? `(${n.metadata.tracking_id})` : ""}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  title="Mark as Read"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OfficerNotifications;
