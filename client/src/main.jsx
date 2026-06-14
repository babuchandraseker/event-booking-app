import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {/* silently fail in dev */});
  });
}
import './tailwind.css'
import './style.css'
import './styles/site-shell.css'
import './styles/cinematic-atmosphere.css'
import './styles/cinematic-hero.css'
import './styles/hero-luxury-split.css'
import './styles/navbar-hero-layout.css'
import './styles/luxury-landing-theme.css'
import './styles/soft-luxury-light.css'
import './styles/hero-mobile-luxury.css'
import './styles/theme-experience-luxury.css'
import './styles/why-faq-separated.css'
import App from './App.jsx'
import { HeroContentProvider } from './context/HeroContentContext.jsx'
import { PackagesProvider } from './context/PackagesContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeroContentProvider>
      <PackagesProvider>
        <BookingProvider>
          <App />
        </BookingProvider>
      </PackagesProvider>
    </HeroContentProvider>
  </StrictMode>,
)
