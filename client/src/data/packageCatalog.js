// DEFAULT_PACKAGES defines structure, pricing, and descriptions only.
// img fields have been removed — images come exclusively from the API (Firestore/ImageKit).
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
      { name: 'Room Filled with Balloon', price: 350, desc: 'Transform your room into a sea of celebration balloons.' },
      { name: 'Flower Bouquet', price: 300, desc: 'Fresh hand-crafted floral bouquet to cherish the moment.' },
      { name: '15 Photo Hanging', price: 250, desc: 'Display your favourite 15 memories on a lit string wall.' },
      { name: 'Entry Video & 15min Group Photos', price: 350, desc: 'Capture your grand entry on video plus 15 min group photo session.' },
      { name: 'Fog Entry', price: 500, desc: 'Dramatic fog machine entry for a breathtaking entrance.' },
      { name: 'Red Carpet Path', price: 300, desc: 'Walk in like a star with a VIP red carpet entrance.' },
      { name: 'Candle Path Way', price: 500, desc: 'Romantic tealight candles lining your path into the room.' },
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
      { name: 'Room Filled with Balloon', price: 350, desc: 'Transform your room into a sea of celebration balloons.' },
      { name: 'Flower Bouquet', price: 300, desc: 'Fresh hand-crafted floral bouquet to cherish the moment.' },
      { name: '15 Photo Hanging', price: 250, desc: 'Display your favourite 15 memories on a lit string wall.' },
      { name: 'Entry Video & 15min Group Photos', price: 350, desc: 'Capture your grand entry on video plus 15 min group photo session.' },
      { name: 'Fog Entry', price: 500, desc: 'Dramatic fog machine entry for a breathtaking entrance.' },
      { name: 'Red Carpet Path', price: 300, desc: 'Walk in like a star with a VIP red carpet entrance.' },
      { name: 'Candle Path Way', price: 500, desc: 'Romantic tealight candles lining your path into the room.' },
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
      { name: 'Room Filled with Balloon', price: 350, desc: 'Transform your room into a sea of celebration balloons.' },
      { name: 'Flower Bouquet', price: 300, desc: 'Fresh hand-crafted floral bouquet to cherish the moment.' },
      { name: '15 Photo Hanging', price: 250, desc: 'Display your favourite 15 memories on a lit string wall.' },
      { name: 'Entry Video & 15min Group Photos', price: 350, desc: 'Capture your grand entry on video plus 15 min group photo session.' },
      { name: 'Fog Entry', price: 500, desc: 'Dramatic fog machine entry for a breathtaking entrance.' },
      { name: 'Red Carpet Path', price: 300, desc: 'Walk in like a star with a VIP red carpet entrance.' },
      { name: 'Candle Path Way', price: 500, desc: 'Romantic tealight candles lining your path into the room.' },
      { name: 'Cake 1/2 KG', price: 450, desc: 'Delicious half-kg custom celebration cake for your special day.' },
    ],
    active: true,
  },
];

export { API_BASE_URL } from '../config/api.js'

export function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN')
}

// ---------------------------------------------------------------------------
// mergePackages
//
// Takes the raw array returned by GET /api/packages and fills in any
// structural gaps using DEFAULT_PACKAGES (title, price, included list, etc).
//
// IMAGE RULE: addon.img is taken exclusively from the API response.
//   - If the API returns an img value (ImageKit URL), it is used as-is.
//   - If the API returns no img (empty / absent), img stays empty.
//   - No local file path is ever injected here.
// ---------------------------------------------------------------------------
export function mergePackages(remotePackages = []) {
  const byId = new Map(remotePackages.map((pkg) => [pkg.id, pkg]))

  const defaultIds = new Set(DEFAULT_PACKAGES.map((p) => p.id))

  const merged = DEFAULT_PACKAGES.map((def) => {
    const remote = byId.get(def.id)

    // No Firestore doc yet — use the structural default but with empty addon imgs.
    if (!remote) return def

    // Merge: remote (Firestore) values win for every scalar field.
    // For addons, use the remote array directly so ImageKit URLs flow through
    // untouched. Fill in desc from the local default only when the API omits it
    // (desc is never uploaded, only img/price/name come from admin edits).
    const defAddonsByName = new Map((def.addons || []).map((a) => [a.name, a]))

    const addons = (remote.addons || []).map((a) => {
      const defAddon = defAddonsByName.get(a.name) || {}
      return {
        // Start from the API addon — img, price, emoji, fileId, _originalName all come from here
        ...a,
        // desc: use API value if present, otherwise fall back to local default text only
        desc: a.desc || defAddon.desc || '',
        // img: ONLY from API — never injected from local files
        img: a.img || '',
      }
    })

    return {
      ...def,
      ...remote,
      // freeAddonNames: prefer Firestore value; fall back to structural default
      freeAddonNames: Array.isArray(remote.freeAddonNames)
        ? remote.freeAddonNames
        : (def.freeAddonNames || []),
      // included: prefer Firestore value if saved; fall back to structural default
      included: (Array.isArray(remote.included) && remote.included.length > 0)
        ? remote.included
        : (def.included || []),
      addons,
      price: Number(remote.price ?? def.price ?? 0),
      maxGuests: Number(remote.maxGuests ?? def.maxGuests ?? 1),
      active: remote.active !== false,
      visible: remote.visible !== undefined ? remote.visible : true,
    }
  })

  // Include any packages in Firestore that are not in DEFAULT_PACKAGES (custom ones)
  const extras = remotePackages.filter((pkg) => !defaultIds.has(pkg.id))
  return [...merged, ...extras]
}

export async function fetchPackages() {
  const response = await fetch(`${API_BASE_URL}/packages`)
  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not load packages.')
  }

  const packages = mergePackages(result.data)

  // Log each addon's image source so it's visible in DevTools
  packages.forEach((pkg) => {
    ;(pkg.addons || []).forEach((a) => {
      console.log(`[Package API] pkg="${pkg.id}" addon="${a.name}" img="${a.img || '(none)'}"`)
    })
  })

  return packages
}
