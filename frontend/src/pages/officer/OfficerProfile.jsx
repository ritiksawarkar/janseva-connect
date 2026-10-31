import React, { useState, useEffect } from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Calendar,
  Lock,
  Layers
} from "lucide-react";
import { officerApi } from "../../services/api";
import { useOfficerAuth } from "../../context/OfficerAuthContext";
import { LoadingSkeleton, ErrorState, ToastNotification } from "../../components/officer/UIFeedback";

export function OfficerProfile() {
  const { updateOfficerState } = useOfficerAuth();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit personal fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isUpdatingPersonal, setIsUpdatingPersonal] = useState(false);
  const [personalSuccessMsg, setPersonalSuccessMsg] = useState("");

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await officerApi.getProfile();
      if (res.success && res.data) {
        setProfileData(res.data);
        setFullName(res.data.full_name || "");
        setPhone(res.data.phone || "");
      } else {
        setError(res.message || "Failed to load officer profile.");
      }
    } catch (err) {
      setError(err.message || "Error retrieving officer profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setPersonalSuccessMsg("");

    if (!fullName.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    setIsUpdatingPersonal(true);
    try {
      const res = await officerApi.updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim()
      });

      if (res.success) {
        setPersonalSuccessMsg("Contact details updated successfully.");
        setToastMessage("Personal details updated!");
        updateOfficerState({ full_name: fullName.trim(), phone: phone.trim() });
      } else {
        alert(res.message || "Update failed.");
      }
    } catch (err) {
      alert(err.message || "Error updating personal profile.");
    } finally {
      setIsUpdatingPersonal(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword || !newPassword) {
      setPassError("Both current password and new password are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await officerApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (res.success) {
        setPassSuccess("Password updated successfully.");
        setToastMessage("Security credentials changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassError(res.message || "Password change failed.");
      }
    } catch (err) {
      setPassError(err.message || "Error changing password.");
    } finally {
      setIsChangingPass(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <LoadingSkeleton count={3} height="h-32" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-md mx-auto py-8">
        <ErrorState message={error || "Profile unavailable."} onRetry={loadProfile} />
      </div>
    );
  }

  const { officer, workload } = profileData;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toastMessage && (
        <ToastNotification message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {/* Header Profile Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20 flex-shrink-0">
            {profileData.full_name?.charAt(0) || "O"}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{profileData.full_name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {profileData.account_status}
              </span>
            </div>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">
              {officer?.designation} • {officer?.department_name}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Employee ID: <strong className="text-slate-700">{officer?.employee_id}</strong>
            </p>
          </div>
        </div>

        {/* Workload Metric Pills */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="text-center px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 flex-1 sm:flex-initial">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Assigned</span>
            <span className="text-base font-bold text-slate-800">{workload?.total_assigned || 0}</span>
          </div>
          <div className="text-center px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 flex-1 sm:flex-initial">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Closed</span>
            <span className="text-base font-bold text-emerald-600">{workload?.completed_work || 0}</span>
          </div>
          <div className="text-center px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 flex-1 sm:flex-initial">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Success Rate</span>
            <span className="text-base font-bold text-blue-600">{workload?.completion_rate || 0}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Edit Permitted Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal & Contact Information</h3>
          </div>

          {personalSuccessMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{personalSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePersonal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email (Read-only)
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Official email is assigned by Admin IT desk and cannot be altered.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Read-Only Official Details Notice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Official Government Record:
              </p>
              <p>Department: <span className="font-semibold text-slate-900">{officer?.department_name}</span></p>
              <p>Designation: <span className="font-semibold text-slate-900">{officer?.designation}</span></p>
              <p className="text-[10px] text-slate-400 pt-1">
                Changes to department or designation require administrator order.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPersonal}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isUpdatingPersonal ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Save Contact Details</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Card: Security & Password Update */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Key className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Security & Credentials</h3>
          </div>

          {passError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (Min. 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isChangingPass ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>

          {/* Account Audit info */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
            <p>Account Role: <span className="font-semibold text-slate-600">DEPARTMENT_OFFICER</span></p>
            <p>
              Account Provisioned:{" "}
              <span className="font-semibold text-slate-600">
                {new Date(profileData.joining_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerProfile;
