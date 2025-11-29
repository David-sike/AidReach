/**
 * Manage Campaigns (Admin side). This script fetches all campaigns from
 * Firestore and renders them into a table. It also lays the
 * groundwork for future enhancements such as editing or deleting
 * campaigns.
 */

import { fetchCampaigns } from "./firebase.js";

// Run when the DOM is ready.
document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("campaigns-table-body");
  const statusEl = document.getElementById("manage-status");

  if (!tbody) {
    console.warn(
      "manageCampaigns.js: Could not find a table body with id 'campaigns-table-body'."
    );
    return;
  }

  function showStatus(message, type = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "";
    statusEl.classList.add("alert", `alert-${type}`);
  }

  try {
    showStatus("Loading campaigns…", "info");
    const campaigns = await fetchCampaigns();
    tbody.innerHTML = "";
    campaigns.forEach((campaign) => {
      const tr = document.createElement("tr");
      // Create table cells for ID, Title, Target, Start Date, End Date, etc.
      tr.innerHTML = `
        <td>${campaign.id}</td>
        <td>${campaign.title || ""}</td>
        <td>${campaign.description || ""}</td>
        <td>${campaign.targetAmount || 0}</td>
        <td>${campaign.startDate || ""}</td>
        <td>${campaign.endDate || ""}</td>
      `;
      tbody.appendChild(tr);
    });
    showStatus(`Loaded ${campaigns.length} campaign(s).`, "success");
  } catch (error) {
    console.error(error);
    showStatus("Failed to load campaigns.", "danger");
  }
});