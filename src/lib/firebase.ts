/**
 * Firebase client setup.
 *
 * Reads config from VITE_FIREBASE_* env vars when available, with a fallback
 * to the values that were previously hardcoded in public/lumini.html.
 *
 * TODO: once you've created a `.env.local` (gitignored) with VITE_FIREBASE_*
 * values, remove the fallback block below. Until then, this lets the migration
 * run with zero setup.
 */

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const config = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    "AIzaSyDtV1VuCnNCDeuHwGX4ZUCG0WMJM82-hBY",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "luminix-bcc28.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ??
    "https://luminix-bcc28-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "luminix-bcc28",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "luminix-bcc28.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "217255412785",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    "1:217255412785:web:dccb64a43aa83c6b234110",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-TKJELBK1F5",
};

export const firebaseApp: FirebaseApp = initializeApp(config);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

// The data namespace key inside Firestore — matches the existing schema:
//   artifacts/{APP_ID}/public/data/...
//   artifacts/{APP_ID}/users/{uid}/...
export const APP_ID = "lumini_v1";
