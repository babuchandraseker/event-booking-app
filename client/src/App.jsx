import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ThemeSection from "./components/ThemeSection";
import Footer from "./components/Footer";
import BookingWizard from "./components/booking/BookingWizard";
import ReservePage from "./components/ReservePage";

import RomanticScrollytelling from "./components/RomanticScrollytelling";
import BirthdayScrollytelling from "./components/BirthdayScrollytelling";
import SurpriseScrollytelling from "./components/SurpriseScrollytelling";

import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import Bookings from "./admin/Bookings";
import ProtectedRoute from "./admin/ProtectedRoute";

const BASE = "/control-panel-7x9";

function HomePage({ onStartBooking }) {
  return (
    <>
      <div className="noise-overlay" aria-hidden="true"></div>
      <Navbar onBook={onStartBooking} />
      <main>
        <HeroSection onBook={onStartBooking} />
        <ThemeSection onBook={onStartBooking} />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false);

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
        <Route path={`${BASE}/dashboard`} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path={`${BASE}/bookings`} element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
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

