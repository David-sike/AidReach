// Logic for the admin campaign list.  This module fetches all
// campaigns from Firestore, renders them into the table and adds a
// client‑side search that filters by ID, title or organiser.  A
// badge class is chosen based on the campaign status.  The table
// automatically reflects the number of campaigns loaded and
// filtered.

import { db } from "./firebase.js";
import { collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

let campaignsData = [];

/**
 * Escape HTML entities to prevent injection.  All user generated
 * values should pass through this before being inserted into the
 * DOM.
 */
function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Determine the badge CSS class based on the campaign status.  Any
 * status containing the substring "closed", "pending", "rejected"
 * or "live" (case insensitive) is mapped to the appropriate class.
 * Unknown statuses default to "pending" so a badge is always
 * rendered.
 * @param {string} status Campaign status string
 */
function toBadgeClass(status) {
  if (!status) return 'pending';
  const s = String(status).toLowerCase();
  if (s.includes('closed')) return 'closed';
  if (s.includes('pending')) return 'pending';
  if (s.includes('rejected')) return 'rejected';
  if (s.includes('live')) return 'live';
  return 'pending';
}

/**
 * Render the provided list of campaigns into the table.  Existing
 * rows are removed to avoid duplication.  The foot note showing
 * counts is updated to reflect the filtered list size versus the
 * total loaded campaigns.  Goal amounts are formatted with
 * thousand separators and prefixed with the Naira symbol.
 * @param {Array<Object>} list List of campaign records to render
 */
function renderCampaigns(list) {
  const table = document.querySelector('.table');
  // Remove any previously rendered rows
  table.querySelectorAll('.row').forEach((r) => r.remove());
  const foot = table.querySelector('.foot');
  list.forEach((c) => {
    const rowHtml = `
      <div class="row">
        <div>${escapeHtml(c.id.slice(0, 5))}</div>
        <div>${escapeHtml(c.title)}</div>
        <div>${escapeHtml(c.organizer)}</div>
        <div>${escapeHtml(c.startDate)}</div>
        <div>${escapeHtml(c.endDate)}</div>
        <div>₦${Number(c.goal).toLocaleString()}</div>
        <div><span class="badge ${toBadgeClass(c.status)}">${escapeHtml(String(c.status || '').toUpperCase())}</span></div>
      </div>
    `;
    foot.insertAdjacentHTML('beforebegin', rowHtml);
  });
  // Update the summary text
  const summary = foot.querySelector('div');
  if (summary) {
    summary.textContent = `Showing 1–${list.length} of ${campaignsData.length}`;
  }
}

/**
 * Load all campaigns from Firestore into memory and render them.
 */
function loadCampaigns() {
  // Listen for real‑time updates to campaigns.  Whenever the
  // collection changes the local array is rebuilt and re‑rendered.
  onSnapshot(collection(db, 'campaigns'), (snap) => {
    campaignsData = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      campaignsData.push({
        id: docSnap.id,
        title: data.title || '',
        organizer: data.organizer || data.ownerName || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        goal: data.goal || data.goalAmount || 0,
        status: data.status || 'PENDING'
      });
    });
    renderCampaigns(campaignsData);
  });
}

/**
 * Filter the campaigns by a search term.  Matches against the
 * campaign id, title or organizer name.  If the term is empty the
 * full list is displayed.
 * @param {string} term User entered search term
 */
function filterCampaigns(term) {
  const t = (term || '').trim().toLowerCase();
  if (!t) {
    renderCampaigns(campaignsData);
    return;
  }
  const filtered = campaignsData.filter((c) => {
    return (
      c.id.toLowerCase().includes(t) ||
      c.title.toLowerCase().includes(t) ||
      c.organizer.toLowerCase().includes(t)
    );
  });
  renderCampaigns(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  // Start listening to campaigns changes
  loadCampaigns();
  const searchInput = document.querySelector('#campaignSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterCampaigns(e.target.value);
    });
  }
});