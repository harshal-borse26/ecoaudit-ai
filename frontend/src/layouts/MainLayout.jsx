import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const userFullName = user ? user.fullName : "Enterprise Executive";
  const userInitials = userFullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      {/* Dark Forest Green Sidebar Workspace (#0E2419) */}
      <div className={`sidebar ${sidebarOpen ? "show" : ""} ${collapsed ? "collapsed" : ""}`}>
        <div>
          {/* Header Branding Row - Adapts Alignment based on Collapse Mode */}
          {collapsed ? (
            <div className="brand d-flex flex-column align-items-center gap-2 pt-4 pb-3">
              <button 
                className="btn btn-outline-light rounded-circle border-0 p-0 d-flex align-items-center justify-content-center" 
                onClick={() => setCollapsed(!collapsed)}
                title="Expand Sidebar"
                style={{ width: "36px", height: "36px", backgroundColor: "transparent", color: "#FFFFFF" }}
              >
                ☰
              </button>
              <span className="brand-icon fs-4" title="EcoAudit AI Platform">🌿</span>
            </div>
          ) : (
            <div className="brand d-flex align-items-center gap-3 py-4 px-3">
              <button 
                className="btn btn-outline-light rounded-circle border-0 p-0 d-flex align-items-center justify-content-center" 
                onClick={() => setCollapsed(!collapsed)}
                title="Collapse Sidebar"
                style={{ width: "36px", height: "36px", backgroundColor: "transparent", color: "#FFFFFF" }}
              >
                ☰
              </button>
              <div className="brand-title-row d-flex align-items-center gap-2">
                <span className="brand-icon fs-5">🌿</span>
                <div className="brand-name-group">
                  <div className="brand-name" style={{ fontSize: "1.1rem" }}>EcoAudit AI</div>
                  <div className="brand-sub" style={{ fontSize: "0.62rem" }}>Enterprise Platform</div>
                </div>
              </div>
            </div>
          )}

          {!collapsed && (
            <div className="px-4 pt-3 pb-2 text-uppercase text-white-50 small fw-bold nav-header-text" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
              Navigation
            </div>
          )}

          <nav className="nav flex-column mt-2">
            <NavLink to="/dashboard" className="nav-link" onClick={() => setSidebarOpen(false)} title="Executive Dashboard">
              <span className="fs-5">📊</span> 
              {!collapsed && <span className="nav-text">Executive Dashboard</span>}
            </NavLink>
            <NavLink to="/facilities" className="nav-link" onClick={() => setSidebarOpen(false)} title="Monitored Facilities">
              <span className="fs-5">🏭</span> 
              {!collapsed && <span className="nav-text">Monitored Facilities</span>}
            </NavLink>
            <NavLink to="/bills" className="nav-link" onClick={() => setSidebarOpen(false)} title="AI Document Queue">
              <span className="fs-5">📄</span> 
              {!collapsed && <span className="nav-text">AI Document Queue</span>}
            </NavLink>
            <NavLink to="/reports" className="nav-link" onClick={() => setSidebarOpen(false)} title="Reporting Center">
              <span className="fs-5">📈</span> 
              {!collapsed && <span className="nav-text">Reporting Center</span>}
            </NavLink>
          </nav>
        </div>

        {/* Bottom Sidebar User Area */}
        <div className="sidebar-footer">
          <div className="sidebar-user-pill" title={collapsed ? userFullName : "Compliance Profile"}>
            <div className="profile-avatar" style={{ width: "38px", height: "38px", fontSize: "0.9rem", backgroundColor: "#C7EA46", color: "#0E2419" }}>
              {userInitials}
            </div>
            {!collapsed && (
              <div className="text-truncate user-details" style={{ flex: 1 }}>
                <div className="text-white fw-bold small text-truncate">{userFullName}</div>
                <div className="text-white-50" style={{ fontSize: "0.72rem" }}>MNC Compliance Lead</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className={`main-content ${collapsed ? "collapsed-margin" : ""}`}>
        {/* Glass Top Navbar */}
        <nav className="top-navbar d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3" style={{ flex: 1, maxWidth: "500px" }}>
            <button
              className="btn btn-outline-secondary d-lg-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="input-group d-none d-md-flex" style={{ maxWidth: "340px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted">🔍</span>
              <input
                type="text"
                className="form-control bg-white border-start-0 ps-0"
                placeholder="Search facilities, bills, or metrics... (⌘K)"
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-secondary btn-sm rounded-circle p-2 position-relative" title="System Notifications">
              🔔
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            </button>

            <button className="btn btn-outline-secondary btn-sm rounded-circle p-2" title="Help & Documentation">
              ❓
            </button>

            {/* Profile Chip Dropdown */}
            <div className="position-relative">
              <div
                className="profile-chip"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                title="User Profile & Settings"
              >
                <div className="profile-avatar">{userInitials}</div>
                <div className="d-none d-sm-block text-start">
                  <div className="fw-bold text-dark small leading-none">{userFullName}</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>ESG Lead</div>
                </div>
                <span className="text-muted small">▾</span>
              </div>

              {profileDropdownOpen && (
                <div
                  className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg p-2"
                  style={{ width: "220px", zIndex: 1100 }}
                >
                  <div className="px-3 py-2 border-bottom">
                    <strong className="d-block small text-dark">{userFullName}</strong>
                    <span className="text-muted small">{user ? user.email : "executive@company.com"}</span>
                  </div>
                  <button
                    className="btn btn-link text-danger text-decoration-none w-100 text-start px-3 py-2 small fw-bold mt-1"
                    onClick={handleLogout}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Page Content Canvas */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1040,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
