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
  });

  db = admin.firestore();
}

module.exports = {
  admin,
  db,
  isFirebaseEnabled: Boolean(db),
};
