import CinematicSplitHero from './hero/CinematicSplitHero'

/**
 * Landing hero — premium cinematic triptych (Romantic · Birthday · Luxury Surprise).
 * Navbar + booking wizard contract unchanged (`onBook`).
 */
export default function HeroSection({ onBook }) {
  return <CinematicSplitHero onBook={onBook} />
}
