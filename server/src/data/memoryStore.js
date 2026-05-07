const now = () => new Date().toISOString();

const store = {
  bookings: [],
  packages: [
    {
      id: "signature",
      title: "Signature",
      price: 5999,
      duration: "2 hours",
      maxGuests: 2,
      description: "Signature private event package.",
      active: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "pkg-romantic-dinner",
      title: "Romantic Dinner",
      price: 4999,
      duration: "2 hours",
      maxGuests: 2,
      description: "Private candle light dinner setup.",
      active: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "pkg-birthday",
      title: "Birthday Celebration",
      price: 7999,
      duration: "3 hours",
      maxGuests: 20,
      description: "Decor, cake table, lights, and private celebration setup.",
      active: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
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
  contactMessages: [],
};

module.exports = store;
