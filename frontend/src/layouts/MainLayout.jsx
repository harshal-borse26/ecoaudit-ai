import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  FileText,
  PieChart,
  Bell,
  HelpCircle,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  Leaf,
  ChevronLeft,
  ChevronRight,
  User,
  RefreshCw
} from "lucide-react";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const userFullName = user ? user.fullName : "Harshal Borse";
  const userRole = user?.role || "MNC Compliance Lead";
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

  const navGroups = [
    {
      groupLabel: "CORE PLATFORM",
      items: [
        { to: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
        { to: "/facilities", label: "Monitored Facilities", icon: Building2 },
      ]
    },
    {
      groupLabel: "INTELLIGENCE & AUDIT",
      items: [
        { to: "/bills", label: "AI Document Queue", icon: FileText },
        { to: "/reports", label: "Reporting Center", icon: PieChart },
      ]
    },
    {
      groupLabel: "ACCOUNT & SETTINGS",
      items: [
        { to: "/profile", label: "Account Profile", icon: User },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#E8E8DC] font-sans antialiased text-[#1E293B]">
      {/* SLEEK FLOATING DARK SIDEBAR WORKSPACE (#152A38) */}
      <aside
        className={`fixed top-3 left-3 bottom-3 z-40 h-[calc(100vh-24px)] bg-[#152A38] text-[#D6CFB9] rounded-[28px] shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-[#234257] transition-all duration-300 ease-in-out flex flex-col justify-between ${collapsed ? "w-20" : "w-64"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+24px)] lg:translate-x-0"}`}
      >
        <div>
          {/* HEADER BRANDING & HAMBURGER TOGGLE */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#234257]/60">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-2 rounded-xl text-[#D6CFB9] hover:text-[#E4E5DB] hover:bg-[#1E3A4D] transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <NavLink to="/dashboard" className="flex items-center gap-2 text-decoration-none group">
                  <div className="w-8 h-8 rounded-xl bg-[#2F5241] flex items-center justify-center text-[#E4E5DB] shadow-md shadow-[#2F5241]/40 group-hover:scale-105 transition-transform">
                    <Leaf className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold tracking-tight text-[#E4E5DB] block leading-none">EcoAudit AI</span>
                    {/* <span className="text-[9px] font-bold text-[#faf8f2]/70 tracking-wider uppercase mt-0.5 block">Sustainability</span> */}
                  </div>
                </NavLink>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-2 rounded-xl text-[#D6CFB9] hover:text-[#E4E5DB] hover:bg-[#1E3A4D] transition-colors cursor-pointer"
                  title="Expand Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* NAV GROUPS */}
          <div className="px-3 pt-5 space-y-5">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                {!collapsed && (
                  <div className="px-3 pb-1 text-[10px] font-extrabold text-[#D6CFB9]/50 uppercase tracking-widest">
                    {group.groupLabel}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 text-decoration-none ${isActive
                          ? "bg-[#2F5241] text-[#E4E5DB] shadow-lg shadow-[#2F5241]/40 font-extrabold"
                          : "text-[#D6CFB9] hover:text-[#E4E5DB] hover:bg-[#1E3A4D]/70 font-semibold"
                        } ${collapsed ? "justify-center px-0 w-12 h-12 mx-auto" : ""}`
                      }
                      title={item.label}
                    >
                      <Icon className="w-5 h-5 shrink-0 stroke-[2.2]" />
                      {!collapsed && <span className="truncate text-xs tracking-wide">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM USER PROFILE BADGE */}
        <div className="p-3 border-t border-[#234257]/60">
          <div
            className={`flex items-center justify-between p-2.5 rounded-2xl bg-[#1E3A4D]/50 border border-[#234257]/80 ${collapsed ? "justify-center p-2" : ""
              }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs border border-[#3E6B55]">
                {userInitials}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-extrabold text-[#E4E5DB] truncate">{userFullName}</div>
                  <div className="text-[10px] text-[#D6CFB9]/70 truncate">{userRole}</div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-[#D6CFB9] hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-[100px]" : "lg:ml-[280px]"}`}>
        {/* PREMIUM FLOATING TOP NAVBAR */}
        <div className="sticky top-0 z-30 px-4 pt-4 pb-2">
          <header className="h-[72px] bg-[#EEEDDF]/90 backdrop-blur-md border border-[#D4D4C4] rounded-[24px] shadow-[0_4px_24px_rgba(21,42,56,0.06)] flex items-center justify-between px-4 sm:px-6 transition-all duration-200">
            {/* SEARCH BAR & MOBILE MENU TOGGLE */}
            <div className="flex items-center gap-3 flex-1 max-w-[480px]">
              <button
                className="lg:hidden p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#D6CFB9]/40 rounded-xl border border-[#D4D4C4] transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search facilities, bills, or carbon metrics... (⌘K)"
                  className="w-full h-10 pl-10 pr-12 bg-[#F5F4EC]/60 hover:bg-[#F5F4EC] focus:bg-[#FAFAF5]/85 border border-[#D4D4C4] rounded-full text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F5241] focus:ring-4 focus:ring-[#2F5241]/5 transition-all duration-200 font-medium"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-bold text-[#64748B] bg-[#EEEDDF] border border-[#D4D4C4] rounded-md shadow-xs">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            {/* RIGHT ACTION ITEMS */}
            <div className="flex items-center gap-3">
              {/* Dashboard Contextual Actions */}
              {location.pathname === "/dashboard" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsRefreshing(true);
                      window.dispatchEvent(new CustomEvent("ecoaudit-data-changed"));
                      setTimeout(() => setIsRefreshing(false), 900);
                    }}
                    className="p-2.5 text-[#64748B] hover:text-[#152A38] hover:bg-[#D6CFB9]/40 active:scale-95 rounded-xl border border-[#D4D4C4] transition-all duration-200 cursor-pointer flex items-center justify-center"
                    title="Refresh Metrics"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#2F5241]" : ""}`} />
                  </button>
                  <button
                    onClick={() => navigate("/reports")}
                    className="h-10 px-4 bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs rounded-full shadow-[0_4px_12px_rgba(47,82,65,0.25)] hover:bg-[#234035] hover:shadow-[0_6px_16px_rgba(47,82,65,0.35)] active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer hidden md:flex"
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    <span>Export Report</span>
                  </button>
                </div>
              )}

              <button
                className="relative p-2.5 text-[#64748B] hover:text-[#152A38] hover:bg-[#D6CFB9]/40 active:scale-95 rounded-xl border border-[#D4D4C4] transition-colors cursor-pointer"
                title="System Alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] border border-white" />
              </button>

              <button
                className="p-2.5 text-[#64748B] hover:text-[#152A38] hover:bg-[#D6CFB9]/40 active:scale-95 rounded-xl border border-[#D4D4C4] transition-colors hidden sm:block cursor-pointer"
                title="Documentation & Help"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-[#D4D4C4] hidden sm:block" />

              {/* PROFILE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 pr-3.5 bg-[#F5F4EC] hover:bg-[#EEEDDF] border border-[#D4D4C4] rounded-full hover:border-[#2F5241]/50 transition-all duration-200 cursor-pointer shadow-[0_1px_4px_rgba(21,42,56,0.08)] active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs flex items-center justify-center shadow-md border border-[#3E6B55]">
                    {userInitials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-extrabold text-[#1E293B] block leading-none">{userFullName}</span>
                    <span className="text-[10px] font-bold text-[#2E7D32] mt-0.5 block">{userRole}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-1.5 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-[#E2E8F0] mb-1">
                      <span className="text-xs font-bold text-[#1E293B] block">{userFullName}</span>
                      <span className="text-[11px] text-[#64748B] block truncate">{user?.email || "executive@company.com"}</span>
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer mb-1"
                    >
                      <User className="w-4 h-4 text-[#2E7D32]" />
                      <span>Account Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out Platform</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        </div>

        {/* PAGE CONTENT CONTAINER */}
        <main className="p-6 md:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
