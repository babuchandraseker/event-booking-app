const now = () => new Date().toISOString();
const { defaultPackages } = require("./defaultCatalog");

const store = {
  bookings: [],
  packages: defaultPackages.map((pkg) => ({ ...pkg, createdAt: now(), updatedAt: now() })),
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
      businessName: "Velvet Nights",
      tagline: "Private Event Studio",
      description: "Chennai's premier indoor private event studio, crafting unforgettable moments for every occasion. Premium, intimate, and entirely yours.",
      city: "Chennai",
      address: "T. Nagar, Chennai - 600017",
      openingHours: "9 AM - 11 PM",
      phone: "+91 99999 99999",
      whatsapp: "+91 99999 99999",
      email: "hello@velvetnights.in",
      instagram: "@velvetnights",
      adminPassword: "admin123",
      createdAt: now(),
      updatedAt: now(),
    },
  ],
};

module.exports = store;
