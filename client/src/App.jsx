import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ThemeSection from "./components/ThemeSection";
import CinematicModal from "./components/CinematicModal";
import CelebrationsSection from "./components/CelebrationsSection";
import BookingSection from "./components/BookingSection";
import PackagesSection from "./components/PackagesSection";
import HowItWorks from "./components/HowItWorks";
import TrustSection from "./components/TrustSection";
import MemoryGallery from "./components/MemoryGallery";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";

import RomanticScrollytelling from "./components/RomanticScrollytelling";
import BirthdayScrollytelling from "./components/BirthdayScrollytelling";
import SurpriseScrollytelling from "./components/SurpriseScrollytelling";

import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import Bookings from "./admin/Bookings";
import ProtectedRoute from "./admin/ProtectedRoute";

import { useReveal } from "./hooks/useReveal";

const BASE = "/control-panel-7x92";

function HomePage() {
  const [activeTheme, setActiveTheme] = useState(null);
  useReveal();

  return (
    <>
      <div className="noise-overlay" aria-hidden="true"></div>
      <Navbar />

      <main>
        <HeroSection />
        <ThemeSection />
        <CelebrationsSection />
        <PackagesSection />
        <BookingSection />
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
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomePage />} />

        <Route path="/experience/romantic" element={<RomanticScrollytelling />} />
        <Route path="/experience/birthday" element={<BirthdayScrollytelling />} />
        <Route path="/experience/surprise" element={<SurpriseScrollytelling />} />

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