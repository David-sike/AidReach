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
      showSuccessMessage(amount, reference);
    } else {
      alert("Payment not verified.");
    }
  } catch (err) {
    console.error(err);
    alert("Verification failed.");
  }
}

function showSuccessMessage(amount, reference) {
  const div = document.createElement("div");
  div.className = "alert alert-success mt-3";
  div.textContent = `✅ Thank you! ₦${amount.toLocaleString()} received. Ref: ${reference}`;
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
