import React, { useState, useEffect } from "react";
import { settingsApi } from "../../services/api";
import { LoadingSkeleton, ErrorState } from "../../components/admin/UIControls";
import {
  Settings,
  Save,
  Globe,
  Shield,
  FileText,
  AlertCircle,
  History,
  CheckCircle,
  Clock
} from "lucide-react";

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("GENERAL"); // GENERAL, COMPLAINT, SECURITY, AUDIT
  const [settings, setSettings] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);

  // General settings form state
  const [generalForm, setGeneralForm] = useState({
    platform_name: "",
    platform_description: "",
    support_email: "",
    contact_phone: "",
    default_language: "en",
    timezone: "Asia/Kolkata",
    office_address: ""
  });

  // Complaint settings form state
  const [complaintForm, setComplaintForm] = useState({
    max_attachment_size_mb: 10,
    default_priority: "MEDIUM",
    supported_categories: ""
  });

  // Security settings form state
  const [securityForm, setSecurityForm] = useState({
    min_password_length: 8,
    session_expiry_hours: 24,
    max_login_attempts: 5,
    lockout_duration_minutes: 15
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [settingsRes, auditRes] = await Promise.all([
        settingsApi.getSettings(),
        settingsApi.getAuditLogs({ limit: 50 })
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
        const g = settingsRes.data.general_settings || {};
        const c = settingsRes.data.complaint_settings || {};
        const s = settingsRes.data.security_settings || {};

        setGeneralForm({
          platform_name: g.platform_name || "JanSeva Connect",
          platform_description: g.platform_description || "",
          support_email: g.support_email || "",
          contact_phone: g.contact_phone || "",
          default_language: g.default_language || "en",
          timezone: g.timezone || "Asia/Kolkata",
          office_address: g.office_address || ""
        });

        setComplaintForm({
          max_attachment_size_mb: c.max_attachment_size_mb || 10,
          default_priority: c.default_priority || "MEDIUM",
          supported_categories: Array.isArray(c.supported_categories) ? c.supported_categories.join(", ") : ""
        });

        setSecurityForm({
          min_password_length: s.min_password_length || 8,
          session_expiry_hours: s.session_expiry_hours || 24,
          max_login_attempts: s.max_login_attempts || 5,
          lockout_duration_minutes: s.lockout_duration_minutes || 15
        });
      }

      if (auditRes.success) {
        setAuditLogs(auditRes.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load platform settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    try {
      await settingsApi.updateSettings({
        setting_key: "general_settings",
        category: "GENERAL",
        setting_value: generalForm
      });
      setSuccessMessage("General platform configuration saved successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveComplaint = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    try {
      await settingsApi.updateSettings({
        setting_key: "complaint_settings",
        category: "COMPLAINT",
        setting_value: {
          ...complaintForm,
          max_attachment_size_mb: parseInt(complaintForm.max_attachment_size_mb, 10),
          supported_categories: complaintForm.supported_categories.split(",").map((c) => c.trim()).filter(Boolean)
        }
      });
      setSuccessMessage("Complaint processing rules updated successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    try {
      await settingsApi.updateSettings({
        setting_key: "security_settings",
        category: "SECURITY",
        setting_value: {
          min_password_length: parseInt(securityForm.min_password_length, 10),
          session_expiry_hours: parseInt(securityForm.session_expiry_hours, 10),
          max_login_attempts: parseInt(securityForm.max_login_attempts, 10),
          lockout_duration_minutes: parseInt(securityForm.lockout_duration_minutes, 10)
        }
      });
      setSuccessMessage("Security baseline policies updated successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !settings) {
    return <LoadingSkeleton rows={10} columns={2} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Platform Configuration & Audit Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer global settings, complaint parameters, multilingual preferences, and inspect immutable audit logs.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-0.5 bg-slate-200/80 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("GENERAL")}
            className={`px-3.5 py-1.5 rounded-md transition ${
              activeTab === "GENERAL" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("COMPLAINT")}
            className={`px-3.5 py-1.5 rounded-md transition ${
              activeTab === "COMPLAINT" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Complaint Rules
          </button>
          <button
            onClick={() => setActiveTab("SECURITY")}
            className={`px-3.5 py-1.5 rounded-md transition ${
              activeTab === "SECURITY" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`px-3.5 py-1.5 rounded-md transition ${
              activeTab === "AUDIT" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={fetchSettings} />}

      {/* TAB 1: General Settings */}
      {activeTab === "GENERAL" && (
        <form onSubmit={handleSaveGeneral} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">General Public Portal Information</h3>
            <p className="text-slate-500">Public metadata and official grievance cell contact points.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Platform Name</label>
              <input
                type="text"
                required
                value={generalForm.platform_name}
                onChange={(e) => setGeneralForm({ ...generalForm, platform_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
              <select
                value={generalForm.timezone}
                onChange={(e) => setGeneralForm({ ...generalForm, timezone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Platform Tagline & Purpose</label>
            <input
              type="text"
              value={generalForm.platform_description}
              onChange={(e) => setGeneralForm({ ...generalForm, platform_description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={generalForm.support_email}
                onChange={(e) => setGeneralForm({ ...generalForm, support_email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Toll-free Citizen Helpline</label>
              <input
                type="text"
                value={generalForm.contact_phone}
                onChange={(e) => setGeneralForm({ ...generalForm, contact_phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Grievance Cell Central Physical Address</label>
            <input
              type="text"
              value={generalForm.office_address}
              onChange={(e) => setGeneralForm({ ...generalForm, office_address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center shadow-xs"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Saving..." : "Save General Settings"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Complaint Settings */}
      {activeTab === "COMPLAINT" && (
        <form onSubmit={handleSaveComplaint} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Complaint Policy & Parameters</h3>
            <p className="text-slate-500">Configure file uploads, default priority, and active civic categories.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maximum Evidence Size (MB)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={complaintForm.max_attachment_size_mb}
                onChange={(e) => setFormData({ ...complaintForm, max_attachment_size_mb: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Inward Priority</label>
              <select
                value={complaintForm.default_priority}
                onChange={(e) => setComplaintForm({ ...complaintForm, default_priority: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supported Civic Grievance Categories (Comma Separated)</label>
            <input
              type="text"
              value={complaintForm.supported_categories}
              onChange={(e) => setComplaintForm({ ...complaintForm, supported_categories: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center shadow-xs"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Saving..." : "Save Complaint Rules"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Security Settings */}
      {activeTab === "SECURITY" && (
        <form onSubmit={handleSaveSecurity} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Security & Authentication Baseline</h3>
            <p className="text-slate-500">Administer password complexity rules, session expiration, and rate limits.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum Password Length</label>
              <input
                type="number"
                min="6"
                max="32"
                value={securityForm.min_password_length}
                onChange={(e) => setSecurityForm({ ...securityForm, min_password_length: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">JWT Session Lifetime (Hours)</label>
              <input
                type="number"
                min="1"
                max="168"
                value={securityForm.session_expiry_hours}
                onChange={(e) => setSecurityForm({ ...securityForm, session_expiry_hours: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maximum Failed Login Attempts</label>
              <input
                type="number"
                min="3"
                max="10"
                value={securityForm.max_login_attempts}
                onChange={(e) => setSecurityForm({ ...securityForm, max_login_attempts: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Lockout Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={securityForm.lockout_duration_minutes}
                onChange={(e) => setSecurityForm({ ...securityForm, lockout_duration_minutes: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center shadow-xs"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Saving..." : "Save Security Policy"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Immutable Audit Trail */}
      {activeTab === "AUDIT" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Administrative Audit Trail Log</h3>
              <p className="text-slate-500">Every administrative verification, assignment, flag, and update recorded here.</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono font-bold">
              {auditLogs.length} Records Logged
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {log.action}
                    </span>
                    <span className="text-slate-500">
                      Entity: <span className="font-semibold text-slate-700">{log.entity_type} #{log.entity_id}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Actor: <span className="font-semibold text-slate-800">{log.actor_name}</span> ({log.actor_role}) • IP: {log.ip_address}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
