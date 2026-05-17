const admin = require("firebase-admin");

let db = null;

const hasFirebaseConfig =
  process.env.NODE_ENV !== "test" &&
  process.env.FIREBASE_DISABLED !== "true" &&
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (hasFirebaseConfig && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    ...(process.env.FIREBASE_STORAGE_BUCKET ? { storageBucket: process.env.FIREBASE_STORAGE_BUCKET } : {}),
  });

  db = admin.firestore();
}

const bucket = db && process.env.FIREBASE_STORAGE_BUCKET ? admin.storage().bucket() : null;

module.exports = {
  admin,
  bucket,
  db,
  isFirebaseEnabled: Boolean(db),
  isFirebaseStorageEnabled: Boolean(bucket),
};
