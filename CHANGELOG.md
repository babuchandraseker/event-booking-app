# Changelog — Firebase Read Optimization

## [Unreleased] — Firestore Excessive Read Fix

### Problem
The application was hitting Firestore's 50,000 daily read limit. Query Insights
showed excessive executions against `bookings` and `blockedSlots` collections,
caused by multiple polling loops running while the app was idle.

---

### Changed

#### `client/src/hooks/useBusinessSettings.js`
**Why:** This hook was called by 5 separate components (Navbar, Footer, CtaSection,
TrustSection, Sidebar). Each component created its own independent 5-second
`setInterval` that hit the `/settings` endpoint (Firestore read). Together they
produced 60 requests/minute on any page that mounted all 5 components.

**Fix:** Removed `setInterval` entirely. Added a module-level singleton cache
(`_cached` + `_fetchPromise`) so all 5 consuming components share a single fetch
result. Settings are fetched once per page-load. Exported `invalidateBusinessSettingsCache()`
for use after admin saves.

---

#### `client/src/hooks/useGallery.js`
**Why:** The admin Gallery page polled `/gallery` (Firestore read) every 5 seconds
via `setInterval`, and also re-fetched on every `window.focus` event (tab switch).

**Fix:** Removed `setInterval` and `window.addEventListener('focus', ...)`. The hook
now fetches once on mount. Added a `refresh()` function returned from the hook for
explicit refetch after admin mutations (upload, delete, reorder).

---

#### `client/src/components/SlotAvailabilitySection.jsx`
**Why:** The `useStudioAvailability` hook ran `Promise.all` across 5 dates (5
parallel API calls) every 30 seconds via `setInterval`, and on every `window.focus`
event. Each server request read the full `bookings` collection AND `blockedSlots`
collection from Firestore. At 50 concurrent visitors this could produce 600,000+
Firestore reads/day.

**Fix:** Removed `setInterval` (30-second polling) and `window.addEventListener('focus', ...)`.
Added `fetchedRef` guard to prevent double-fetch in React StrictMode. Availability
is fetched once on component mount.

---

#### `server/src/services/availabilityCache.js` *(new file)*
**Why:** Even with client-side polling removed, multiple visitors loading the page
simultaneously would still trigger parallel Firestore reads. A server-side TTL cache
eliminates redundant Firestore round-trips.

**What:** In-memory key-value cache keyed by `eventDate`. TTL: 60 seconds. Shared
module so both `bookingController` and `adminController` can invalidate it on writes.

---

#### `server/src/controllers/bookingController.js`
**Why:** The `getSlotAvailability` handler read the full `bookings` and `blockedSlots`
Firestore collections on every request, with no caching.

**Fix:**
- Integrated `availabilityCache` — serve cached response when available (< 60 s old).
- Invalidate cache on `createBooking`, `updateBooking`, `updateBookingStatus`,
  `deleteBooking` to ensure fresh data after writes.
- Added `X-Availability-Cache: HIT/MISS` response header for observability.

---

#### `server/src/controllers/adminController.js`
**Why:** Admin creating or removing blocked slots would leave stale availability data
in the cache.

**Fix:** Invalidate `availabilityCache` after `createBlockedSlot` and `deleteBlockedSlot`.

---

### Not Changed
- All UI components, styling, and layouts — untouched
- Routing and authentication — untouched
- Booking wizard flow — untouched
- Payment flow — untouched
- Admin CRUD functionality — untouched
- Business logic — untouched
- All other API endpoints — untouched
