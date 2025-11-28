/**
 * Firebase initialization and helper functions for the charity platform.
 *
 * This module configures the Firebase SDK and exposes convenience
 * functions for interacting with Firestore. Keeping the Firebase
 * configuration in a separate file isolates sensitive keys and makes
 * it easy to update or swap environments (e.g. development vs
 * production). The helper functions abstract away the low‑level API
 * details so your pages only need to import and call them.
 */

// Import the functions you need from the Firebase SDKs.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// TODO: Replace the following with your app's Firebase project configuration.
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase. This should only be done once in your app.
const app = initializeApp(firebaseConfig);

// Initialize Firestore. Firestore provides a NoSQL document database.
const db = getFirestore(app);

/**
 * Persist a new campaign in Firestore.
 *
 * @param {Object} campaignData An object containing the fields for the
 *        campaign (e.g. title, description, targetAmount, startDate,
 *        endDate, createdBy, imageUrl, etc.). Additional properties will be
 *        stored as well; Firestore allows flexible schemas.
 * @returns {Promise<string>} A promise that resolves with the new document ID
 *          when the write completes.
 */
export async function addCampaign(campaignData) {
  try {
    // Add a new document with an automatically generated ID.
    const docRef = await addDoc(collection(db, "campaigns"), campaignData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding campaign:", error);
    throw error;
  }
}

/**
 * Retrieve all campaigns from Firestore ordered by creation time.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of
 *          campaign objects, each augmented with its Firestore ID on the
 *          `id` property.
 */
export async function fetchCampaigns() {
  try {
    const campaignsCol = collection(db, "campaigns");
    // Create a query to order campaigns by creation time if such a field
    // exists. If you store a `createdAt` timestamp in your documents
    // (recommended), order by it descending so the newest appears first.
    const campaignsQuery = query(campaignsCol, orderBy("createdAt", "desc"));
    const campaignSnapshot = await getDocs(campaignsQuery);
    const campaigns = [];
    campaignSnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    return campaigns;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
}

// Export the db instance in case other modules need direct access.
export { db };