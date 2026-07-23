import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

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
      const res = await authService.signup(form);
      if (res.data.success) {
        navigate("/login");
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", paddingTop: "30px", paddingBottom: "30px" }}>
      <div className="card shadow-sm border-0" style={{ width: "100%", maxWidth: "600px", borderRadius: "16px" }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 mb-2">
              Corporate Onboarding
            </span>
            <h3 className="fw-bold text-dark mb-1">🌿 Register Enterprise Entity</h3>
            <p className="text-muted small">Create your EcoAudit AI corporate environmental account</p>
          </div>

          {error && <div className="alert alert-danger shadow-sm mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <h6 className="text-uppercase text-secondary fs-7 fw-bold mb-3">1. Corporate Entity Info</h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Company Name *</label>
                <input type="text" className="form-control" name="companyName" value={form.companyName} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Industry Sector *</label>
                <input type="text" className="form-control" name="industry" value={form.industry} onChange={handleChange} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Phone Number *</label>
                <input type="text" className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Country *</label>
                <input type="text" className="form-control" name="country" value={form.country} onChange={handleChange} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">State / Province *</label>
                <input type="text" className="form-control" name="state" value={form.state} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">City *</label>
                <input type="text" className="form-control" name="city" value={form.city} onChange={handleChange} required />
              </div>
            </div>

            <hr className="my-4" />
            <h6 className="text-uppercase text-secondary fs-7 fw-bold mb-3">2. Primary Administrator Account</h6>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Full Name *</label>
              <input type="text" className="form-control" name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Work Email Address *</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Password (min 8 characters) *</label>
              <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required minLength={8} />
            </div>

            <button type="submit" className="btn btn-success w-100 py-2 fw-bold shadow-sm" disabled={loading}>
              {loading ? "Registering Entity..." : "Register Corporate Entity →"}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Already have an account? <Link to="/login" className="text-success fw-bold text-decoration-none">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
