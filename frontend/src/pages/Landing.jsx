import React from "react";
import ScrollProgress from "../components/landing/ScrollProgress";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import TrustSection from "../components/landing/TrustSection";
import ProblemSection from "../components/landing/ProblemSection";
import PlatformOverview from "../components/landing/PlatformOverview";
import ModulesSection from "../components/landing/ModulesSection";
import AISection from "../components/landing/AISection";
import AnalyticsSection from "../components/landing/AnalyticsSection";
import ReportsSection from "../components/landing/ReportsSection";
import SecuritySection from "../components/landing/SecuritySection";
import TechnologySection from "../components/landing/TechnologySection";
import FAQSection from "../components/landing/FAQSection";
import CTASection from "../components/landing/CTASection";
import LandingFooter from "../components/landing/LandingFooter";
import ScrollToTop from "../components/landing/ScrollToTop";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#E4E5DB] text-[#152A38] font-sans antialiased selection:bg-[#2F5241]/20 selection:text-[#152A38] relative overflow-x-hidden">
      {/* Top Scroll Indicator Bar */}
      <ScrollProgress />

      {/* Floating Enterprise Navigation Bar */}
      <LandingNavbar />

      {/* Main Public Website Flow */}
      <main>
        {/* 1. Hero Section with Interactive Product Preview */}
        <HeroSection />

        {/* 2. Trust Strip */}
        <TrustSection />

        {/* 3. The Problem Storytelling Section */}
        <ProblemSection />

        {/* 4. Platform Overview Showcase (Interactive Dashboard Tabs) */}
        <PlatformOverview />

        {/* 5. Platform Enterprise Modules */}
        <ModulesSection />

        {/* 6. AI Multimodal Document Ingestion Pipeline */}
        <AISection />

        {/* 7. Carbon Analytics Showcase */}
        <AnalyticsSection />

        {/* 8. 14-Section ESG Compliance Reporting */}
        <ReportsSection />

        {/* 9. Enterprise Security Architecture */}
        <SecuritySection />

        {/* 10. Technology Stack Visualization */}
        <TechnologySection />

        {/* 11. Enterprise Knowledge Base FAQ Accordion */}
        <FAQSection />

        {/* 12. Call To Action Conversion Banner */}
        <CTASection />
      </main>

      {/* Enterprise Footer */}
      <LandingFooter />

      {/* Back to Top Floating Action Button */}
      <ScrollToTop />
    </div>
  );
};

export default Landing;
