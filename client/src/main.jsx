import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css'
import './style.css'
import './styles/cinematic-atmosphere.css'
import './styles/cinematic-hero.css'
import App from './App.jsx'
import { HeroContentProvider } from './context/HeroContentContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeroContentProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </HeroContentProvider>
  </StrictMode>,
)