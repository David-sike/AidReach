// firebase.js

// Import Firebase SDKs (modular v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";

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
  increment,
  arrayUnion,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

// Firebase Config for AidReach
const firebaseConfig = {
  apiKey: "AIzaSyBg_xrflYlYEPk6txfP-5iR0y-tBRFZGcA",
  authDomain: "aidreach-2d1ec.firebaseapp.com",
  projectId: "aidreach-2d1ec",
  storageBucket: "aidreach-2d1ec.firebasestorage.app",
  messagingSenderId: "1045366476824",
  appId: "1:1045366476824:web:245e9085184f5cbf98336d",
  measurementId: "G-RZ5EPWMM33"
};

// Init core services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Basic auth log for debugging
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in user:", user.uid);
  } else {
    console.log("No user logged in");
  }
});

// Create a new campaign document
async function createCampaign(data, user) {
  if (!user) {
    throw new Error("Not signed in");
  }

  const campaignsRef = collection(db, "campaigns");

  const payload = {
    ownerId: user.uid,
    organizer: data.organizer || "",
    title: data.title || "",
    summary: data.summary || "",
    description: data.description || data.summary || "",
    location: data.location || "",
    category: data.category || "",
    goalAmount: Number(data.goalAmount) || 0,
    amountRaised: 0,
    donationCount: 0,
    status: "LIVE",
    coverImageUrl: data.coverImageUrl || "",
    gallery: data.gallery || [],
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(campaignsRef, payload);
  console.log("Campaign created with id:", docRef.id);
  return docRef.id;
}

// Add a donation and update campaign totals
async function addDonation({
  campaignId,
  donorId,
  donorName,
  amount,
  paymentRef,
  status,
  anonymous = false,
  message = ""
}) {
  if (!campaignId) {
    throw new Error("campaignId is required for addDonation");
  }

  const nAmount = Number(amount) || 0;

  const donationsRef = collection(db, "donations");
  const donationPayload = {
    campaignId,
    donorId: donorId || null,
    donorName: donorName || "Anonymous",
    amount: nAmount,
    paymentRef: paymentRef || "",
    status: status || "SUCCESS",
    anonymous: Boolean(anonymous),
    message,
    createdAt: serverTimestamp()
  };

  const donationDoc = await addDoc(donationsRef, donationPayload);

  // Update campaign totals
  const campaignRef = doc(db, "campaigns", campaignId);
  await updateDoc(campaignRef, {
    amountRaised: increment(nAmount),
    donationCount: increment(1),
    updatedAt: serverTimestamp()
  });

  console.log("Donation added:", donationDoc.id);
}

// Expose Firebase to the rest of the app through a global
window.__FIREBASE__ = {
  app,
  auth,
  db,
  storage,

  // auth helpers
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,

  // firestore helpers
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
  collection,
  arrayUnion,
  getDocs,

  // storage helpers
  storageRef,
  uploadBytes,
  getDownloadURL,

  // project helpers
  createCampaign,
  addDonation
};

console.log("Firebase initialized successfully for AidReach");

// optional named exports (not required but safe)
export {
  app,
  auth,
  db,
  storage,
  createCampaign,
  addDonation
};
