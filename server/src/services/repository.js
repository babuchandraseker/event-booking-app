const { db, isFirebaseEnabled } = require("../config/firebase");
const memoryStore = require("../data/memoryStore");

const withTimestamps = (data, isNew = false) => {
  const timestamp = new Date().toISOString();

  return {
    ...data,
    ...(isNew ? { createdAt: timestamp } : {}),
    updatedAt: timestamp,
  };
};

const createRepository = (collectionName) => ({
  async list() {
    if (isFirebaseEnabled) {
      const snapshot = await db.collection(collectionName).get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    return memoryStore[collectionName] || [];
  },

  async getById(id) {
    if (isFirebaseEnabled) {
      const doc = await db.collection(collectionName).doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    return (memoryStore[collectionName] || []).find((item) => item.id === id) || null;
  },

  async create(data) {
    const payload = withTimestamps(data, true);

    if (isFirebaseEnabled) {
      const docRef = await db.collection(collectionName).add(payload);
      return { id: docRef.id, ...payload };
    }

    const item = {
      id: `${collectionName}_${Date.now()}`,
      ...payload,
    };
    memoryStore[collectionName].push(item);
    return item;
  },

  async update(id, data) {
    const payload = withTimestamps(data);

    if (isFirebaseEnabled) {
      const docRef = db.collection(collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      await docRef.update(payload);
      return { id, ...doc.data(), ...payload };
    }

    const items = memoryStore[collectionName] || [];
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    items[index] = { ...items[index], ...payload };
    return items[index];
  },

  async remove(id) {
    if (isFirebaseEnabled) {
      const docRef = db.collection(collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return false;
      }

      await docRef.delete();
      return true;
    }

    const items = memoryStore[collectionName] || [];
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    items.splice(index, 1);
    return true;
  },
});

module.exports = createRepository;
