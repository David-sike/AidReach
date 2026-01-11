// donationPage.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ donationPage.js loaded");

  const FB = window.__FIREBASE__;
  if (!FB) {
    console.error("Firebase not initialized on Donation page");
    return;
  }

  const { db, collection, query, orderBy, onSnapshot } = FB;
  const grid = document.querySelector(".donation-grid");

  if (!grid) {
    console.error("❌ .donation-grid not found");
    return;
  }

  // Show loading state
  grid.innerHTML = `<p style="text-align:center; padding:20px; color:#64748b;">
    Loading campaigns...
  </p>`;

  // Query Firestore for campaigns, newest first
  const campaignsRef = collection(db, "campaigns");
  const q = query(campaignsRef, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      grid.innerHTML = `<p style="text-align:center; padding:20px; color:#64748b;">
        No campaigns yet. Be the first to create one.
      </p>`;
      return;
    }

    grid.innerHTML = ""; // clear static cards

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      const title = data.title || "Untitled campaign";
      const organizer = data.organizer || "Anonymous";
      const cover = data.coverImageUrl || "SDP/aid 4.jpg";
      const goal = Number(data.goalAmount) || 0;
      const raised = Number(data.amountRaised) || 0;

      // Days left (if you used endDate in Firestore)
      let daysLeftText = "";
      if (data.endDate) {
        const end = new Date(data.endDate);
        const now = new Date();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          daysLeftText = `${diffDays} days to go`;
        } else {
          daysLeftText = "Campaign ended";
        }
      } else {
        daysLeftText = "Ongoing";
      }

      const card = document.createElement("div");
      card.className = "donation-card";
      card.setAttribute("data-campaign-id", id);
      card.onclick = () => {
        window.location.href = `Campaign.html?id=${id}`;
      };

      card.innerHTML = `
        <img src="${cover}" alt="Campaign Image">
        <div class="donation-content">
          <h3>${title} | 
            <a href="Campaign.html?id=${id}" onclick="event.stopPropagation()">Read more</a>
          </h3>
          <small class="category">${organizer}</small>
          <p class="donation-info">
            ₦${raised.toLocaleString()} raised of ₦${goal.toLocaleString()}
          </p>
          <p class="days-left">${daysLeftText}</p>
          <button class="cta-button-donation">Make a donation</button>
        </div>
      `;

      const btn = card.querySelector(".cta-button-donation");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `Campaign.html?id=${id}`;
      });

      grid.appendChild(card);
    });
  }, (error) => {
    console.error("❌ Failed to load campaigns:", error);
    grid.innerHTML = `<p style="text-align:center; padding:20px; color:#b91c1c;">
      Could not load campaigns. Please refresh the page.
    </p>`;
  });
});
