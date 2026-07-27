import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.login(form);
      if (res.data?.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        navigate("/dashboard");
      } else {
        setError(res.data?.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please verify email & password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Please enter login details below"
      maxWidth="max-w-[420px]"
    >
      {/* ERROR ALERT BANNER */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2 shadow-xs"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* EMAIL FIELD */}
        <div>
          <label className="block text-xs font-bold text-[#1E293B] mb-1">
            Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32] transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full h-11 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* PASSWORD FIELD */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#1E293B]">
              Password
            </label>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset functionality is managed by your Organization Admin.");
              }}
              className="text-[11px] font-medium text-[#64748B] hover:text-[#2E7D32] transition-colors text-decoration-none"
            >
              Forget password?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2E7D32] transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full h-11 pl-10 pr-10 bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#64748B] transition-colors focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* REMEMBER ME */}
        <div className="flex items-center pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#E2E8F0] text-[#2E7D32] focus:ring-[#2E7D32]/20 accent-[#2E7D32] cursor-pointer"
            />
            <span className="text-xs font-medium text-[#64748B]">Keep me signed in</span>
          </label>
        </div>

        {/* PRIMARY SUBMIT BUTTON */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full h-11 mt-2 bg-[#0F172A] hover:bg-[#1E293B] active:bg-[#020617] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-[#0F172A]/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed border border-slate-800"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </>
          )}
        </motion.button>
      </form>

      {/* DIVIDER */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2E8F0]" />
        </div>
        <div className="relative flex justify-center text-[11px]">
          <span className="bg-white px-3 text-[#94A3B8] font-medium">or continue</span>
        </div>
      </div>

      {/* GOOGLE SIGN IN BUTTON */}
      <button
        type="button"
        onClick={() => alert("Google SSO is configured for Enterprise SAML / OAuth 2.0 users.")}
        className="w-full h-11 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] font-semibold text-xs rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xs cursor-pointer hover:border-[#CBD5E1]"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Log in with Google</span>
      </button>

      {/* BOTTOM LINK */}
      <div className="mt-4 text-center">
        <p className="text-xs font-medium text-[#64748B]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-[#0F172A] hover:text-[#2E7D32] transition-colors text-decoration-none ml-1 underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
