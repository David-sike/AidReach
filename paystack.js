document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("donation-form");
  if (form) {
    form.addEventListener("submit", handleDonationSubmit);
  }
});

const BASE_URL = "http://localhost:5000";

async function handleDonationSubmit(e) {
  e.preventDefault();

  const email = document.getElementById("donor-email").value.trim();
  const amount = Number(document.getElementById("donation-amount").value);

  const urlParams = new URLSearchParams(window.location.search);
  const campaignId =
    urlParams.get("campaignId") ||
    document.getElementById("campaign-id")?.value;

  if (!email || !amount || amount <= 0) {
    alert("Please enter a valid email and amount");
    return;
  }

  try {
    const initRes = await fetch(`${BASE_URL}/api/donations/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, amount, campaignId }),
    });

    if (!initRes.ok) {
      const errorText = await initRes.text();
      throw new Error(errorText);
    }

    const { reference, publicKey } = await initRes.json();

    const handler = PaystackPop.setup({
      key: publicKey,
      email,
      amount: amount * 100,
      ref: reference,
      callback: () => verifyPayment(reference, campaignId, amount),
      onClose: () => alert("Payment window closed"),
    });

    handler.openIframe();
  } catch (err) {
    console.error(err);
    alert("Error starting payment. Check console for details.");
  }
}

async function verifyPayment(reference, campaignId, amount) {
  try {
   
    const verifyRes = await fetch(`${BASE_URL}/api/donations/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, campaignId }),
    });

    const data = await verifyRes.json();

    if (data.verified) {
      // 2. ✅ SUCCESS! Now save to Firebase
      await saveDonationToFirebase(data, amount, campaignId);
      
      // 3. Update the UI
      showSuccessMessage(amount, reference);
    } else {
      alert("Payment verified failed. Please contact support if you were debited.");
    }
  } catch (err) {
    console.error(err);
    alert("Verification process failed. Check console.");
  }
}

// New helper function to save to Firestore
async function saveDonationToFirebase(backendData, amount, campaignId) {
  const { 
    db, doc, getDoc, updateDoc, addDoc, collection, 
    serverTimestamp, increment, auth 
  } = window.__FIREBASE__;

  try {
    // 1. Get donor name from logged-in user
    const user = auth.currentUser;
    const donorName = user?.displayName || user?.email || "Anonymous";

    // 2. Get campaign name from campaigns collection
    const campaignSnap = await getDoc(doc(db, "campaigns", campaignId));
    const campaignName = campaignSnap.exists()
      ? (campaignSnap.data().title || "")
      : "";

    // 3. Save donation with donorName + campaignName included
    await addDoc(collection(db, "donations"), {
      campaignId,
      campaignName,          // NEW
      donorId: user?.uid || "",
      donorName,             // NEW
      amount: Number(amount),
      email: backendData.email,
      reference: backendData.reference,
      createdAt: serverTimestamp(),
      status: "SUCCESS"
    });

    // 4. Update campaign totals
    const campaignRef = doc(db, "campaigns", campaignId);
    await updateDoc(campaignRef, {
      amountRaised: increment(Number(amount)),
      donationCount: increment(1),
      updatedAt: serverTimestamp()
    });

    console.log("Donation saved to Firebase with donorName + campaignName!");
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    
  }
}


function showSuccessMessage(amount, reference) {
  const div = document.createElement("div");
  div.className = "alert alert-success mt-3";
  div.textContent = `✅ Thank you! ₦${amount.toLocaleString()} received.`;
  document.getElementById("donation-form").after(div);

  // Progress update
  const raisedElement = document.getElementById("raised");
  const goalElement = document.getElementById("goal");
  const progressFill = document.getElementById("progress-bar-fill");

  const raisedValue = parseInt(raisedElement.textContent.replace(/\D/g, ""), 10) + amount;
  const goalValue = parseInt(goalElement.textContent.replace(/\D/g, ""), 10);
  const newPercent = (raisedValue / goalValue) * 100;

  raisedElement.textContent = `₦${raisedValue.toLocaleString()}`;
  progressFill.style.width = `${newPercent}%`;
}
