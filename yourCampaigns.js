// yourCampaigns.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ yourCampaigns.js loaded");

  const FB = window.__FIREBASE__;
  if (!FB) {
    console.error("❌ Firebase not initialized on Your Campaigns page");
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
    updateDoc,
    serverTimestamp,
    arrayUnion
  } = FB;

  const container = document.querySelector("#your-campaigns-list");
  const newCampaignBtn = document.getElementById("newCampaignBtn");
  const headerTitle = document.querySelector(".header h1");

  if (!container) {
    console.error("❌ #your-campaigns-list not found");
    return;
  }

  // Button to start a new campaign
  if (newCampaignBtn) {
    newCampaignBtn.addEventListener("click", () => {
      window.location.href = "New Campaign.html";
    });
  }

  const formatNaira = (amount) => {
    const n = Number(amount) || 0;
    return "₦" + n.toLocaleString("en-NG");
  };

  const formatCreatedAt = (ts) => {
    if (!ts || !ts.toDate) return "Date not available";
    const d = ts.toDate();
    return d.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  function showDashboardMessage(type, text) {
    const box = document.getElementById("your-campaign-message");
    if (!box) return;

    box.classList.remove("success", "error");
    box.classList.add(type === "success" ? "success" : "error");

    box.textContent = text;
    box.style.display = "block";

    if (box._hideTimeout) clearTimeout(box._hideTimeout);
    box._hideTimeout = setTimeout(() => {
      box.style.display = "none";
    }, 4000);
  }

  // Modal elements for posting updates
  const updateModal = document.getElementById("update-modal");
  const updateTextarea = document.getElementById("update-text");
  const updateCancelBtn = document.getElementById("update-cancel-btn");
  const updateSaveBtn = document.getElementById("update-save-btn");
  let activeCampaignId = null;

  function openUpdateModal(campaignId) {
    activeCampaignId = campaignId;
    if (updateModal) {
      updateModal.style.display = "flex";
    }
    if (updateTextarea) {
      updateTextarea.value = "";
      updateTextarea.focus();
    }
  }

  function closeUpdateModal() {
    activeCampaignId = null;
    if (updateModal) {
      updateModal.style.display = "none";
    }
  }

  if (updateCancelBtn) {
    updateCancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeUpdateModal();
    });
  }

  if (updateSaveBtn) {
    updateSaveBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!activeCampaignId || !updateTextarea) return;
      const text = updateTextarea.value.trim();
      if (!text) {
        showDashboardMessage("error", "Please type something before posting.");
        return;
      }

      try {
        await updateDoc(doc(db, "campaigns", activeCampaignId), {
          updates: arrayUnion({
            text,
            createdAt: new Date().toISOString()
          }),
          updatedAt: serverTimestamp()
        });
        showDashboardMessage("success", "Your update has been posted.");
        closeUpdateModal();
      } catch (err) {
        console.error("❌ Failed to save update:", err);
        showDashboardMessage("error", "Could not save update. Please try again.");
      }
    });
  }

  auth.onAuthStateChanged((user) => {
    if (!user) {
      console.warn("User not signed in on Your Campaigns page");
      container.innerHTML = `
        <p style="text-align:center; padding:20px; color:#b91c1c;">
          You need to be signed in to see your campaigns.
          <br>
          <a href="Sign up.html?mode=login" style="color:#1d4ed8; text-decoration:underline;">
            Go to Sign in page
          </a>
        </p>
      `;
      return;
    }

    console.log("👤 Loading campaigns for user:", user.uid);

    if (headerTitle) {
      const name = user.displayName || user.email || "User";
      headerTitle.textContent = `Welcome back, ${name}`;
    }

    const campaignsRef = collection(db, "campaigns");
    const q = query(campaignsRef, where("ownerId", "==", user.uid));

    onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          container.innerHTML = `
            <p style="text-align:center; padding:20px; color:#64748b;">
              You have not created any campaigns yet.
              <br>
              <button style="margin-top:10px; padding:8px 16px; border-radius:999px; border:none; background:#1d4ed8; color:white; cursor:pointer;"
                onclick="window.location.href='New Campaign.html'">
                Start a New Campaign
              </button>
            </p>
          `;
          return;
        }

        container.innerHTML = "";

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const id = docSnap.id;

          const title = data.title || "Untitled campaign";
          const cover = data.coverImageUrl || "SDP/aid 4.jpg";
          const goal = Number(data.goalAmount) || 0;
          const raised = Number(data.amountRaised) || 0;
          const donationsCount = Number(data.donationCount || data.donationsCount || 0);
          const status = data.status || "LIVE";
          const createdText = formatCreatedAt(data.createdAt);

          let pct = 0;
          if (goal > 0) {
            pct = Math.min(100, Math.max(0, (raised / goal) * 100));
          }

          const card = document.createElement("div");
          card.className = "card";
          card.setAttribute("data-campaign-id", id);

          card.onclick = () => {
            window.location.href = `Campaign.html?id=${id}`;
          };

          card.innerHTML = `
            <img src="${cover}" alt="Campaign Image">
            <div class="donation-content">
              <h6>${title}</h6>
              <div class="progress-info">
                <span>${formatNaira(raised)}</span> raised of ${formatNaira(goal)} goal
                <span class="status">${status}</span>
              </div>

              <div class="progress" data-campaign="${id}">
                <div class="progress__fill" style="width:${pct}%;"></div>
                <span class="progress__text">${pct.toFixed(0)}%</span>
              </div>

              <div class="card-footer">
                <span>${donationsCount} Donation${donationsCount === 1 ? "" : "s"}</span>
                <span>Created on ${createdText}</span>
              </div>

              <div class="card-actions">
                <button class="view-btn">View</button>
                <button class="edit-btn">Edit</button>
                <button class="share-btn">Share</button>
                <button class="close-btn">${status === "CLOSED" ? "Reopen" : "Close"}</button>
              </div>
            </div>
          `;

          const viewBtn = card.querySelector(".view-btn");
          const editBtn = card.querySelector(".edit-btn");
          const shareBtn = card.querySelector(".share-btn");
          const closeBtn = card.querySelector(".close-btn");

          if (viewBtn) {
            viewBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              window.location.href = `Campaign.html?id=${id}`;
            });
          }

          // Open the popup instead of prompt
          if (editBtn) {
            editBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              openUpdateModal(id);
            });
          }

          if (shareBtn) {
            shareBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const shareUrl = `${window.location.origin}/Campaign.html?id=${id}`;
              try {
                if (navigator.share) {
                  await navigator.share({
                    title,
                    text: "Support my campaign on AidReach",
                    url: shareUrl
                  });
                } else if (navigator.clipboard) {
                  await navigator.clipboard.writeText(shareUrl);
                  showDashboardMessage("success", "Campaign link copied to clipboard.");
                } else {
                  showDashboardMessage("success", `Share this link: ${shareUrl}`);
                }
              } catch (err) {
                console.warn("Share cancelled or failed:", err);
              }
            });
          }

          if (closeBtn) {
            closeBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const newStatus = status === "CLOSED" ? "LIVE" : "CLOSED";
              const confirmText =
                newStatus === "CLOSED"
                  ? "Are you sure you want to close this campaign so it stops receiving donations?"
                  : "Reopen this campaign so people can donate again?";

              if (!confirm(confirmText)) return;

              try {
                await updateDoc(doc(db, "campaigns", id), {
                  status: newStatus,
                  updatedAt: serverTimestamp()
                });
              } catch (err) {
                console.error("❌ Failed to update status:", err);
                showDashboardMessage("error", "Could not update campaign status. Please try again.");
              }
            });
          }

          container.appendChild(card);
        });
      },
      (error) => {
        console.error("❌ Failed to load user campaigns:", error);
        container.innerHTML = `
          <p style="text-align:center; padding:20px; color:#b91c1c;">
            Could not load your campaigns. Please refresh the page.
          </p>
        `;
      }
    );
  });
});
