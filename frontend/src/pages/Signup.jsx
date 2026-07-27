import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import { 
  Building2, 
  Briefcase, 
  Phone, 
  Globe, 
  MapPin, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  ArrowRight
} from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    fullName: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== confirmPassword) {
      setError("Passwords do not match. Please verify your password entry.");
      return;
    }

    if (!agreedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to create an account.");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.signup(form);
      if (res.data?.success) {
        navigate("/login");
      } else {
        setError(res.data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check input fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account!"
      subtitle="Register your corporate organization below"
      maxWidth="max-w-[480px]"
    >
      {/* ERROR ALERT BANNER */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2.5 shadow-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SECTION 1: CORPORATE ENTITY INFO */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 rounded-full bg-[#E7F3E8] text-[#2E7D32] text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
              Corporate Entity Details
            </h3>
            <div className="h-px bg-[#E2E8F0] flex-1 ml-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* COMPANY NAME */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                Company Name *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Acme Corp Solutions"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* INDUSTRY */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                Industry Sector *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="industry"
                  placeholder="Technology / Energy"
                  value={form.industry}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {/* PHONE */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                Phone Number *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* COUNTRY */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                Country *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="country"
                  placeholder="United States / India"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {/* STATE */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                State / Province *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="state"
                  placeholder="California / MH"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* CITY */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                City *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="city"
                  placeholder="San Francisco / Mumbai"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ORGANIZATION ADMIN ACCOUNT */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 rounded-full bg-[#E7F3E8] text-[#2E7D32] text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
              Primary Organization Admin Account
            </h3>
            <div className="h-px bg-[#E2E8F0] flex-1 ml-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* FULL NAME */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                Full Name *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Alex Morgan"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* WORK EMAIL */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                Work Email *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="alex@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {/* PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                Password *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 8 chars"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full h-11 pl-9 pr-8 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94A3B8] hover:text-[#64748B] transition-colors focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                Confirm Password *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-11 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TERMS CHECKBOX */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 rounded border-[#E2E8F0] text-[#2E7D32] focus:ring-[#2E7D32]/20 accent-[#2E7D32] cursor-pointer mt-0.5"
            />
            <span className="text-xs font-medium text-[#64748B] leading-normal">
              I agree to the corporate{" "}
              <a href="#terms" onClick={(e) => e.preventDefault()} className="text-[#2E7D32] font-semibold hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#2E7D32] font-semibold hover:underline">
                Privacy Policy
              </a>.
            </span>
          </label>
        </div>

        {/* PRIMARY SUBMIT BUTTON */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full h-12 mt-2 bg-[#0F172A] hover:bg-[#1E293B] active:bg-[#020617] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#0F172A]/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed border border-slate-800"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Corporate Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </motion.button>
      </form>

      {/* BOTTOM LINK */}
      <div className="mt-6 text-center">
        <p className="text-xs font-medium text-[#64748B]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#0F172A] hover:text-[#2E7D32] transition-colors text-decoration-none ml-1 underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
