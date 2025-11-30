// Logic for the admin dashboard.  This module populates the
// statistics cards, renders donation analytics with Chart.js and
// populates the recent donations table.  It queries Firestore to
// retrieve counts, campaigns and donation records.  The chart and
// table are automatically updated when the page loads, and
// dropdowns allow filtering by month.

import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

let donationsData = [];
let donationChart;
let allMonths = [];

/**
 * Escape HTML special characters to avoid injection.  This helper is
 * used when inserting user‑supplied data into the DOM.
 * @param {string} str input string
 * @returns {string}
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
 * Set up real‑time listeners for user, donation and campaign
 * collections.  When documents change, counts, donation data,
 * chart and table are automatically updated.  Campaign counts
 * derive pending status by inspecting the status field of each
 * document.  Donation snapshots rebuild the donations array and
 * refresh the UI while preserving the currently selected month
 * filters.
 */
function initRealtimeUpdates() {
  // Users count
  onSnapshot(collection(db, 'users'), (snap) => {
    document.getElementById('stat-total-users').textContent = snap.size.toLocaleString();
  });
  // Donations count and data
  onSnapshot(collection(db, 'donations'), (snap) => {
    document.getElementById('stat-total-donations').textContent = snap.size.toLocaleString();
    // Build donations array
    donationsData = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      let date;
      if (data.timestamp && typeof data.timestamp.toDate === 'function') {
        date = data.timestamp.toDate();
      } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        date = data.createdAt.toDate();
      } else if (data.date) {
        date = new Date(data.date);
      } else {
        date = new Date();
      }
      const amount = Number(data.amount || data.value || data.total || 0);
      const donor = data.donorName || data.donor || data.name || 'Anonymous';
      const campaign = data.campaignName || data.campaign || data.campaignTitle || '';
      const status = data.status || 'Donated';
      donationsData.push({ date, amount, donor, campaign, status });
    });
    // Group donations and update options, chart and table
    const grouped = groupDonationsByMonth();
    // Preserve selected values
    const monthSelectEl = document.getElementById('monthSelect');
    const donationsSelectEl = document.getElementById('donationsMonthSelect');
    const prevChartVal = monthSelectEl ? monthSelectEl.value : '';
    const prevTableVal = donationsSelectEl ? donationsSelectEl.value : '';
    populateMonthOptions(grouped);
    // Restore previous selections if still valid
    if (monthSelectEl) {
      if (prevChartVal && allMonths.includes(prevChartVal)) {
        monthSelectEl.value = prevChartVal;
      }
    }
    if (donationsSelectEl) {
      if (prevTableVal === '' || allMonths.includes(prevTableVal)) {
        donationsSelectEl.value = prevTableVal;
      }
    }
    const chartMonth = monthSelectEl && monthSelectEl.value ? monthSelectEl.value : (allMonths[0] || '');
    updateChart(chartMonth);
    const tableMonth = donationsSelectEl ? donationsSelectEl.value : '';
    renderRecentDonations(tableMonth || chartMonth);
  });
  // Campaign counts
  onSnapshot(collection(db, 'campaigns'), (snap) => {
    let pending = 0;
    snap.forEach((docSnap) => {
      const status = String((docSnap.data() || {}).status || '').toLowerCase();
      if (status.includes('pending')) pending++;
    });
    document.getElementById('stat-total-campaigns').textContent = snap.size.toLocaleString();
    document.getElementById('stat-pending-campaigns').textContent = pending.toLocaleString();
  });
}

/**
 * Load all donation records from Firestore into `donationsData`.  The
 * code attempts to extract sensible defaults for the donation date
 * (checking for `timestamp` or `createdAt` fields) as well as
 * amount, donor name, campaign title and status.  Unknown values
 * fall back to safe defaults.
 */
async function loadDonations() {
  const snap = await getDocs(collection(db, "donations"));
  donationsData = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    let date;
    if (data.timestamp && typeof data.timestamp.toDate === 'function') {
      date = data.timestamp.toDate();
    } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      date = data.createdAt.toDate();
    } else if (data.date) {
      date = new Date(data.date);
    } else {
      date = new Date();
    }
    const amount = Number(data.amount || data.value || data.total || 0);
    const donor = data.donorName || data.donor || data.name || 'Anonymous';
    const campaign = data.campaignName || data.campaign || data.campaignTitle || '';
    const status = data.status || 'Donated';
    donationsData.push({ date, amount, donor, campaign, status });
  });
}

/**
 * Group the donations by year‑month string (YYYY-M).  This helper
 * returns an object keyed by year‑month with an array of donations
 * falling within that month.  Months with no donations will not
 * appear in the result.
 */
function groupDonationsByMonth() {
  const grouped = {};
  donationsData.forEach((d) => {
    const yearMonth = `${d.date.getFullYear()}-${d.date.getMonth() + 1}`;
    if (!grouped[yearMonth]) {
      grouped[yearMonth] = [];
    }
    grouped[yearMonth].push(d);
  });
  return grouped;
}

/**
 * Populate the month selection dropdowns for the chart and the
 * recent donations table.  Months are sorted descending by date so
 * the most recent appears first.  Both selects receive identical
 * options.  A leading “All Months” option is added to the table
 * select to allow showing all donations regardless of month.
 */
function populateMonthOptions(grouped) {
  const monthSelect = document.getElementById("monthSelect");
  const donationsMonthSelect = document.getElementById("donationsMonthSelect");
  // Clear existing options
  monthSelect.innerHTML = "";
  donationsMonthSelect.innerHTML = '<option value="">All Months</option>';
  // Sort keys by date descending
  const keys = Object.keys(grouped).sort((a, b) => {
    const [ay, am] = a.split('-').map(Number);
    const [by, bm] = b.split('-').map(Number);
    return new Date(by, bm - 1) - new Date(ay, am - 1);
  });
  allMonths = keys;
  keys.forEach((ym) => {
    const [year, month] = ym.split('-').map(Number);
    const label = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    const opt = document.createElement('option');
    opt.value = ym;
    opt.textContent = label;
    monthSelect.appendChild(opt);
    const opt2 = document.createElement('option');
    opt2.value = ym;
    opt2.textContent = label;
    donationsMonthSelect.appendChild(opt2);
  });
}

/**
 * Compute chart labels and values for the given year‑month.  Labels
 * are zero‑padded day numbers ("01" through "31") and values are
 * the sum of donations per day.  If the month has fewer than 31
 * days the extra entries remain zero.
 * @param {string} ym year‑month string (YYYY-M)
 */
function getChartDataForMonth(ym) {
  const [yearStr, monthStr] = ym.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const labels = [];
  const values = new Array(daysInMonth).fill(0);
  for (let day = 1; day <= daysInMonth; day++) {
    labels.push(day.toString().padStart(2, '0'));
  }
  const selected = donationsData.filter((d) => d.date.getFullYear() === year && d.date.getMonth() === month);
  selected.forEach((d) => {
    const day = d.date.getDate();
    values[day - 1] += d.amount;
  });
  return { labels, values };
}

/**
 * Render or update the Chart.js instance for the selected month.  If
 * a chart already exists it is updated in place; otherwise a new
 * chart is created.  The month label is also written into the
 * heading so the user can see which period is displayed.
 * @param {string} ym year‑month string (YYYY-M)
 */
function updateChart(ym) {
  if (!ym) {
    ym = allMonths.length ? allMonths[0] : '';
  }
  const chartTitleSpan = document.getElementById('chart-month-label');
  if (ym) {
    const [year, month] = ym.split('-').map(Number);
    const label = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    chartTitleSpan.textContent = label;
  } else {
    chartTitleSpan.textContent = '';
  }
  const { labels, values } = ym ? getChartDataForMonth(ym) : { labels: [], values: [] };
  const ctx = document.getElementById('donationChart').getContext('2d');
  if (donationChart) {
    donationChart.data.labels = labels;
    donationChart.data.datasets[0].data = values;
    donationChart.update();
  } else {
    donationChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Donations (₦)',
            data: values,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}

/**
 * Populate the recent donations table.  Donations are sorted by
 * descending date and the top 10 are displayed.  A month filter may
 * be provided; if empty, all donations are shown.  Each row shows
 * the donor name, campaign title, formatted date, formatted amount
 * and status.
 * @param {string} ym optional year‑month filter (YYYY-M)
 */
function renderRecentDonations(ym) {
  const tbody = document.getElementById('recent-donations');
  tbody.innerHTML = '';
  let filtered = donationsData.slice();
  if (ym) {
    const [year, month] = ym.split('-').map(Number);
    filtered = filtered.filter((d) => d.date.getFullYear() === year && d.date.getMonth() === month - 1);
  }
  // Sort descending by date
  filtered.sort((a, b) => b.date - a.date);
  // Take the first 10
  const top = filtered.slice(0, 10);
  top.forEach((d) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(d.donor)}</td>
      <td>${escapeHtml(d.campaign)}</td>
      <td>${d.date.toLocaleString()}</td>
      <td class="amount">₦${Number(d.amount).toLocaleString()}</td>
      <td><span class="status-pill">${escapeHtml(d.status)}</span></td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Initialise the dashboard: load counts, donations and setup UI.
 * Called once the DOM is ready.
 */
async function init() {
  // Wire up select controls.  Changes update the chart and table
  document.getElementById('monthSelect').addEventListener('change', (e) => {
    updateChart(e.target.value);
  });
  document.getElementById('donationsMonthSelect').addEventListener('change', (e) => {
    renderRecentDonations(e.target.value);
  });
  // Initialize real‑time listeners for counts and donations
  initRealtimeUpdates();
}

document.addEventListener('DOMContentLoaded', init);