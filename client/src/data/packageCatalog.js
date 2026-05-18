export const DEFAULT_PACKAGES = [
  {
    id: 'basic',
    title: 'Silver',
    price: 1699,
    duration: '1.5 hours',
    maxGuests: 7,
    popular: false,
    included: [
      { name: 'Balloon Decor', free: true, note: 'Customised Rs 1,000' },
      { name: 'Crown', free: true },
      { name: 'Satin Sash Ribbon', free: true, note: 'Based upon your Occasion' },
      { name: 'Unlimited Music Songs', free: true },
    ],
    // Addons available to purchase for this package
    freeAddonNames: [],
    addons: [
      { name: 'Room Filled with Balloon', price: 350 },
      { name: 'Flower Bouquet', price: 300 },
      { name: '15 Photo Hanging', price: 250 },
      { name: 'Entry Video & 15min Group Photos', price: 350 },
      { name: 'Fog Entry', price: 500 },
      { name: 'Red Carpet Path', price: 300 },
      { name: 'Candle Path Way', price: 500 },
    ],
    active: true,
  },
  {
    id: 'premium',
    title: 'Gold',
    price: 2700,
    duration: '1.5 hours',
    maxGuests: 7,
    popular: true,
    included: [
      { name: 'Balloon Decor', free: true, note: 'Customised Rs 1,000' },
      { name: 'Crown', free: true },
      { name: 'Satin Sash Ribbon', free: true, note: 'Based upon your Occasion' },
      { name: 'Unlimited Music Songs', free: true },
      { name: 'Room Filled with Balloon', free: true },
      { name: 'Flower Bouquet', free: true },
      { name: '15 Photo Hanging', free: true },
      { name: 'Entry Video & 15min Group Photos', free: true },
    ],
    // These addon names come FREE — used by getPackageAddons for green dot logic
    freeAddonNames: [
      'Room Filled with Balloon',
      'Flower Bouquet',
      '15 Photo Hanging',
      'Entry Video & 15min Group Photos',
    ],
    addons: [
      { name: 'Fog Entry', price: 500 },
      { name: 'Red Carpet Path', price: 300 },
      { name: 'Candle Path Way', price: 500 },
    ],
    active: true,
  },
  {
    id: 'luxury',
    title: 'Platinum',
    price: 4500,
    duration: '1.5 hours',
    maxGuests: 10,
    popular: false,
    included: [
      { name: 'Balloon Decor', free: true, note: 'Customised Rs 1,000' },
      { name: 'Crown', free: true },
      { name: 'Satin Sash Ribbon', free: true, note: 'Based upon your Occasion' },
      { name: 'Unlimited Music Songs', free: true },
      { name: 'Room Filled with Balloon', free: true },
      { name: 'Flower Bouquet', free: true },
      { name: '15 Photo Hanging', free: true },
      { name: 'Entry Video & 15min Group Photos', free: true },
      { name: 'Fog Entry', free: true },
      { name: 'Red Carpet Path', free: true },
      { name: 'Candle Path Way', free: true },
      { name: 'Cake 1/2 KG', free: true },
    ],
    // ALL addons are free in Platinum
    freeAddonNames: [
      'Room Filled with Balloon',
      'Flower Bouquet',
      '15 Photo Hanging',
      'Entry Video & 15min Group Photos',
      'Fog Entry',
      'Red Carpet Path',
      'Candle Path Way',
      'Cake 1/2 KG',
    ],
    addons: [],
    active: true,
  },
];

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN')
}

export function normalizePackage(pkg, fallback = {}) {
  // Always take price/title/maxGuests from API if present, but
  // keep included + freeAddonNames from fallback (source of truth for green dot logic)
  return {
    ...fallback,
    ...pkg,
    id: pkg.id || fallback.id,
    title: pkg.title || fallback.title,
    price: Number(pkg.price ?? fallback.price ?? 0),
    maxGuests: Number(pkg.maxGuests ?? fallback.maxGuests ?? 1),
    // Always use fallback's included and freeAddonNames — never overwrite from API
    included: fallback.included || [],
    freeAddonNames: fallback.freeAddonNames || [],
    addons: Array.isArray(pkg.addons) ? pkg.addons : (fallback.addons || []),
    active: pkg.active !== false,
  }
}

export function mergePackages(remotePackages = []) {
  const byId = new Map(remotePackages.map((pkg) => [pkg.id, pkg]))
  return DEFAULT_PACKAGES.map((fallback) => normalizePackage(byId.get(fallback.id) || {}, fallback))
}

export async function fetchPackages() {
  const response = await fetch(`${API_BASE_URL}/packages`)
  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not load packages.')
  }

  return mergePackages(result.data)
}