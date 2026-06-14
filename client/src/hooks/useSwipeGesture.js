/**
 * useSwipeGesture — attaches touch + mouse-drag swipe detection to a DOM element.
 *
 * ── WHY THIS WAS REWRITTEN ────────────────────────────────────────────────────
 * The original hook accepted a React ref object and used a useEffect with
 * dependency array [ref, threshold, velocityThreshold, lockAngle].
 *
 * This caused a production bug where touch listeners were NEVER attached:
 *
 *   1. CinematicHero renders a loading skeleton (no ref={sectionRef}) while
 *      hero content loads from the API.
 *   2. useSwipeGesture's effect fires immediately on mount → ref.current is null
 *      → el is null → the effect returns early without attaching any listeners.
 *   3. Data loads → component re-renders with the real <section ref={sectionRef}>.
 *   4. The effect does NOT re-run because [ref, threshold, velocityThreshold,
 *      lockAngle] is unchanged — the ref object identity is the same even though
 *      ref.current now points to a real DOM node.
 *   5. Result: zero touch listeners. Only mousedown worked because it was attached
 *      in a SEPARATE useEffect with [count] in deps, which DID re-run on data load.
 *
 * ── FIX ───────────────────────────────────────────────────────────────────────
 * Accept a raw DOM node (or null) instead of a ref object. The caller uses a
 * useCallback ref (ref={setNodeRef}) so React calls setNodeRef(domNode) the
 * instant the element is inserted into the DOM. CinematicHero passes that node
 * via useState, which triggers a re-render → this hook re-runs with a real el.
 *
 * Alternatively the caller can pass sectionRef.current after the element mounts.
 * Either way, when `el` changes from null → HTMLElement, the effect re-runs and
 * attaches all listeners correctly.
 *
 * getEventListeners(document.querySelector('.cinematic-hero')) will now show:
 *   touchstart, touchmove, touchend, touchcancel, mousedown, mousemove,
 *   mouseup, mouseleave
 *
 * @param {HTMLElement|null} el          - the DOM element to attach listeners to
 * @param {() => void}       onSwipeLeft  - called when user swipes left  (→ next)
 * @param {() => void}       onSwipeRight - called when user swipes right (→ prev)
 * @param {object}           [opts]
 * @param {number}           [opts.threshold=48]          - min px horizontal travel
 * @param {number}           [opts.velocityThreshold=0.28] - min px/ms for fast swipes
 * @param {number}           [opts.lockAngle=30]          - degrees; steeper = cancel
 */
import { useEffect, useRef } from 'react'

export function useSwipeGesture(el, onSwipeLeft, onSwipeRight, opts = {}) {
  const {
    threshold         = 48,
    velocityThreshold = 0.28,
    lockAngle         = 30,
  } = opts

  // Keep callbacks in refs so the closure never goes stale
  const onLeftRef  = useRef(onSwipeLeft)
  const onRightRef = useRef(onSwipeRight)
  useEffect(() => { onLeftRef.current  = onSwipeLeft  }, [onSwipeLeft])
  useEffect(() => { onRightRef.current = onSwipeRight }, [onSwipeRight])

  // Re-run whenever `el` changes (null → node when hero finishes loading)
  useEffect(() => {
    if (!el) return   // still in loading state — no-op, will re-run when el arrives

    console.log('[swipe] attaching listeners to', el.className || el.tagName)

    // Gesture state — plain object, no re-renders
    const s = {
      active:    false,
      startX:    0,
      startY:    0,
      startTime: 0,
      locked:    false,  // true = decided this is a vertical scroll, abort swipe
    }

    // ── Shared gesture logic ─────────────────────────────────────────────────

    function start(x, y) {
      s.active    = true
      s.startX    = x
      s.startY    = y
      s.startTime = performance.now()
      s.locked    = false
      console.log('touchstart', { x: Math.round(x), y: Math.round(y) })
    }

    function move(x, y, e) {
      if (!s.active || s.locked) return

      const dx = x - s.startX
      const dy = y - s.startY

      // Wait for at least 5px of movement before committing to a direction
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return

      const angle = Math.abs(Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI))

      if (angle > lockAngle) {
        // Too vertical — this is a page scroll, cancel the gesture
        s.locked = true
        console.log('touchmove — vertical scroll detected, swipe cancelled', {
          angle: angle.toFixed(1) + '°',
        })
        return
      }

      // Horizontal intent confirmed — block native scroll so the page doesn't jump
      if (e && e.cancelable) e.preventDefault()
      console.log('touchmove', { dx: Math.round(dx), angle: angle.toFixed(1) + '°' })
    }

    function end(x) {
      if (!s.active || s.locked) {
        s.active = false
        return
      }
      s.active = false

      const dx       = x - s.startX
      const dt       = performance.now() - s.startTime
      const velocity = dt > 0 ? Math.abs(dx) / dt : 0
      const absDx    = Math.abs(dx)
      const triggered = absDx >= threshold || velocity >= velocityThreshold

      console.log('touchend', {
        dx:       Math.round(dx),
        ms:       Math.round(dt),
        velocity: velocity.toFixed(3) + 'px/ms',
        triggered,
      })

      if (!triggered) return

      if (dx < 0) {
        console.log('swipe left')
        onLeftRef.current?.()
      } else {
        console.log('swipe right')
        onRightRef.current?.()
      }
    }

    // ── Touch handlers ────────────────────────────────────────────────────────

    function onTouchStart(e) {
      const t = e.touches[0]
      start(t.clientX, t.clientY)
    }

    function onTouchMove(e) {
      const t = e.touches[0]
      move(t.clientX, t.clientY, e)
    }

    function onTouchEnd(e) {
      const t = e.changedTouches[0]
      end(t.clientX)
    }

    function onTouchCancel() {
      s.active = false
    }

    // ── Mouse handlers (desktop drag) ─────────────────────────────────────────

    function onMouseDown(e) {
      if (e.button !== 0) return  // primary button only
      start(e.clientX, e.clientY)
    }

    function onMouseMove(e) {
      move(e.clientX, e.clientY, e)
    }

    function onMouseUp(e) {
      end(e.clientX)
    }

    function onMouseLeave() {
      s.active = false
    }

    // ── Attach ───────────────────────────────────────────────────────────────
    // touchmove is passive:false so we can call preventDefault() on horizontal swipes.
    // All others are passive:true (no preventDefault needed → browser can optimise).
    el.addEventListener('touchstart',  onTouchStart,  { passive: true })
    el.addEventListener('touchmove',   onTouchMove,   { passive: false })
    el.addEventListener('touchend',    onTouchEnd,    { passive: true })
    el.addEventListener('touchcancel', onTouchCancel, { passive: true })

    el.addEventListener('mousedown',   onMouseDown)
    el.addEventListener('mousemove',   onMouseMove)
    el.addEventListener('mouseup',     onMouseUp)
    el.addEventListener('mouseleave',  onMouseLeave)

    return () => {
      el.removeEventListener('touchstart',  onTouchStart)
      el.removeEventListener('touchmove',   onTouchMove)
      el.removeEventListener('touchend',    onTouchEnd)
      el.removeEventListener('touchcancel', onTouchCancel)
      el.removeEventListener('mousedown',   onMouseDown)
      el.removeEventListener('mousemove',   onMouseMove)
      el.removeEventListener('mouseup',     onMouseUp)
      el.removeEventListener('mouseleave',  onMouseLeave)
      console.log('[swipe] listeners removed from', el.className || el.tagName)
    }
  }, [el, threshold, velocityThreshold, lockAngle])
  // ↑ `el` is a DOM node (or null). When the hero finishes loading and renders
  //   its real <section>, CinematicHero passes the new node here → effect re-runs
  //   → all 8 listeners are attached to the actual element. ✓
}
