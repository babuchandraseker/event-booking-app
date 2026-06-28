/**
 * availabilityCache — shared in-memory cache for slot availability responses.
 *
 * Shared between bookingController and adminController so that both booking
 * mutations and blocked-slot mutations properly invalidate stale cache entries.
 *
 * TTL: 60 seconds. Any write (create/update/delete booking, add/remove blocked
 * slot) clears the entire cache so the next read is always authoritative.
 */
const CACHE_TTL_MS = 60_000;
const _cache = new Map(); // eventDate → { data, expiresAt }

function get(eventDate) {
  const entry = _cache.get(eventDate);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _cache.delete(eventDate);
    return null;
  }
  return entry.data;
}

function set(eventDate, data) {
  _cache.set(eventDate, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function invalidate() {
  _cache.clear();
}

module.exports = { get, set, invalidate };
