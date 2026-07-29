import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
  Layers,
  ShieldCheck,
  Cpu,
  FileText,
  HelpCircle,
  Code
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Platform", href: "#overview", icon: LayoutDashboard },
    { id: "modules", label: "Features", href: "#modules", icon: Layers },
    { id: "analytics", label: "Analytics", href: "#analytics", icon: Cpu },
    { id: "reports", label: "Reports", href: "#reports", icon: FileText },
    { id: "security", label: "Security", href: "#security", icon: ShieldCheck },
    { id: "technology", label: "Tech Stack", href: "#technology", icon: Code },
    { id: "faq", label: "FAQ", href: "#faq", icon: HelpCircle },
  ];

  // Lock background scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Scroll tracking for morph animation & active section detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = navItems.map((item) => item.id);
      const scrollPosition = window.scrollY + 220;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[#F7F6EE]/94 backdrop-blur-2xl border-b border-[#DDDDD0] shadow-md py-3"
          : "bg-transparent py-5 sm:py-6"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* ── ZONE 1: BRAND IDENTITY (LEFT) ────────────────────────────── */}
        <Link to="/" className="inline-flex items-center gap-3 group text-decoration-none lg:pl-3">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-10 h-10 rounded-2xl bg-[#152A38] text-emerald-400 flex items-center justify-center shadow-xs border border-[#2F5241]/40 shrink-0"
          >
            <Leaf className="w-5 h-5 stroke-[2.5]" />
          </motion.div>
          <div>
            <span className="text-base sm:text-xl font-extrabold tracking-tight text-[#152A38] block leading-none font-heading">
              EcoAudit <span className="text-[#2E7D32]">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] sm:text-[11px] font-semibold text-[#7A8597] tracking-wider uppercase mt-1">
              Carbon Intelligence Platform
            </span>
          </div>
        </Link>

        {/* ── ZONE 2: FLOATING NAVIGATION CAPSULE (CENTER) ─────────────── */}
        <nav className="hidden lg:flex items-center bg-[#EEEDDF]/90 backdrop-blur-xl border border-[#DDDDD0] p-1.5 rounded-full shadow-sm">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveSection(item.id)}
                className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer text-decoration-none flex items-center gap-1.5 ${isActive ? "text-[#E4E5DB] font-bold" : "text-[#152A38]/80 hover:text-[#152A38]"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="flagship-nav-active-pill"
                    className="absolute inset-0 bg-[#152A38] rounded-full shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10 font-heading">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* ── ZONE 3: UTILITY & PRIMARY ENTERPRISE CTA (RIGHT) ───────────── */}
        <div className="hidden lg:flex items-center gap-4 sm:gap-5">
          {!token && (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#152A38] hover:text-[#2E7D32] hover:bg-[#EEEDDF] transition-all duration-200 text-decoration-none font-heading border border-transparent hover:border-[#DDDDD0]"
            >
              Sign In
            </Link>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(token ? "/dashboard" : "/signup")}
            className="px-5 py-2.5 rounded-2xl bg-[#152A38] hover:bg-[#2F5241] text-[#E4E5DB] hover:text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 border border-[#2F5241]/40 flex items-center gap-2.5 cursor-pointer group"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="font-heading">{token ? "Launch Dashboard" : "Launch Platform"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* ── MOBILE MENU TOGGLE BUTTON ────────────────────────────────── */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2.5 rounded-2xl bg-[#EEEDDF] border border-[#DDDDD0] text-[#152A38] cursor-pointer hover:bg-[#E4E3D6] transition-colors"
          aria-label="Open Mobile Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── FULL-SCREEN ENTERPRISE MOBILE NAV SLIDE PANEL (100dvh) ──────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 h-[100dvh] bg-[#152A38]/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-8 lg:hidden text-left overflow-hidden"
          >
            {/* TOP MOBILE NAV HEADER */}
            <div className="shrink-0 pb-5 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2F5241] text-emerald-300 flex items-center justify-center shadow-xs">
                  <Leaf className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-lg font-extrabold text-white block leading-none font-heading">
                    EcoAudit <span className="text-emerald-400">AI</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 block">
                    Carbon Intelligence
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* SCROLLABLE STAGGERED MOBILE NAV ITEMS */}
            <div className="flex-1 overflow-y-auto pr-1 my-4 space-y-2 scrollbar-thin">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <motion.a
                    key={item.id}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl text-base font-extrabold font-heading flex items-center justify-between text-decoration-none transition-all ${isActive
                        ? "bg-[#2F5241] text-white shadow-md border border-emerald-400/40"
                        : "text-slate-300 hover:bg-slate-800/80"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? "text-emerald-300" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </motion.a>
                );
              })}
            </div>

            {/* STICKY BOTTOM MOBILE CTA FOOTER */}
            <div className="shrink-0 pt-4 border-t border-slate-700/80 space-y-3 bg-[#152A38]/90">
              {!token ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-sm font-extrabold text-slate-200 rounded-2xl border border-slate-700 bg-slate-800/80 text-decoration-none block"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3.5 text-center text-sm font-extrabold text-[#152A38] bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-decoration-none shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Launch Platform</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/dashboard");
                  }}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-[#152A38] text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingNavbar;
