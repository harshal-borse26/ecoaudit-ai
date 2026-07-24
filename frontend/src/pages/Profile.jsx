import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { 
  User, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save,
  KeyRound
} from "lucide-react";

const Profile = () => {
  // User profile state
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Change password form state
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility toggles
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Password change submission state
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Fetch real profile data from backend GET /api/auth/me
  const fetchProfile = async () => {
    setLoadingProfile(true);
    setProfileError("");
    try {
      const res = await authService.getMe();
      if (res.data?.success) {
        setProfileData(res.data.data);
      } else {
        setProfileError("Failed to load user profile data.");
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to fetch profile details from backend.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePassChange = (e) => {
    setPassForm({ ...passForm, [e.target.name]: e.target.value });
    if (passError) setPassError("");
    if (passSuccess) setPassSuccess("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    // Client-side validations
    if (!passForm.currentPassword) {
      setPassError("Current password is required.");
      return;
    }
    if (!passForm.newPassword) {
      setPassError("New password is required.");
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      return;
    }
    if (!passForm.confirmPassword) {
      setPassError("Please confirm your new password.");
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }
    if (passForm.currentPassword === passForm.newPassword) {
      setPassError("New password must be different from current password.");
      return;
    }

    setPassSubmitting(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
        confirmPassword: passForm.confirmPassword,
      });

      if (res.data?.success) {
        setPassSuccess("Password updated successfully! Your account is secure.");
        setPassForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPassError(res.data?.message || "Failed to change password.");
      }
    } catch (err) {
      setPassError(err.response?.data?.message || "Password update failed. Please check your current password.");
    } finally {
      setPassSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-[#64748B]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2E7D32] mb-3" />
        <p className="text-sm font-semibold">Loading user account profile details...</p>
      </div>
    );
  }

  const userInitials = profileData?.fullName
    ? profileData.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "US";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="pb-4 border-b border-[#E2E8F0]">
        <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">Account Profile & Security</h1>
        <p className="text-xs text-[#64748B] mt-0.5">View your corporate credentials, organization context, and manage login security.</p>
      </div>

      {profileError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
          <button onClick={fetchProfile} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* READ-ONLY ACCOUNT PROFILE CARD */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-5 border-b border-[#E2E8F0]">
          <div className="w-16 h-16 rounded-2xl bg-[#2E7D32] text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-[#2E7D32]/20">
            {userInitials}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#1E293B]">{profileData?.fullName || "Harshal Borse"}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E7F3E8] text-[#2E7D32] text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {profileData?.role || "ADMIN"}
              </span>
              <span className="text-xs text-[#64748B]">• Corporate Administrator</span>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-[#2E7D32] flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Full Name</span>
              <span className="text-xs font-bold text-[#1E293B] mt-0.5 block">{profileData?.fullName || "—"}</span>
            </div>
          </div>

          {/* Email */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-[#1565C0] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Work Email Address</span>
              <span className="text-xs font-bold text-[#1E293B] mt-0.5 block">{profileData?.email || "—"}</span>
            </div>
          </div>

          {/* Company Name */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-amber-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Organization / Company</span>
              <span className="text-xs font-bold text-[#1E293B] mt-0.5 block">
                {profileData?.company?.companyName || "Corporate Entity"}
              </span>
            </div>
          </div>

          {/* Industry / Region */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-[#2E7D32] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Industry Sector</span>
              <span className="text-xs font-bold text-[#1E293B] mt-0.5 block">
                {profileData?.company?.industry || "Technology & Energy"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD CARD */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-lg bg-[#E7F3E8] text-[#2E7D32] flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">Change Account Password</h3>
            <p className="text-xs text-[#64748B]">Update your authentication credentials securely</p>
          </div>
        </div>

        {/* FEEDBACK MESSAGES */}
        {passError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passError}</span>
          </div>
        )}
        {passSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#2E7D32] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Current Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrentPass ? "text" : "password"}
                name="currentPassword"
                value={passForm.currentPassword}
                onChange={handlePassChange}
                placeholder="Enter current password"
                className="w-full h-10 pl-9 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#1E293B]"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">New Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPass ? "text" : "password"}
                name="newPassword"
                value={passForm.newPassword}
                onChange={handlePassChange}
                placeholder="Minimum 8 characters"
                className="w-full h-10 pl-9 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#1E293B]"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Confirm New Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPass ? "text" : "password"}
                name="confirmPassword"
                value={passForm.confirmPassword}
                onChange={handlePassChange}
                placeholder="Re-enter new password"
                className="w-full h-10 pl-9 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#1E293B]"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={passSubmitting}
              className="px-5 py-2.5 bg-[#2E7D32] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#2E7D32]/20 hover:bg-[#256829] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {passSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Password Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
