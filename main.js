// main.js
document.addEventListener("DOMContentLoaded", () => {
  const FB = window.__FIREBASE__;
  if (!FB) {
    console.error("❌ Firebase not initialized on Home page");
    return;
  }

  const {
    db,
    collection,
    onSnapshot
  } = FB;

  const gridEl = document.getElementById("home-campaigns-grid");
  const featuredSection = document.querySelector(".featured");
  const featuredImage = featuredSection?.querySelector(".featured__media img");
  const featuredTitle = featuredSection?.querySelector(".featured__eyebrow");
  const featuredDesc = featuredSection?.querySelector(".featured__desc");
  const featuredReadMore = featuredSection?.querySelector(".btn--outline");
  const featuredDonate = featuredSection?.querySelector(".btn--primary");

  // Helper to format Naira
  function formatNaira(amount) {
    const n = Number(amount) || 0;
    return "₦" + n.toLocaleString("en-NG");
  }

  // Helper to compute simple "days left" if endDate string exists
  function getDaysLeft(endDate) {
    if (!endDate) return "";
    const d = new Date(endDate);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Campaign ended";
    if (days === 0) return "Ends today";
    return `${days} day${days === 1 ? "" : "s"} to go`;
  }

  // Load campaigns from Firestore
  if (gridEl && db && collection && onSnapshot) {
    onSnapshot(
      collection(db, "campaigns"),
      (snap) => {
        const campaigns = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() || {};
          const createdAt =
            data.createdAt && typeof data.createdAt.toDate === "function"
              ? data.createdAt.toDate()
              : data.startDate
              ? new Date(data.startDate)
              : null;

          campaigns.push({
            id: docSnap.id,
            title: data.title || "Untitled campaign",
            organizer: data.organizer || data.ownerName || "Organizer not specified",
            location: data.location || "",
            summary: data.summary || "",
            description: data.description || "",
            coverImageUrl: data.coverImageUrl || "SDP/aid 4.jpg",
            amountRaised: Number(data.amountRaised || 0),
            goalAmount: Number(data.goalAmount || data.goal || 0),
            endDate: data.endDate || "",
            createdAt
          });
        });

        // Sort by createdAt (newest first)
        campaigns.sort((a, b) => {
          const ta = a.createdAt ? a.createdAt.getTime() : 0;
          const tb = b.createdAt ? b.createdAt.getTime() : 0;
          return tb - ta;
        });

        // Populate featured campaign with the first result
        if (campaigns.length && featuredSection) {
          const first = campaigns[0];
          featuredSection.dataset.campaignId = first.id;

          if (featuredImage) featuredImage.src = first.coverImageUrl;
          if (featuredTitle) featuredTitle.textContent = first.title;
          if (featuredDesc) {
            featuredDesc.textContent =
              first.summary ||
              first.description ||
              "Click to learn more about this campaign.";
          }

          const goToFeatured = () => {
            window.location.href = `Campaign.html?id=${first.id}`;
          };

          featuredSection.onclick = goToFeatured;
          if (featuredReadMore) {
            featuredReadMore.onclick = (e) => {
              e.stopPropagation();
              goToFeatured();
            };
          }
          if (featuredDonate) {
            featuredDonate.onclick = (e) => {
              e.stopPropagation();
              goToFeatured();
            };
          }
        }

        // Populate grid with up to 6 campaigns
        if (gridEl) {
          gridEl.innerHTML = "";
          const others = campaigns.slice(0, 6);

          others.forEach((c) => {
            const card = document.createElement("div");
            card.className = "campaign-card";
            card.dataset.campaignId = c.id;

            card.addEventListener("click", () => {
              window.location.href = `Campaign.html?id=${c.id}`;
            });

            const progressText =
              c.goalAmount > 0
                ? `${formatNaira(c.amountRaised)} out of ${formatNaira(c.goalAmount)} goal`
                : `${formatNaira(c.amountRaised)} raised`;

            const daysLeftText = getDaysLeft(c.endDate);

            card.innerHTML = `
              <img src="${c.coverImageUrl}" alt="Campaign Image">
              <div class="campaign-content">
                <h3>${c.title} | 
                  <a href="Campaign.html?id=${c.id}" onclick="event.stopPropagation();">
                    Read more
                  </a>
                </h3>
                <small class="category">${c.organizer}</small>
                <p class="donation-info">${progressText}</p>
                <p class="days-left">${daysLeftText}</p>
              </div>
            `;

            gridEl.appendChild(card);
          });
        }
      },
      (error) => {
        console.error("❌ Failed to load campaigns for home page:", error);
      }
    );
  }

  // Newsletter form validation
  const newsletterForm = document.querySelector(".impact-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.includes("@")) {
        alert("Thank you for subscribing!");
        emailInput.value = "";
      } else {
        alert("Please enter a valid email address.");
      }
    });
  }

  // See More button -> go to full donation listing
  const seeMoreBtn = document.querySelector(".see-more");
  if (seeMoreBtn) {
    seeMoreBtn.addEventListener("click", function () {
      window.location.href = "Donation.html";
    });
  }
});
