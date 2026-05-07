import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ThemeSection from "./components/ThemeSection";
import CinematicModal from "./components/CinematicModal";
import CelebrationsSection from "./components/CelebrationsSection";
import PricingSection from "./components/PricingSection";
import PriceEstimator from "./components/PriceEstimator";
import BookingSection from "./components/BookingSection";
import AddonsSection from "./components/AddonsSection";
import HowItWorks from "./components/HowItWorks";
import TrustSection from "./components/TrustSection";
import MemoryGallery from "./components/MemoryGallery";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";

import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import Bookings from "./admin/Bookings";
import ProtectedRoute from "./admin/ProtectedRoute";

import { useReveal } from "./hooks/useReveal";

const BASE = "/control-panel-7x9";

function HomePage() {
  const [activeTheme, setActiveTheme] = useState(null);
  useReveal();

  return (
    <>
      <div className="noise-overlay" aria-hidden="true"></div>
      <Navbar />

      <main>
        <HeroSection />
        <ThemeSection onOpenModal={setActiveTheme} />
        <CelebrationsSection />
        <PricingSection />
        <PriceEstimator />
        <BookingSection />
        <AddonsSection />
        <HowItWorks />
        <TrustSection />
        <MemoryGallery />
        <CtaSection />
      </main>

      <Footer />

      <a
        href="https://wa.me/919999999999"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        💬
      </a>

      {activeTheme && (
        <CinematicModal
          themeKey={activeTheme}
          onClose={() => setActiveTheme(null)}
        />
      )}
    </>
  );
}

export default function App() {
  const path = window.location.pathname;
  const isAdminPath = path === BASE || path.startsWith(`${BASE}/`);

  return (
    <BrowserRouter>
      <Routes>

        {!isAdminPath && <Route path="*" element={<HomePage />} />}

        <Route path={`${BASE}/login`} element={<Login />} />

        <Route
          path={`${BASE}/dashboard`}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${BASE}/bookings`}
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />

        <Route path={BASE} element={<Navigate to={`${BASE}/login`} replace />} />
        <Route path={`${BASE}/*`} element={<Navigate to={`${BASE}/login`} replace />} />

      </Routes>
    </BrowserRouter>
  );
}
