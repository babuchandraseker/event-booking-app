import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ThemeSection from './components/ThemeSection';
import CinematicModal from './components/CinematicModal';
import CelebrationsSection from './components/CelebrationsSection';
import PricingSection from './components/PricingSection';
import PriceEstimator from './components/PriceEstimator';
import BookingSection from './components/BookingSection';
import AddonsSection from './components/AddonsSection';
import HowItWorks from './components/HowItWorks';
import TrustSection from './components/TrustSection';
import MemoryGallery from './components/MemoryGallery';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import { useReveal } from './hooks/useReveal';

export default function App() {
  const [activeTheme, setActiveTheme] = useState(null);

  // Re-run reveal observer whenever sections render
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
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
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
