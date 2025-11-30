// yourDonations.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ yourDonations.js loaded");

  const FB = window.__FIREBASE__;
  if (!FB) {
    console.error("❌ Firebase not initialized on Your donations page");
    return;
  }

  const {
    auth,
    db,
    collection,
    query,
    where,
    onSnapshot,
    doc,
    getDoc
  } = FB;

  const listEl = document.getElementById("your-donations-list");
  const msgEl = document.getElementById("your-donations-message");

  if (!listEl) {
    console.error("❌ #your-donations-list not found");
    return;
  }

  const formatNaira = (amount) => {
    const n = Number(amount) || 0;
    return "₦" + n.toLocaleString("en-NG");
  };

  const formatDate = (value) => {
    if (!value) return "Date not available";

    // Firestore Timestamp
    if (value.toDate) {
      const d = value.toDate();
      return d.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    // ISO string or millis
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    return "Date not available";
  };

  function showMessage(type, text) {
    if (!msgEl) return;
    msgEl.classList.remove("success", "error");
    msgEl.classList.add(type === "success" ? "success" : "error");
    msgEl.textContent = text;
    msgEl.style.display = "block";

    if (msgEl._hideTimeout) clearTimeout(msgEl._hideTimeout);
    msgEl._hideTimeout = setTimeout(() => {
      msgEl.style.display = "none";
    }, 4000);
  }

  auth.onAuthStateChanged((user) => {
    if (!user) {
      listEl.innerHTML = `
        <p style="text-align:center; padding:20px; color:#b91c1c; font-size:0.95rem;">
          You need to be signed in to see your donations.
          <br>
          <a href="Sign up.html?mode=login" style="color:#1d4ed8; text-decoration:underline;">
            Go to sign in page
          </a>
        </p>
      `;
      return;
    }

console.log("👤 Loading donations for user:", user.uid);

    const donationsRef = collection(db, "donations");
    const q = query(
      donationsRef,
      where("donorId", "==", user.uid)
    );

    onSnapshot(
      q,
      (snapshot) => {
        renderDonations(snapshot, user).catch((err) => {
          console.error("❌ Failed to render donations:", err);
          showMessage("error", "Could not load your donations. Please refresh the page.");
        });
      },
      (error) => {
        console.error("❌ Failed to load donations:", error);
        listEl.innerHTML = `
          <p style="text-align:center; padding:20px; color:#b91c1c; font-size:0.95rem;">
            Could not load your donations. Please refresh the page.
          </p>
        `;
      }
    );
  });

  async function renderDonations(snapshot, user) {
    if (snapshot.empty) {
      listEl.innerHTML = `
        <p style="text-align:center; padding:20px; color:#64748b; font-size:0.95rem;">
          You have not made any donations yet.
          <br>
          <a href="Donation.html" style="color:#1d4ed8; text-decoration:underline;">
            Browse active campaigns to support
          </a>
        </p>
      `;
      return;
    }

    listEl.innerHTML = "";
    const items = [];

    for (const docSnap of snapshot.docs) {
      const donation = docSnap.data();
      const donationId = docSnap.id;

      const amount = donation.amount || 0;
      const createdAt = donation.createdAt;
      const status = donation.status || "SUCCESS";
      const campaignId = donation.campaignId;

      let campaignTitle = "Campaign no longer available";
      let campaignLocation = "";
      let coverImage = "SDP/aid 4.jpg";
      let campaignExists = false;

      if (campaignId) {
        try {
          const campaignRef = doc(db, "campaigns", campaignId);
          const campaignSnap = await getDoc(campaignRef);
          if (campaignSnap.exists()) {
            const c = campaignSnap.data();
            campaignTitle = c.title || campaignTitle;
            campaignLocation = c.location || "";
            coverImage = c.coverImageUrl || coverImage;
            campaignExists = true;
          }
        } catch (err) {
          console.warn("⚠️ Failed to fetch campaign for donation", donationId, err);
        }
      }

      items.push({
        donationId,
        campaignId,
        campaignTitle,
        campaignLocation,
        coverImage,
        amount,
        createdAt,
        status,
        campaignExists
      });
    }

    // Sort by createdAt descending on the client
    items.sort((a, b) => {
      const ta = a.createdAt && a.createdAt.toDate
        ? a.createdAt.toDate().getTime()
        : new Date(a.createdAt || 0).getTime();
      const tb = b.createdAt && b.createdAt.toDate
        ? b.createdAt.toDate().getTime()
        : new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "donation-row-card";

      row.innerHTML = `
        <img src="${item.coverImage}" alt="Campaign image" class="donation-row-image" />
         <div class="donation-row-main">
          <div class="donation-row-title">${item.campaignTitle}</div>
          <div class="donation-row-meta">
            <span>${item.campaignLocation || "Location not specified"}</span>
            <span>${formatDate(item.createdAt)}</span>
          </div>
          <div class="donation-row-actions">
            ${
              item.campaignExists && item.campaignId
                ? `<button type="button" data-campaign-id="${item.campaignId}">View campaign</button>`
                : `<span style="font-size:0.8rem; color:#9ca3af;">Campaign is no longer available</span>`
            }
          </div>
        </div>
        <div style="min-width:120px;">
          <div class="donation-row-amount">${formatNaira(item.amount)}</div>
          <div class="donation-row-status">${item.status}</div>
        </div>
      `;

      const viewBtn = row.querySelector("button[data-campaign-id]");
      if (viewBtn) {
        viewBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const cid = viewBtn.getAttribute("data-campaign-id");
          if (cid) {
            window.location.href = `Campaign.html?id=${cid}`;
          }
        });
      }

      listEl.appendChild(row);
    });
  }
});
