import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.login(form);
      if (res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        navigate("/dashboard");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow-sm border-0" style={{ width: "100%", maxWidth: "420px", borderRadius: "16px" }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 mb-2">
              Enterprise Platform
            </span>
            <h2 className="fw-bold text-dark mb-1">🌿 EcoAudit AI</h2>
            <p className="text-muted small">Sign in to access corporate carbon accounting</p>
          </div>

          {error && <div className="alert alert-danger shadow-sm mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Corporate Email Address</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100 py-2 fw-bold shadow-sm" disabled={loading}>
              {loading ? "Signing in..." : "Sign In to Platform →"}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Don't have an account? <Link to="/signup" className="text-success fw-bold text-decoration-none">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
