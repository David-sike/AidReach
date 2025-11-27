// ✅ Import the Firebase SDKs (v10.12.4 unified)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import {
  getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore, serverTimestamp, doc, setDoc, getDoc, addDoc,
  updateDoc, collection, query, where, orderBy, limit, onSnapshot, increment
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDsEkQhydktiMdyjexvIquKnWhIsACkEFk",
  authDomain: "crowdfunding-project-bb723.firebaseapp.com",
  projectId: "crowdfunding-project-bb723",
  storageBucket: "crowdfunding-project-bb723.firebasestorage.app",
  messagingSenderId: "614354054717",
  appId: "1:614354054717:web:004107096ad21590904454",
  measurementId: "G-M7R86VZPV1"
};

// ✅ Initialize Firebase core services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Automatically create user doc if new user signs up
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || "",
        email: user.email,
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        role: "user",
        campaignsCount: 0,
        totalDonated: 0
      });
      console.log("✅ User document created!");
    }
  }
});

// ✅ Function: Create new campaign
export async function createCampaign(data, user) {
  if (!user) throw new Error("Not signed in");
  const campaignRef = await addDoc(collection(db, "campaigns"), {
    ownerId: user.uid,
    title: data.title,
    summary: data.summary,
    goalAmount: Number(data.goalAmount),
    amountRaised: 0,
    donationCount: 0,
    coverImageUrl: data.coverImageUrl || "",
    status: "LIVE",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    location: data.location || "",
    category: data.category || "",
    shareSlug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)
  });
  console.log("✅ Campaign created:", campaignRef.id);
  return campaignRef.id;
}

// ✅ Function: Add a donation (called after Paystack payment)
export async function addDonation(data) {
  if (!data.campaignId || !data.amount) throw new Error("Missing donation info");
  const donationRef = await addDoc(collection(db, "donations"), {
    campaignId: data.campaignId,
    donorId: data.donorId || "",
    donorName: data.donorName || "Anonymous",
    amount: Number(data.amount),
    message: data.message || "",
    paymentRef: data.paymentRef || "",
    status: data.status || "SUCCESS",
    anonymous: data.anonymous || false,
    createdAt: serverTimestamp()
  });

  // Update campaign totals
  const campaignRef = doc(db, "campaigns", data.campaignId);
  await updateDoc(campaignRef, {
    amountRaised: increment(data.amount),
    donationCount: increment(1),
    updatedAt: serverTimestamp()
  });

  console.log("✅ Donation added:", donationRef.id);
}

// ✅ Export for reuse in all pages
window.__FIREBASE__ = {
  app, analytics, auth, db, storage,
  onAuthStateChanged, signOut,
  serverTimestamp, doc, setDoc, getDoc, addDoc,
  updateDoc, increment, query, where, orderBy, limit, onSnapshot,
  storageRef, uploadBytes, getDownloadURL,
  createCampaign, addDonation
};

console.log("🔥 Firebase initialized successfully");
