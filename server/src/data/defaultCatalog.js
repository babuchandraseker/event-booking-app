const now = () => new Date().toISOString();

const defaultPackages = [
  {
    id: "basic",
    title: "Basic",
    price: 1699,
    duration: "1.5 hours",
    maxGuests: 7,
    popular: false,
    included: [
      { name: "Balloon Decor", free: true, note: "Customised Rs 1,000" },
      { name: "Crown", free: true },
      { name: "Satin Sash Ribbon", free: true, note: "Based on occasion" },
      { name: "Unlimited Music Songs", free: true },
    ],
    addons: [
      { name: "Room Filled with Balloons", price: 350 },
      { name: "Flower Bouquet", price: 300 },
      { name: "15 Photo Hanging", price: 250 },
      { name: "Entry Video & 15 min Group Photos", price: 350 },
      { name: "Fog Entry", price: 500 },
      { name: "Red Carpet Path", price: 300 },
      { name: "Candle Pathway", price: 500 },
    ],
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "premium",
    title: "Premium",
    price: 2700,
    duration: "1.5 hours",
    maxGuests: 7,
    popular: true,
    included: [
      { name: "Balloon Decor", free: true, note: "Customised Rs 1,000" },
      { name: "Crown", free: true },
      { name: "Satin Sash Ribbon", free: true, note: "Based on occasion" },
      { name: "Unlimited Music Songs", free: true },
      { name: "Room Filled with Balloons", price: 350 },
      { name: "Flower Bouquet", price: 300 },
      { name: "15 Photo Hanging", price: 250 },
      { name: "Entry Video & 15 min Group Photos", price: 350 },
    ],
    addons: [
      { name: "Fog Entry", price: 500 },
      { name: "Red Carpet Path", price: 300 },
      { name: "Candle Pathway", price: 500 },
    ],
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "luxury",
    title: "Luxury",
    price: 4500,
    duration: "1.5 hours",
    maxGuests: 10,
    popular: false,
    included: [
      { name: "Balloon Decor", free: true, note: "Customised Rs 1,000" },
      { name: "Crown", free: true },
      { name: "Satin Sash Ribbon", free: true, note: "Based on occasion" },
      { name: "Unlimited Music Songs", free: true },
      { name: "Room Filled with Balloons", free: true },
      { name: "Flower Bouquet", free: true },
      { name: "15 Photo Hanging", free: true },
      { name: "Entry Video & 15 min Group Photos", free: true },
      { name: "Fog Entry", free: true },
      { name: "Red Carpet Path", free: true },
      { name: "Candle Pathway", free: true },
      { name: "Cake 1/2 KG", free: true },
    ],
    addons: [],
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

const DEFAULT_PACKAGE_IDS = new Set(defaultPackages.map((pkg) => pkg.id));

module.exports = {
  DEFAULT_PACKAGE_IDS,
  defaultPackages,
};
