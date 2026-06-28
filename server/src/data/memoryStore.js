const now = () => new Date().toISOString();
const { defaultPackages } = require("./defaultCatalog");
// Packages now use a JSON-file-backed persistent store so admin edits
// (addon images, prices, descriptions) survive server restarts.
const { createPersistedPackageArray } = require("./packageStore");

// NOTE: heroContent, themes, and gallery are NO LONGER stored here.
// They are persisted in Firebase Firestore:
//   heroContent  →  Firestore collection "heroContent", document "main"
//   themes       →  Firestore collection "themeContent", document "main"
//   gallery      →  Firestore collection "gallery", one document per item
// See server/src/services/firestoreHeroRepository.js
//     server/src/services/firestoreThemeRepository.js
//     server/src/services/repository.js (gallery uses this generic repo)

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
