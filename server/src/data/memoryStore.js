const now = () => new Date().toISOString();
const { defaultPackages } = require("./defaultCatalog");
// Hero content uses a JSON-file-backed persistent store so it survives restarts.
const { createPersistedHeroArray } = require("./heroStore");
// Gallery uses a JSON-file-backed persistent store so uploaded images survive restarts.
const { createPersistedGalleryArray } = require("./galleryStore");
const { createPersistedThemeArray } = require("./themeStore");
// Packages now use a JSON-file-backed persistent store so admin edits
// (addon images, prices, descriptions) survive server restarts.
const { createPersistedPackageArray } = require("./packageStore");

const store = {
  bookings: [],
  blockedSlots: [],
  // Persisted to server/src/data/store/packageContent.json — survives restarts.
  // Seeded from defaultCatalog.js only on first startup.
  packages: createPersistedPackageArray(defaultPackages.map((pkg) => ({ ...pkg, createdAt: now(), updatedAt: now() }))),
  addons: [
    {
      id: "addon-cake",
      name: "Cake",
      price: 1200,
      category: "food",
      active: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "addon-photography",
      name: "Photography",
      price: 2500,
      category: "media",
      active: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  reviews: [],
  // Persisted to server/src/data/store/galleryContent.json — survives restarts.
  // Seeded from defaults only on first startup; never overwrites existing saved state.
  gallery: createPersistedGalleryArray(),
  themes: createPersistedThemeArray(),
  // Persisted to server/src/data/store/heroContent.json — survives restarts.
  heroContent: createPersistedHeroArray(),
  contactMessages: [],
  settings: [
    {
      id: "business",
      profileName: "Admin",
      profileEmail: "admin@velvetnights.in",
      businessName: "A WonderOne Suprise",
      tagline: "Private Event Studio",
      description: "Chennai's premier indoor private event studio, crafting unforgettable moments for every occasion. Premium, intimate, and entirely yours.",
      city: "Chennai",
      address: "No.3 ,Railway Colony , 1st Street ,Aminjikarai , Nelson Manickam Road ,Chennai, India, 600029",
      openingHours: "9 AM - 11 PM",
      phone: "+91 99999 99999",
      whatsapp: "+91 99999 99999",
      email: "hello@velvetnights.in",
      instagram: "@velvetnights",
      eventsHosted: "1200",
      fiveStarReviews: "98",
      addonOptions: "50",
      yearsOfExcellence: "4",
      adminPassword: "admin123",
      createdAt: now(),
      updatedAt: now(),
    },
  ],
};

module.exports = store;
