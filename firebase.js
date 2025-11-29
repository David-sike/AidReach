// firebase.js

import { 
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";

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

// AidReach config
const firebaseConfig = {
  apiKey: "AIzaSyBg_xrflYlYEPk6txfP-5iR0y-tBRFZGcA",
  authDomain: "aidreach-2d1ec.firebaseapp.com",
  projectId: "aidreach-2d1ec",
  storageBucket: "aidreach-2d1ec.firebasestorage.app",
  messagingSenderId: "1045366476824",
  appId: "1:1045366476824:web:245e9085184f5cbf98336d",
  measurementId: "G-RZ5EPWMM33"
};

// make config visible to navbar.js if it wants to override
window._FIREBASE_CONFIG_ = firebaseConfig;

// ✅ Reuse existing app if someone already called initializeApp
let app;
if (getApps().length) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// keep your onAuthStateChanged logic here as you had it
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
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        role: "user"
      });
      console.log("Created new user document");
    }
  } catch (error) {
    console.warn("User doc fetch failed:", error);
  }
});

// example helper: createCampaign, keep whatever we wrote before
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
// ✅ Function: Add a donation and update campaign totals
async function addDonation(data) {
  if (!data.campaignId || !data.amount) {
    throw new Error("Missing donation info: campaignId and amount are required");
  }

  const amountNum = Number(data.amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error("Invalid donation amount");
  }

  // 1) Create donation record
  const donationRef = await addDoc(collection(db, "donations"), {
    campaignId: data.campaignId,
    donorId: data.donorId || "",
    donorName: data.donorName || "Anonymous",
    amount: amountNum,
    message: data.message || "",
    paymentRef: data.paymentRef || "",
    status: data.status || "SUCCESS",
    anonymous: data.anonymous || false,
    createdAt: serverTimestamp()
  });

  // 2) Update campaign aggregates
  const campaignRef = doc(db, "campaigns", data.campaignId);
  await updateDoc(campaignRef, {
    amountRaised: increment(amountNum),
    donationCount: increment(1),
    updatedAt: serverTimestamp()
  });

  console.log("✅ Donation added:", donationRef.id);
  return donationRef.id;
}

// expose a global bag for non module scripts like newCampaign.js
window.__FIREBASE__ = {
  app,
  auth,
  db,
  storage,
  onAuthStateChanged,
  signOut,
  serverTimestamp,

  // Firestore document helpers
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  increment,

  // Firestore collection query helpers - needed by donation.js
  collection,
  query,
  where,
  orderBy,
  onSnapshot,

  // Storage helpers
  storageRef,
  uploadBytes,
  getDownloadURL,

  // Custom app helpers
  createCampaign,
  addDonation
};



console.log("Firebase initialized successfully for AidReach");
