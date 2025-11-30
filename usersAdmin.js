// Logic for the admin users list.  This module fetches all users
// from Firestore, renders them into the table and wires up the
// search bars to filter by user id, name or email.  A default
// status of "Active" is displayed if no status is defined in the
// Firestore document.

import { db } from "./firebase.js";
import { collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

let usersData = [];

function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Render the given list of users.  Existing rows are removed first.
 * The summary in the footer reflects the filtered list length versus
 * the total loaded users.  Each row contains a checkbox cell,
 * followed by the user id, name, email and status.
 * @param {Array<Object>} list List of user objects to render
 */
function renderUsers(list) {
  const table = document.querySelector('.table');
  // Remove existing rows
  table.querySelectorAll('.row').forEach((r) => r.remove());
  const foot = table.querySelector('.foot');
  list.forEach((u) => {
    const rowHtml = `
      <div class="row">
        <div><span class="check"></span></div>
        <div>${escapeHtml(u.id.slice(0, 5))}…</div>
        <div>${escapeHtml(u.name)}</div>
        <div>${escapeHtml(u.email)}</div>
        <div><span class="status">${escapeHtml(u.status)}</span></div>
      </div>
    `;
    foot.insertAdjacentHTML('beforebegin', rowHtml);
  });
  // Update summary text
  const summary = foot.querySelector('div');
  if (summary) {
    summary.textContent = `Showing 1–${list.length} of ${usersData.length}`;
  }
}

/**
 * Load all users from Firestore.  The Firestore document id is used
 * as the user id.  Display names are resolved from `displayName`
 * or `name` fields.  If no email or status are present sensible
 * defaults are used.
 */
function loadUsers() {
  // Listen to users collection in real time.  When data changes
  // rebuild the usersData array and re‑render.
  onSnapshot(collection(db, 'users'), (snap) => {
    usersData = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      usersData.push({
        id: docSnap.id,
        name: data.displayName || data.name || '',
        email: data.email || '',
        status: data.status || 'Active'
      });
    });
    renderUsers(usersData);
  });
}

/**
 * Filter the loaded users by a search term across id, name or
 * email.  The comparison is case insensitive.  When no term is
 * supplied the full list is rendered.
 * @param {string} term The current search term
 */
function filterUsers(term) {
  const t = (term || '').trim().toLowerCase();
  if (!t) {
    renderUsers(usersData);
    return;
  }
  const filtered = usersData.filter((u) => {
    return (
      u.id.toLowerCase().includes(t) ||
      u.name.toLowerCase().includes(t) ||
      u.email.toLowerCase().includes(t)
    );
  });
  renderUsers(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  // Start listening for user changes
  loadUsers();
  // Attach listeners to both search inputs (topbar and subsearch)
  const searchInputs = document.querySelectorAll('.search input, .subsearch input');
  searchInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      filterUsers(e.target.value);
    });
  });
});