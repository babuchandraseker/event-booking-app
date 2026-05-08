import { useState } from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
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
import Automation from "./admin/Automation";
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
  return (
   <BrowserRouter>
  <Routes>

    {/* Public website */}
    <Route path="/" element={<HomePage />} />

    {/* Admin login */}
    <Route
      path="/control-panel-7x92/login"
      element={<Login />}
    />

    {/* Dashboard */}
    <Route
      path="/control-panel-7x92/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    {/* Bookings */}
    <Route
      path="/control-panel-7x92/bookings"
      element={
        <ProtectedRoute>
          <Bookings />
        </ProtectedRoute>
      }
    />

    {/* Automation */}
    <Route
      path="/control-panel-7x92/automation"
      element={
        <ProtectedRoute>
          <Automation />
        </ProtectedRoute>
      }
    />

  </Routes>
</BrowserRouter>
  );
}