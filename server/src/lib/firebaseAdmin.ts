import { initializeApp, cert, type App } from "firebase-admin/app";
import { env } from "../utils/env.js";

const projectId = env.FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
// Handle escaped newlines in env private key string
const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let firebaseAdminApp: App | null = null;

if (projectId && clientEmail && privateKey) {
  try {
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("✅ Firebase Admin SDK Initialized Successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
  }
} else {
  console.warn(
    "⚠️ Firebase configuration missing in environment variables. Firebase auth verification will fail unless local mock is active."
  );
}

export { firebaseAdminApp };

