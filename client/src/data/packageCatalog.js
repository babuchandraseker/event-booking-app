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
    freeAddonNames: [],
    addons: [
      { name: 'Room Filled with Balloon', price: 350, desc: 'Transform your room into a sea of celebration balloons.', img: '/addons/balloons.webp' },
      { name: 'Flower Bouquet', price: 300, desc: 'Fresh hand-crafted floral bouquet to cherish the moment.', img: '/addons/bouquet_gen.webp' },
      { name: '15 Photo Hanging', price: 250, desc: 'Display your favourite 15 memories on a lit string wall.', img: '/addons/photo_hanging.webp' },
      { name: 'Entry Video & 15min Group Photos', price: 350, desc: 'Capture your grand entry on video plus 15 min group photo session.', img: '/addons/photographer.webp' },
      { name: 'Fog Entry', price: 500, desc: 'Dramatic fog machine entry for a breathtaking entrance.', img: '/addons/fog_gen.webp' },
      { name: 'Red Carpet Path', price: 300, desc: 'Walk in like a star with a VIP red carpet entrance.', img: '/addons/red_carpet.webp' },
      { name: 'Candle Path Way', price: 500, desc: 'Romantic tealight candles lining your path into the room.', img: '/addons/candle_path.webp' },
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
    freeAddonNames: [
      'Room Filled with Balloon',
      'Flower Bouquet',
      '15 Photo Hanging',
      'Entry Video & 15min Group Photos',
    ],
    addons: [
      { name: 'Room Filled with Balloon', price: 350, desc: 'Transform your room into a sea of celebration balloons.', img: '/addons/balloons.webp' },
      { name: 'Flower Bouquet', price: 300, desc: 'Fresh hand-crafted floral bouquet to cherish the moment.', img: '/addons/bouquet_gen.webp' },
      { name: '15 Photo Hanging', price: 250, desc: 'Display your favourite 15 memories on a lit string wall.', img: '/addons/photo_hanging.webp' },
      { name: 'Entry Video & 15min Group Photos', price: 350, desc: 'Capture your grand entry on video plus 15 min group photo session.', img: '/addons/photographer.webp' },
      { name: 'Fog Entry', price: 500, desc: 'Dramatic fog machine entry for a breathtaking entrance.', img: '/addons/fog_gen.webp' },
      { name: 'Red Carpet Path', price: 300, desc: 'Walk in like a star with a VIP red carpet entrance.', img: '/addons/red_carpet.webp' },
      { name: 'Candle Path Way', price: 500, desc: 'Romantic tealight candles lining your path into the room.', img: '/addons/candle_path.webp' },
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
    addons: [
      { name: 'Room Filled with Balloon', price: 350, desc: 'Transform your room into a sea of celebration balloons.', img: '/addons/balloons.webp' },
      { name: 'Flower Bouquet', price: 300, desc: 'Fresh hand-crafted floral bouquet to cherish the moment.', img: '/addons/bouquet_gen.webp' },
      { name: '15 Photo Hanging', price: 250, desc: 'Display your favourite 15 memories on a lit string wall.', img: '/addons/photo_hanging.webp' },
      { name: 'Entry Video & 15min Group Photos', price: 350, desc: 'Capture your grand entry on video plus 15 min group photo session.', img: '/addons/photographer.webp' },
      { name: 'Fog Entry', price: 500, desc: 'Dramatic fog machine entry for a breathtaking entrance.', img: '/addons/fog_gen.webp' },
      { name: 'Red Carpet Path', price: 300, desc: 'Walk in like a star with a VIP red carpet entrance.', img: '/addons/red_carpet.webp' },
      { name: 'Candle Path Way', price: 500, desc: 'Romantic tealight candles lining your path into the room.', img: '/addons/candle_path.webp' },
      { name: 'Cake 1/2 KG', price: 450, desc: 'Delicious half-kg custom celebration cake for your special day.', img: '/addons/cake.webp' },
    ],
    active: true,
  },
];

export { API_BASE_URL } from '../config/api.js'

export function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN')
}

export function normalizePackage(pkg, fallback = {}) {
  // Build a lookup of fallback addons by name so we can fill in desc/img
  const fallbackAddonMap = new Map((fallback.addons || []).map((a) => [a.name, a]));

  // Also build a master catalog from ALL default packages so img/desc never go missing
  // even if the server returned an addon without those fields.
  const masterCatalog = new Map();
  DEFAULT_PACKAGES.forEach((p) => (p.addons || []).forEach((a) => {
    if (!masterCatalog.has(a.name)) masterCatalog.set(a.name, a);
  }));

  // Build a map from _originalName → current name so we can remap freeAddonNames
  // when an admin renames an addon. Without this, a renamed addon loses its "free" status.
  const originalToCurrentName = new Map();
  const rawAddons = Array.isArray(pkg.addons) ? pkg.addons : (fallback.addons || []);
  for (const a of rawAddons) {
    if (a._originalName && a._originalName !== a.name) {
      originalToCurrentName.set(a._originalName, a.name);
    }
  }

  const mergedAddons = rawAddons.map((addon) => {
    const fb     = fallbackAddonMap.get(addon.name) || fallbackAddonMap.get(addon._originalName) || {};
    const master = masterCatalog.get(addon.name) || masterCatalog.get(addon._originalName) || {};
    return {
      ...addon,
      desc: addon.desc || fb.desc || master.desc || '',
      // img: prefer live API value, then fallback pkg default, then master catalog
      img:  addon.img  || fb.img  || master.img  || '',
      // emoji: live value wins; fall back to static maps
      emoji: addon.emoji !== undefined ? addon.emoji : (fb.emoji || master.emoji || ''),
      _originalName: addon._originalName || addon.name,
    };
  });

  // Remap freeAddonNames: if an addon was renamed, update the free list to use new name
  const baseFreeNames = fallback.freeAddonNames || [];
  const freeAddonNames = baseFreeNames.map((name) => originalToCurrentName.get(name) || name);

  return {
    ...fallback,
    ...pkg,
    id: pkg.id || fallback.id,
    title: pkg.title || fallback.title,
    price: Number(pkg.price ?? fallback.price ?? 0),
    maxGuests: Number(pkg.maxGuests ?? fallback.maxGuests ?? 1),
    // Use API's included if it was saved, otherwise fall back to hardcoded defaults
    included: (Array.isArray(pkg.included) && pkg.included.length > 0)
      ? pkg.included
      : (fallback.included || []),
    freeAddonNames,
    addons: mergedAddons,
    active: pkg.active !== false,
    visible: pkg.visible !== undefined ? pkg.visible : (fallback.visible !== undefined ? fallback.visible : true),
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
