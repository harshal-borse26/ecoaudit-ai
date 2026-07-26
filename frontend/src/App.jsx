import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import { RefreshCw } from "lucide-react";

// Lazy load heavy page routes for smaller initial bundle and faster load
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Facilities = lazy(() => import("./pages/Facilities"));
const FacilityDetail = lazy(() => import("./pages/FacilityDetail"));
const Bills = lazy(() => import("./pages/Bills"));
const Reports = lazy(() => import("./pages/Reports"));
const Profile = lazy(() => import("./pages/Profile"));

const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
    <div className="w-12 h-12 rounded-2xl bg-[#EAF2ED] flex items-center justify-center mb-3">
      <RefreshCw className="w-5 h-5 animate-spin text-[#2F5241]" />
    </div>
    <p className="text-xs font-extrabold text-[#7A8597] tracking-wide uppercase">
      Loading EcoAudit Workspace…
    </p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/facilities/:id" element={<FacilityDetail />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;