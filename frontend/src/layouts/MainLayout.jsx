import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
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
  User
} from "lucide-react";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#F1F5F9] font-sans antialiased text-[#1E293B]">
      {/* SLEEK DARK SLATE SIDEBAR WORKSPACE (#0F172A) */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[#0F172A] border-r border-[#1E293B] transition-all duration-300 flex flex-col justify-between ${
          collapsed ? "w-20" : "w-64"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div>
          {/* HEADER BRANDING */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E293B]">
            {!collapsed ? (
              <NavLink to="/dashboard" className="flex items-center gap-2.5 text-decoration-none group">
                <div className="w-9 h-9 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white shadow-md shadow-[#2E7D32]/30 group-hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-sm font-extrabold tracking-tight text-white block leading-none">EcoAudit AI</span>
                  <span className="text-[10px] font-bold text-[#2E7D32] tracking-wider uppercase mt-0.5 block">Enterprise Platform</span>
                </div>
              </NavLink>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-9 h-9 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white shadow-md shadow-[#2E7D32]/30">
                  <Leaf className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-7 h-7 rounded-lg bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] items-center justify-center transition-colors cursor-pointer"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* NAV GROUPS */}
          <div className="px-3 pt-4 space-y-4">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 pb-1 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
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
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 text-decoration-none ${
                          isActive
                            ? "bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/30 font-bold"
                            : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B] font-semibold"
                        } ${collapsed ? "justify-center px-0 w-11 h-11 mx-auto" : ""}`
                      }
                      title={item.label}
                    >
                      <Icon className="w-5 h-5 shrink-0 stroke-[2.2]" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM USER PROFILE BADGE */}
        <div className="p-3 border-t border-[#1E293B]">
          <div
            className={`flex items-center justify-between p-2 rounded-xl bg-[#1E293B]/70 border border-[#1E293B] ${
              collapsed ? "justify-center p-2" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#2E7D32] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {userInitials}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-extrabold text-white truncate">{userFullName}</div>
                  <div className="text-[10px] text-[#94A3B8] truncate">{userRole}</div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-[#94A3B8] hover:text-red-400 hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        {/* GLASS TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 md:px-8 flex items-center justify-between shadow-xs">
          {/* SEARCH BAR & MOBILE MENU TOGGLE */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              className="lg:hidden p-2 text-[#64748B] hover:text-[#1E293B] rounded-lg border border-[#E2E8F0]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search facilities, bills, or carbon metrics... (⌘K)"
                className="w-full h-9 pl-9 pr-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 transition-all font-medium"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] rounded shadow-xs">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* RIGHT ACTION ITEMS */}
          <div className="flex items-center gap-3">
            <button 
              className="relative p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] border border-white" />
            </button>

            <button 
              className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] transition-colors hidden sm:block cursor-pointer"
              title="Documentation & Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-[#E2E8F0] hidden sm:block" />

            {/* PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:border-[#2E7D32]/40 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2E7D32] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {userInitials}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-extrabold text-[#1E293B] block leading-none">{userFullName}</span>
                  <span className="text-[10px] font-bold text-[#2E7D32] mt-0.5 block">{userRole}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-xl p-1.5 z-50 animate-fadeIn">
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
