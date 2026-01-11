// Firebase configuration and helpers for the AidReach project.
//
// This module initializes Firebase only once and exposes the
// configured app, authentication, Firestore and storage instances.
// It also exports a helper for creating a new campaign and stores
// useful Firestore methods on a global object so that non‑module
// scripts can still access them.  The configuration values are
// identical to those used in the upstream repository and can be
// overridden by assigning a new value to `window._FIREBASE_CONFIG_`.

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

// AidReach Firebase configuration.  You can replace these values with
// your own project details if you fork this repository.  The values
// below are published in the upstream repository so they are safe to
// commit here.  If `window._FIREBASE_CONFIG_` has been populated
// (e.g. by another script), those values will be used instead.
const firebaseConfig = window._FIREBASE_CONFIG_ || {
  apiKey: "AIzaSyBg_xrflYlYEPk6txfP-5iR0y-tBRFZGcA",
  authDomain: "aidreach-2d1ec.firebaseapp.com",
  projectId: "aidreach-2d1ec",
  storageBucket: "aidreach-2d1ec.firebasestorage.app",
  messagingSenderId: "1045366476824",
  appId: "1:1045366476824:web:245e9085184f5cbf98336d",
  measurementId: "G-RZ5EPWMM33"
};

// Persist the config for other modules (e.g. navbar.js) to override if
// necessary.  Do this before initializing the app so any overrides
// take effect.
window._FIREBASE_CONFIG_ = firebaseConfig;

// Only initialise the Firebase app once.  If another module already
// called `initializeApp()` then `getApps()` will return a non‑empty
// array and we simply reuse the existing app.
let app;
if (getApps().length) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

// Create convenience instances for auth, firestore and storage.
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Listen for changes to the signed in user.  This replicates the
// behaviour from the upstream firebase.js file: when a new user
// authenticates, ensure a corresponding document exists in the
// `users` collection with sensible defaults.  Errors are caught and
// logged to avoid breaking the page.
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  console.log("Logged in user:", user.uid);
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || "",
        email: user.email || "",
        createdAt: serverTimestamp(),
        role: "user"
      });
      console.log("Created new user document");
    }
  } catch (error) {
    console.warn("User doc fetch failed:", error);
  }
});

// Helper to create a new campaign.  This function can be imported
// elsewhere or accessed via `window.__FIREBASE__.createCampaign`.
export async function createCampaign(data, user) {
  if (!user) throw new Error("Not signed in");
  const campaignRef = await addDoc(collection(db, "campaigns"), {
    ownerId: user.uid,
    title: data.title,
    summary: data.summary,
    goalAmount: Number(data.goalAmount) || 0,
    amountRaised: 0,
    donationCount: 0,
    coverImageUrl: data.coverImageUrl || "",
    status: "LIVE",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    location: data.location || "",
    category: data.category || "",
    organizer: data.organizer || "",
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    gallery: data.gallery || []
  });
  console.log("Campaign created with id:", campaignRef.id);
  return campaignRef.id;
}

// Expose the core Firebase services and helpers on the global object
// `window.__FIREBASE__` so that non‑module scripts can access them
// without using ES modules.  This mirrors the upstream behaviour.
window.__FIREBASE__ = {
  app,
  auth,
  db,
  storage,
  onAuthStateChanged,
  signOut,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  storageRef,
  uploadBytes,
  getDownloadURL,
  createCampaign
};

// Export the Firebase instances for use by ES modules.  Modules that
// import this file can destructure `db`, `auth` or `storage` as needed.
export { app, auth, db, storage };

console.log("Firebase initialized successfully for AidReach");