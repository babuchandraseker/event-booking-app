/**
 * Production-safe smooth scroll to a CSS selector / element ID.
 *
 * Fix: Sections wrapped in LazyOnVisible are only mounted after they enter
 * the viewport. Before that, the element doesn't exist in the DOM — so
 * querySelector returns null and polling times out.
 *
 * Solution: We dispatch a custom "wonderone:navigate" event FIRST, which
 * LazyOnVisible components listen to. When a matching sectionId receives
 * this event, it immediately force-renders the section (setShouldRender(true))
 * without waiting for IntersectionObserver. The element is then created,
 * querySelector succeeds, and we smooth-scroll to it.
 *
 * The wrapper <div> in LazyOnVisible always carries the sectionId as its id,
 * so scrollToSection can find it even before the inner content renders.
 */

const MAX_WAIT_MS = 4000
const POLL_INTERVAL_MS = 50

/**
 * Wait until `document.querySelector(selector)` resolves, then scroll to it.
 * Also fires a "wonderone:navigate" event so LazyOnVisible can pre-render.
 *
 * @param {string} selector  CSS selector, e.g. "#how-it-works"
 * @param {ScrollBehavior} behavior  "smooth" | "auto"  (default: "smooth")
 */
export function scrollToSection(selector, behavior = 'smooth') {
  // Fire the navigation event first — LazyOnVisible sections will
  // force-render immediately when they see their sectionId targeted.
  const sectionId = selector.startsWith('#') ? selector.slice(1) : selector
  try {
    window.dispatchEvent(
      new CustomEvent('wonderone:navigate', { detail: { sectionId } })
    )
  } catch (_) {
    // CustomEvent not supported in very old browsers — graceful fallback
  }

  const attempt = (deadline) => {
    const el = document.querySelector(selector)
    if (el) {
      // Defer one rAF so any layout from menu-close / state-update settles first
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior, block: 'start' })
      })
      return
    }
    if (Date.now() < deadline) {
      setTimeout(() => attempt(deadline), POLL_INTERVAL_MS)
    }
  }

  attempt(Date.now() + MAX_WAIT_MS)
}
