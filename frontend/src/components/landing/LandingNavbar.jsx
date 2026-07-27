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

  // Scroll listener for height transformation and section detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section highlight detection
      const sections = navItems.map((item) => item.id);
      const scrollPosition = window.scrollY + 200;

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F7F6EE]/92 backdrop-blur-xl border-b border-[#DDDDD0] shadow-sm py-2.5 sm:py-3"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* ── LEFT: BRAND LOGO ────────────────────────────────────────── */}
        <Link to="/" className="inline-flex items-center gap-2.5 group text-decoration-none">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-9 h-9 rounded-xl bg-[#152A38] text-[#E4E5DB] flex items-center justify-center shadow-xs border border-[#2F5241]/30"
          >
            <Leaf className="w-4.5 h-4.5 text-emerald-400 stroke-[2.5]" />
          </motion.div>
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#152A38] block leading-none font-heading">
              EcoAudit <span className="text-[#2E7D32]">AI</span>
            </span>
            <span className="text-[9px] font-extrabold text-[#2F5241] tracking-wider uppercase mt-0.5 block">
              Carbon Intelligence Platform
            </span>
          </div>
        </Link>

        {/* ── CENTER: NAVIGATION CAPSULE (SEGMENTED CONTROL) ───────────── */}
        <nav className="hidden lg:flex items-center bg-[#EEEDDF]/80 backdrop-blur-md border border-[#DDDDD0] p-1.5 rounded-full shadow-2xs">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveSection(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer text-decoration-none flex items-center gap-1.5 ${
                  isActive ? "text-[#E4E5DB]" : "text-[#152A38]/80 hover:text-[#152A38]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-[#152A38] rounded-full shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* ── RIGHT: UTILITY & PRIMARY ENTERPRISE CTA ────────────────────── */}
        <div className="hidden lg:flex items-center gap-3">
          {!token && (
            <Link
              to="/login"
              className="px-3.5 py-2 text-xs font-extrabold text-[#152A38] hover:text-[#2E7D32] transition-colors text-decoration-none"
            >
              Sign In
            </Link>
          )}

          <motion.button
            whileHover={{ scale: 1.02, elevation: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(token ? "/dashboard" : "/signup")}
            className="px-4.5 py-2 rounded-xl bg-[#152A38] hover:bg-[#2F5241] text-[#E4E5DB] hover:text-white text-xs font-extrabold shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer border border-[#2F5241]/30 group"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>{token ? "Launch Dashboard" : "Launch Platform"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* ── MOBILE MENU BUTTON ────────────────────────────────────────── */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-[#EEEDDF] border border-[#DDDDD0] text-[#152A38] cursor-pointer hover:bg-[#E4E3D6] transition-colors"
          aria-label="Toggle Mobile Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── MOBILE SLIDE-OUT OVERLAY MENU ────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-[#F7F6EE]/95 backdrop-blur-xl border-b border-[#DDDDD0] px-4 pt-3 pb-6 shadow-xl overflow-hidden text-left"
          >
            <div className="flex flex-col space-y-2 pt-2">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <motion.a
                    key={item.id}
                    href={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between text-decoration-none transition-colors ${
                      isActive 
                        ? "bg-[#152A38] text-[#E4E5DB]" 
                        : "text-[#152A38] hover:bg-[#EEEDDF]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-[#7A8597]"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </motion.a>
                );
              })}

              <div className="pt-3 border-t border-[#DDDDD0] flex flex-col gap-2">
                {!token ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center text-xs font-extrabold text-[#152A38] rounded-xl border border-[#DDDDD0] bg-[#EEEDDF] text-decoration-none"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center text-xs font-extrabold text-white rounded-xl bg-[#152A38] text-decoration-none shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Launch Platform</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/dashboard");
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#152A38] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    <span>Launch Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingNavbar;
