import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import SlotAvailabilitySection from "./components/SlotAvailabilitySection";
import ThemeSection from "./components/ThemeSection";
import ProtectedRoute from "./admin/ProtectedRoute";
import { useReveal } from "./hooks/useReveal";
import { clearQuickReserveContext } from "./utils/bookingContext";
import { scrollToSection } from "./utils/scrollTo";

const ReservePage = lazy(() => import("./components/ReservePage"));
const RealCelebrations = lazy(() => import("./components/RealCelebrations"));
const CustomerReviewsSection = lazy(() => import("./components/CustomerReviewsSection"));
const WhyChooseUsSection = lazy(() => import("./components/WhyChooseUsSection"));
const HowItWorks = lazy(() => import("./components/HowItWorks"));
const FaqSection = lazy(() => import("./components/FaqSection"));
const CtaSection = lazy(() => import("./components/CtaSection"));
const Footer = lazy(() => import("./components/Footer"));
const RomanticScrollytelling = lazy(() => import("./components/RomanticScrollytelling"));
const BirthdayScrollytelling = lazy(() => import("./components/BirthdayScrollytelling"));
const SurpriseScrollytelling = lazy(() => import("./components/SurpriseScrollytelling"));

const Login = lazy(() => import("./admin/Login"));
const Dashboard = lazy(() => import("./admin/Dashboard"));
const Bookings = lazy(() => import("./admin/Bookings"));
const Addons = lazy(() => import("./admin/Addons"));
const Reviews = lazy(() => import("./admin/Reviews"));
const Settings = lazy(() => import("./admin/Settings"));
const Gallery = lazy(() => import("./admin/Gallery"));
const HeroSectionAdmin = lazy(() => import("./admin/HeroSectionAdmin"));
const Themes = lazy(() => import("./admin/Themes"));

const BASE = "/control-panel-7x9";
const SITE_NAME = "A WonderOne Surprise";
const SITE_URL = "https://www.awonderone.com";

const SEO_CONFIG = [
  {
    match: (path) => path === "/",
    title: `${SITE_NAME} | Luxury Private Event Studio in Chennai`,
    description:
      "A WonderOne Surprise is a premium private event studio in Chennai for romantic celebrations, birthdays, luxury surprises, custom packages, add-ons, and easy online booking.",
    image: "/themes/romantic/romantic1.jpg",
  },
  {
    match: (path) => path === "/experience/romantic",
    title: `Romantic Private Celebration in Chennai | ${SITE_NAME}`,
    description:
      "Plan a romantic private celebration in Chennai with roses, candlelight, curated packages, add-ons, and a private studio experience.",
    image: "/themes/romantic/romantic1.jpg",
  },
  {
    match: (path) => path === "/experience/birthday",
    title: `Birthday Celebration Packages in Chennai | ${SITE_NAME}`,
    description:
      "Book a private birthday celebration in Chennai with themed decor, packages, cakes, add-ons, and easy online reservation.",
    image: "/themes/birthday/bday1.jpeg",
  },
  {
    match: (path) => path === "/experience/surprise",
    title: `Luxury Surprise Event Booking in Chennai | ${SITE_NAME}`,
    description:
      "Create a luxury surprise event in Chennai with reveal moments, premium decor, private studio access, and custom add-ons.",
    image: "/themes/surprise/surprise1.jpeg",
  },
  {
    match: (path) => path.startsWith("/reserve/"),
    title: `Reserve Your Private Event | ${SITE_NAME}`,
    description:
      "Reserve your private event package, choose a date and time slot, add custom extras, and confirm your celebration online.",
    image: "/themes/romantic/romantic1.jpg",
  },
];

function setMeta(selector, attr, value) {
  const tag = document.head.querySelector(selector);
  if (tag) tag.setAttribute(attr, value);
}

function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const isAdmin = path.startsWith(BASE);
    const fallback = SEO_CONFIG[0];
    const seo = SEO_CONFIG.find((item) => item.match(path)) || fallback;
    const canonicalUrl = new URL(path === "*" ? "/" : path, SITE_URL).toString();
    const imageUrl = new URL(seo.image, SITE_URL).toString();

    document.title = isAdmin ? `${SITE_NAME} Admin` : seo.title;
    setMeta('meta[data-seo="robots"]', "content", isAdmin ? "noindex, nofollow" : "index, follow");
    setMeta('meta[data-seo="description"]', "content", seo.description);
    setMeta('meta[data-seo="og:type"]', "content", "website");
    setMeta('meta[data-seo="og:title"]', "content", seo.title);
    setMeta('meta[data-seo="og:url"]', "content", canonicalUrl);
    setMeta('meta[data-seo="og:description"]', "content", seo.description);
    setMeta('meta[data-seo="og:image"]', "content", imageUrl);
    setMeta('meta[data-seo="twitter:title"]', "content", seo.title);
    setMeta('meta[data-seo="twitter:description"]', "content", seo.description);
    setMeta('meta[data-seo="twitter:image"]', "content", imageUrl);
    setMeta('link[data-seo="canonical"]', "href", isAdmin ? window.location.origin : canonicalUrl);
    document.body.classList.toggle("admin-route", isAdmin);
  }, [location.pathname]);

  return null;
}

function HomePage() {
  const scrollToThemes = () => {
    clearQuickReserveContext();
    scrollToSection("#themes");
  };

  return (
    <div className="home-cinematic-root">
      <div className="cinematic-atmosphere" aria-hidden="true">
        <div className="cinematic-atmosphere__violet" />
        <div className="cinematic-atmosphere__gold" />
        <div className="cinematic-atmosphere__veil" />
        <div className="cinematic-atmosphere__orbs" />
      </div>
      <div className="noise-overlay" aria-hidden="true"></div>
      <Navbar />
      <HeroSection />
      <div className="hero-mobile-availability-below" aria-label="Studio availability">
        <SlotAvailabilitySection variant="hero" />
      </div>
      <main className="site-main site-main--below-hero" aria-label="Main content">
        <ThemeSection />

        <LazyOnVisible fallbackClassName="section-loading--gallery" label="Loading gallery" sectionId="gallery">
          <RealCelebrations onBook={scrollToThemes} />
        </LazyOnVisible>
        <LazyOnVisible fallbackClassName="section-loading--why" label="Loading highlights" sectionId="why-choose-us">
          <WhyChooseUsSection />
        </LazyOnVisible>
        <LazyOnVisible fallbackClassName="section-loading--how" label="Loading booking steps" sectionId="how-it-works">
          <HowItWorks />
        </LazyOnVisible>
        <div
          aria-hidden
          style={{
            position: 'relative',
            height: 'clamp(32px, 4vw, 56px)',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #0f0b14 0%, #0e0b15 60%, #0e0b15 100%)',
            pointerEvents: 'none',
          }}
        />
        <LazyOnVisible fallbackClassName="section-loading--faq" label="Loading FAQs" sectionId="faq">
          <FaqSection />
        </LazyOnVisible>
        <LazyOnVisible fallbackClassName="section-loading--reviews" label="Loading reviews" sectionId="reviews">
          <CustomerReviewsSection />
        </LazyOnVisible>
        <LazyOnVisible fallbackClassName="section-loading--cta" label="Loading booking call to action" sectionId="book-now">
          <CtaSection />
        </LazyOnVisible>
      </main>
      <LazyOnVisible fallbackClassName="section-loading--footer" label="Loading footer" sectionId="footer">
        <Footer />
      </LazyOnVisible>
    </div>
  );
}

function PageFallback() {
  return (
    <main className="route-loading" aria-label="Loading page" aria-busy="true">
      <span>Loading...</span>
    </main>
  );
}

function SectionFallback({ className = "", label }) {
  return (
    <section
      className={`section-loading ${className}`}
      aria-label={label}
      aria-busy="true"
    >
      <span>Loading...</span>
    </section>
  );
}

/**
 * LazyOnVisible — renders children only when the placeholder enters the
 * viewport, preserving performance. Navigation fix: also listens for the
 * "wonderone:navigate" custom event so that clicking a navbar link triggers
 * an immediate render even before the user has scrolled to the section.
 *
 * The wrapper <div> ALWAYS carries the sectionId as its DOM id so that
 * scrollToSection's querySelector can find the element immediately and
 * scroll to it; the IntersectionObserver then fires due to the scroll,
 * rendering the real content right on cue.
 */
function LazyOnVisible({ children, fallbackClassName, label, sectionId }) {
  const ref = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  // IntersectionObserver — original lazy-load behaviour preserved
  useEffect(() => {
    if (shouldRender) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender]);

  // Navigation event — force-render when this section is the scroll target.
  // This fires before IntersectionObserver has a chance to trigger, solving
  // the race condition when the user clicks a nav link without scrolling first.
  useEffect(() => {
    if (!sectionId || shouldRender) return undefined;
    const handler = (e) => {
      if (e.detail && e.detail.sectionId === sectionId) {
        setShouldRender(true);
      }
    };
    window.addEventListener('wonderone:navigate', handler);
    return () => window.removeEventListener('wonderone:navigate', handler);
  }, [sectionId, shouldRender]);

  return (
    // id placed on the wrapper so querySelector('#sectionId') ALWAYS resolves,
    // even before the inner content has rendered.
    <div ref={ref} id={sectionId || undefined}>
      {shouldRender ? (
        <Suspense fallback={<SectionFallback className={fallbackClassName} label={label} />}>
          {children}
        </Suspense>
      ) : (
        <SectionFallback className={fallbackClassName} label={label} />
      )}
    </div>
  );
}

export default function App() {
  useReveal();

  return (
    <BrowserRouter>
      <SeoManager />
      <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Experience pages — untouched, exactly as before */}
        {/* Experience pages */}
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

        <Route
          path={`${BASE}/themes`}
          element={
            <ProtectedRoute>
              <Themes />
            </ProtectedRoute>
          }
        />

        <Route path={BASE} element={<Navigate to={`${BASE}/login`} replace />} />
        <Route path={`${BASE}/*`} element={<Navigate to={`${BASE}/login`} replace />} />

        {/* Main landing page */}
        <Route path="*" element={<HomePage />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
