/**
 * localRepository.js
 *
 * A Firebase-free drop-in replacement for repository.js, used exclusively
 * for hero and gallery collections.
 *
 * Hero and Gallery data is ALWAYS read from and written to local JSON files:
 *   - heroContent  →  server/src/data/store/heroContent.json  (via heroStore.js)
 *   - gallery      →  server/src/data/store/galleryContent.json  (via galleryStore.js)
 *
 * Firebase is never touched for these two collections.
 */

const memoryStore = require("../data/memoryStore");

console.log("[localRepository] Firebase skipped for hero/gallery — using local JSON only.");

const withTimestamps = (data, isNew = false) => {
  const timestamp = new Date().toISOString();
  return {
    ...data,
    ...(isNew ? { createdAt: timestamp } : {}),
    updatedAt: timestamp,
  };
};

const createLocalRepository = (collectionName) => {
  const getStore = () => memoryStore[collectionName];

  return {
    async list() {
      console.log(`[localRepository] Loading ${collectionName} from local JSON.`);
      return getStore() || [];
    },

    async getById(id) {
      console.log(`[localRepository] Loading ${collectionName}/${id} from local JSON.`);
      return (getStore() || []).find((item) => item.id === id) || null;
    },

    async create(data) {
      const payload = withTimestamps(data, true);
      const item = {
        id: `${collectionName}_${Date.now()}`,
        ...payload,
      };
      getStore().push(item);
      return item;
    },

    async update(id, data) {
      const payload = withTimestamps(data);
      const items = getStore() || [];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...payload };
      return items[index];
    },

    async set(id, data) {
      const existing = (getStore() || []).find((item) => item.id === id);
      const payload = withTimestamps(data, !existing);

      if (!memoryStore[collectionName]) memoryStore[collectionName] = [];
      const items = memoryStore[collectionName];
      const index = items.findIndex((item) => item.id === id);

      if (index === -1) {
        const item = { id, ...payload };
        items.push(item);
        return item;
      }

      items[index] = { ...items[index], ...payload };
      return items[index];
    },

    async remove(id) {
      const items = getStore() || [];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return false;
      items.splice(index, 1);
      return true;
    },
  };
};

module.exports = createLocalRepository;
