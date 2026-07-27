import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Platform", href: "#overview" },
    { name: "Features", href: "#modules" },
    { name: "Analytics", href: "#analytics" },
    { name: "Reports", href: "#reports" },
    { name: "Security", href: "#security" },
    { name: "Technology", href: "#technology" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F7F6EE]/90 backdrop-blur-md border-b border-[#DDDDD0] shadow-xs py-3"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <Link to="/" className="inline-flex items-center gap-2.5 group text-decoration-none">
          <div className="w-9 h-9 rounded-xl bg-[#152A38] text-[#E4E5DB] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Leaf className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#152A38] block leading-none font-heading">
              EcoAudit <span className="text-[#2E7D32]">AI</span>
            </span>
            <span className="text-[9.5px] font-bold text-[#2F5241] tracking-wider uppercase mt-0.5 block">
              Carbon Intelligence
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold text-[#152A38]/80">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-[#2E7D32] transition-colors text-decoration-none"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* DESKTOP ACTION BUTTONS */}
        <div className="hidden lg:flex items-center gap-3">
          {token ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-xl bg-[#152A38] hover:bg-[#2F5241] text-[#E4E5DB] hover:text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-[#2F5241]/30"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-[#152A38] hover:text-[#2E7D32] transition-colors text-decoration-none"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl bg-[#152A38] hover:bg-[#2F5241] text-[#E4E5DB] hover:text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 text-decoration-none cursor-pointer border border-[#2F5241]/30"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-[#EEEDDF] border border-[#DDDDD0] text-[#152A38] cursor-pointer hover:bg-[#E4E3D6] transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE NAV DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#F7F6EE] border-b border-[#DDDDD0] px-4 pt-3 pb-5 shadow-lg overflow-hidden"
          >
            <div className="flex flex-col space-y-3 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-extrabold text-[#152A38] hover:text-[#2E7D32] py-1.5 text-decoration-none border-b border-[#DDDDD0]/40"
                >
                  {link.name}
                </a>
              ))}

              <div className="pt-2 flex flex-col gap-2">
                {token ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/dashboard");
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#152A38] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2 text-center text-xs font-bold text-[#152A38] rounded-xl border border-[#DDDDD0] bg-[#EEEDDF] text-decoration-none"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center text-xs font-extrabold text-white rounded-xl bg-[#152A38] text-decoration-none shadow-sm"
                    >
                      Get Started
                    </Link>
                  </>
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
