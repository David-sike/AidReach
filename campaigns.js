// campaigns.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ campaigns.js loaded");

  const FB = window.__FIREBASE__;
  if (!FB) {
    console.error("❌ Firebase not initialized on Campaign page");
    return;
  }

  const { db, doc, getDoc } = FB;

  const params = new URLSearchParams(window.location.search);
  const campaignId = params.get("id");

  if (!campaignId) {
    console.error("❌ No campaign id in URL");
    showPageError("Campaign not found.");
    return;
  }

  const formatNaira = (amount) => {
    const n = Number(amount) || 0;
    return "₦" + n.toLocaleString("en-NG");
  };

  try {
    const ref = doc(db, "campaigns", campaignId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.error("❌ Campaign does not exist:", campaignId);
      showPageError("This campaign no longer exists or was removed.");
      return;
    }

    const data = snap.data();
    console.log("📄 Loaded campaign:", campaignId, data);

    const title       = data.title || "Untitled campaign";
    const summary     = data.summary || "";
    const goalAmount  = Number(data.goalAmount) || 0;
    const location    = data.location || "";
    const organizer   = data.organizer || "Anonymous";
    const startDate   = data.startDate || "";
    const endDate     = data.endDate || "";
    const gallery     = Array.isArray(data.gallery) ? data.gallery : [];
    const coverImage  = data.coverImageUrl || (gallery[0] || "SDP/aid 4.jpg");

    // note the field name change here
    const amountRaised   = Number(data.amountRaised || 0);
    const donationsCount = Number(data.donationCount || 0);

    const titleEl       = document.getElementById("campaign-title");
    const locationEl    = document.getElementById("location");
    const startDateEl   = document.getElementById("startDate");
    const overviewEl    = document.getElementById("overview");
    const updatesEl     = document.getElementById("updates");
    const organizerEl   = document.getElementById("organizer");

    const raisedEl      = document.getElementById("raised");
    const goalEl        = document.getElementById("goal");
    const donationsEl   = document.getElementById("donations");
    const progressFill  = document.getElementById("progress-bar-fill");
    const hiddenIdInput = document.getElementById("campaign-id");

    // fix the ID to match HTML
    const mainImageEl   = document.getElementById("main-image");
    const thumbsEl      = document.getElementById("thumbnails");

    if (titleEl)     titleEl.textContent = title;
    if (locationEl)  locationEl.textContent = location;
    if (startDateEl) startDateEl.textContent = startDate || "–";

    if (overviewEl)  overviewEl.textContent  = summary;
    if (updatesEl)   updatesEl.textContent   = data.updates || "No updates have been posted yet.";

    if (organizerEl) organizerEl.textContent = organizer;

    if (raisedEl)    raisedEl.textContent = formatNaira(amountRaised);
    if (goalEl)      goalEl.textContent   = formatNaira(goalAmount);
    if (donationsEl) donationsEl.textContent =
      `${donationsCount} Donation${donationsCount === 1 ? "" : "s"}`;

    if (progressFill) {
      let pct = 0;
      if (goalAmount > 0) {
        pct = Math.min(100, Math.max(0, (amountRaised / goalAmount) * 100));
      }
      progressFill.style.width = pct + "%";
    }

    if (hiddenIdInput) {
      hiddenIdInput.value = campaignId;
    }

    if (mainImageEl) {
      mainImageEl.src = coverImage;
      mainImageEl.alt = title;
    }

    if (thumbsEl) {
      thumbsEl.innerHTML = "";
      const allImages = [coverImage, ...gallery.filter((url) => url !== coverImage)];

      allImages.forEach((url, index) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = `Campaign photo ${index + 1}`;
        img.style.height = "64px";
        img.style.width = "auto";
        img.style.objectFit = "cover";
        img.style.borderRadius = "4px";
        img.style.cursor = "pointer";

        img.addEventListener("click", () => {
          if (mainImageEl) mainImageEl.src = url;
        });

        thumbsEl.appendChild(img);
      });
    }

  } catch (err) {
    console.error("❌ Failed to load campaign:", err);
    showPageError("Could not load this campaign. Please refresh and try again.");
  }
});

function showPageError(msg) {
  let box = document.getElementById("campaign-error");
  if (!box) {
    alert(msg);
    return;
  }
  box.textContent = msg;
  box.style.display = "block";
}
