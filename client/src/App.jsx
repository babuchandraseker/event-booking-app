import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TrustSection from "./components/TrustSection";
import ThemeSection from "./components/ThemeSection";
import RealCelebrations from "./components/RealCelebrations";
import HowItWorks from "./components/HowItWorks";
import CustomerReviewsSection from "./components/CustomerReviewsSection";
import SlotAvailabilitySection from "./components/SlotAvailabilitySection";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import FaqSection from "./components/FaqSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
import BookingWizard from "./components/booking/BookingWizard";
import ReservePage from "./components/ReservePage";

import RomanticScrollytelling from "./components/RomanticScrollytelling";
import BirthdayScrollytelling from "./components/BirthdayScrollytelling";
import SurpriseScrollytelling from "./components/SurpriseScrollytelling";

import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import Bookings from "./admin/Bookings";
import Addons from "./admin/Addons";
import Reviews from "./admin/Reviews";
import Settings from "./admin/Settings";
import Gallery from "./admin/Gallery";
import HeroSectionAdmin from "./admin/HeroSectionAdmin";
import ProtectedRoute from "./admin/ProtectedRoute";
import { useReveal } from "./hooks/useReveal";

const BASE = "/control-panel-7x9";

function HomePage({ onStartBooking }) {
  return (
    <div className="home-cinematic-root">
      <div className="cinematic-atmosphere" aria-hidden="true">
        <div className="cinematic-atmosphere__violet" />
        <div className="cinematic-atmosphere__gold" />
        <div className="cinematic-atmosphere__veil" />
        <div className="cinematic-atmosphere__orbs" />
      </div>
      <div className="noise-overlay" aria-hidden="true"></div>
      <Navbar onBook={onStartBooking} />
      <main className="site-main site-main--cinematic">
        <HeroSection onBook={onStartBooking} />
        <TrustSection />
        <ThemeSection onBook={onStartBooking} />
        <RealCelebrations onBook={onStartBooking} />
        <HowItWorks />
        <CustomerReviewsSection />
        <SlotAvailabilitySection />
        <WhyChooseUsSection />
        <FaqSection />
        <CtaSection onBook={onStartBooking} />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false);
  useReveal();

  const handleStartBooking = () => {
    setWizardOpen(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Experience pages — untouched, exactly as before */}
        <Route path="/experience/romantic" element={<RomanticScrollytelling />} />
        <Route path="/experience/birthday" element={<BirthdayScrollytelling />} />
        <Route path="/experience/surprise" element={<SurpriseScrollytelling />} />

        {/* Reserve flow — after clicking Reserve on any experience page */}
        <Route path="/reserve/:themeKey" element={<ReservePage />} />

        {/* Admin */}
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

        <Route
          path={`${BASE}/addons`}
          element={
            <ProtectedRoute>
              <Addons />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${BASE}/reviews`}
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${BASE}/settings`}
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${BASE}/gallery`}
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${BASE}/hero-section`}
          element={
            <ProtectedRoute>
              <HeroSectionAdmin />
            </ProtectedRoute>
          }
        />
        <Route path={BASE} element={<Navigate to={`${BASE}/login`} replace />} />
        <Route path={`${BASE}/*`} element={<Navigate to={`${BASE}/login`} replace />} />

        {/* Main landing page */}
        <Route path="*" element={<HomePage onStartBooking={handleStartBooking} />} />
      </Routes>

      {wizardOpen && (
        <BookingWizard
          onClose={() => setWizardOpen(false)}
        />
      )}
    </BrowserRouter>
  );
}

