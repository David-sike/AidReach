// campaigns.js
console.log("✅ campaigns.js loaded");

document.addEventListener("DOMContentLoaded", async () => {
  const FB = window.__FIREBASE__;
  if (!FB) {
    console.error("❌ Firebase not initialized");
    return;
  }

  const { db, doc, getDoc } = FB;

  // Get campaign ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get("id");

  if (!campaignId) {
    console.error("❌ No campaign ID in URL");
    return;
  }

  const docRef = doc(db, "campaigns", campaignId);

  try {
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.error("❌ Campaign not found");
      return;
    }

    const campaign = snap.data();
    console.log("📄 Loaded campaign:", campaignId, campaign);

    renderCampaign(campaignId, campaign);
  } catch (err) {
    console.error("❌ Failed to load campaign:", err);
  }
});

function renderCampaign(campaignId, data) {
  const {
    title,
    organizer,
    summary,
    location,
    description,
    goalAmount,
    amountRaised = 0,
    donationCount = 0,
    startDate,
    endDate,
    coverImageUrl,
    gallery = [],
    updates = []
  } = data;

  // TITLE
  const titleEl = document.getElementById("campaign-title");
  if (titleEl) titleEl.textContent = title || "";

  // MAIN IMAGE + THUMBNAILS
  const mainImageEl = document.getElementById("main-image");
  const thumbsEl = document.getElementById("thumbnails");

  const allImages = [];
  if (coverImageUrl) allImages.push(coverImageUrl);
  if (Array.isArray(gallery)) {
    gallery.forEach((url) => {
      if (url && !allImages.includes(url)) allImages.push(url);
    });
  }

  if (mainImageEl && allImages.length > 0) {
    mainImageEl.src = allImages[0];
  }

  if (thumbsEl) {
    thumbsEl.innerHTML = "";
    allImages.forEach((url, index) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Campaign image " + (index + 1);
      img.style.height = "70px";
      img.style.borderRadius = "6px";
      img.style.cursor = "pointer";
      img.style.border = "1px solid #e5e7eb";

      img.addEventListener("click", () => {
        if (mainImageEl) mainImageEl.src = url;
      });

      thumbsEl.appendChild(img);
    });
  }

  // OVERVIEW / DESCRIPTION
  const overviewEl = document.getElementById("overview");
  if (overviewEl) {
    overviewEl.textContent = description || summary || "";
  }

  // LOCATION
  const locationEl = document.getElementById("location");
  if (locationEl) {
    locationEl.textContent = location || "Location not specified";
  }

  // DATE LAUNCHED
  const startDateEl = document.getElementById("startDate");
  if (startDateEl) {
    if (startDate) {
      const d = new Date(startDate);
      startDateEl.textContent = isNaN(d.getTime())
        ? startDate
        : d.toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
    } else {
      startDateEl.textContent = "Not specified";
    }
  }

  // ORGANIZER TEXT UNDER DONATE BOX
  const organizerEl = document.getElementById("organizer");
  if (organizerEl) {
    organizerEl.textContent = organizer || "Organizer not specified";
  }

  // DONATION STATS
  const raisedEl = document.getElementById("raised");
  const goalEl = document.getElementById("goal");
  const donationsEl = document.getElementById("donations");

  if (raisedEl) raisedEl.textContent = `₦${(amountRaised || 0).toLocaleString()}`;
  if (goalEl) goalEl.textContent = `₦${(goalAmount || 0).toLocaleString()}`;
  if (donationsEl) {
    const count = Number(donationCount || 0);
    donationsEl.textContent = `${count} Donation${count === 1 ? "" : "s"}`;
  }

  // PROGRESS BAR
  const progressFill = document.getElementById("progress-bar-fill");
  if (progressFill && goalAmount > 0) {
    const percent = Math.min(100, (amountRaised / goalAmount) * 100);
    progressFill.style.width = `${percent.toFixed(0)}%`;
  }

  // UPDATES
  const updatesEl = document.getElementById("updates");
  if (updatesEl) {
    const updatesArray = Array.isArray(updates) ? updates : [];

    if (updatesArray.length === 0) {
      updatesEl.innerHTML = `
        <span class="text-muted" style="font-size:14px;">
          No updates have been posted yet.
        </span>
      `;
    } else {
      // Newest first
      const sorted = [...updatesArray].sort((a, b) => {
        const ta = getUpdateTime(a);
        const tb = getUpdateTime(b);
        return tb - ta;
      });

      let html = "";
      sorted.forEach((u) => {
        const d = getUpdateDate(u);
        const dateText = d
          ? d.toLocaleDateString("en-NG", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          : "Date not available";

        const safeText = (u.text || "").replace(/\n/g, "<br>");

        html += `
          <div class="mb-3 p-2 rounded" style="background:#f9fafb; border:1px solid #e5e7eb;">
            <div style="font-size:12px; color:#6b7280; margin-bottom:4px;">
              Posted on ${dateText}
            </div>
            <div style="font-size:14px; color:#111827;">
              ${safeText}
            </div>
          </div>
        `;
      });

      updatesEl.innerHTML = html;
    }
  }

  // SET HIDDEN FIELD FOR DONATION
  const hiddenId = document.getElementById("campaign-id");
  if (hiddenId) hiddenId.value = campaignId;
}

// helpers for updates
function getUpdateTime(u) {
  if (!u || !u.createdAt) return 0;

  if (u.createdAt.toDate) {
    return u.createdAt.toDate().getTime();
  }

  const d = new Date(u.createdAt);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function getUpdateDate(u) {
  if (!u || !u.createdAt) return null;

  if (u.createdAt.toDate) {
    return u.createdAt.toDate();
  }

  const d = new Date(u.createdAt);
  return isNaN(d.getTime()) ? null : d;
}
