// navbar.js (ES Module)
// Toggles Sign in / Get Started / Sign Out based on Firebase Auth state
// Works across all pages that include this file with: <script type="module" src="navbar.js"></script>

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// --------- Adjust if your filenames differ ----------
const HOME_PAGE   = "Home.html";
const SIGNUP_PAGE = "Sign up.html"; // login mode via ?mode=login
// ----------------------------------------------------

// You can override this by defining window._FIREBASE_CONFIG_ before loading navbar.js
const firebaseConfig = {
  apiKey: "AIzaSyBg_xrflYlYEPk6txfP-5iR0y-tBRFZGcA",
  authDomain: "aidreach-2d1ec.firebaseapp.com",
  projectId: "aidreach-2d1ec",
  storageBucket: "aidreach-2d1ec.firebasestorage.app",
  messagingSenderId: "1045366476824",
  appId: "1:1045366476824:web:245e9085184f5cbf98336d",
  measurementId: "G-RZ5EPWMM33"
};

// Reuse existing app if already initialized elsewhere
const app  = getApps().length ? getApp() : initializeApp(CONFIG);
const auth = getAuth(app);

// ---------- DOM helpers ----------
const $ = (sel) => document.querySelector(sel);

// Ensure there is a Sign Out button; create it if missing
function ensureSignOutButton() {
  let btn = $(".sign-out");
  if (!btn) {
    const host = $(".nav-buttons") || $(".navbar") || document.body;
    btn = document.createElement("button");
    btn.className = "sign-out";
    btn.textContent = "Sign Out";
    btn.style.display = "none"; // hidden by default until authed

    // Basic styling to match your theme (remove if you style in CSS)
    btn.style.backgroundColor = "#4A249D";
    btn.style.color = "#fff";
    btn.style.padding = "8px 12px";
    btn.style.borderRadius = "8px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.marginLeft = "8px";

    host.appendChild(btn);
  }
  return btn;
}

// Bind click handlers (idempotent)
function bindClickHandlers() {
  const signIn     = $(".sign-in");
  const getStarted = $(".get-started");
  const signOutBtn = ensureSignOutButton();

  if (signIn && !signIn.dataset.bound) {
    signIn.addEventListener("click", () => {
      window.location.href = `${SIGNUP_PAGE}?mode=login`;
    });
    signIn.dataset.bound = "1";
  }

  if (getStarted && !getStarted.dataset.bound) {
    getStarted.addEventListener("click", () => {
      window.location.href = `${SIGNUP_PAGE}?mode=signup`;
    });
    getStarted.dataset.bound = "1";
  }

  if (signOutBtn && !signOutBtn.dataset.bound) {
    signOutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        // Clear cached name or any session-related values you set elsewhere
        localStorage.removeItem("fullName");
        // localStorage.removeItem("beneficiaryId"); // uncomment if you cached this
        window.location.href = HOME_PAGE;
      } catch (e) {
        console.error("Sign out failed:", e);
        alert("Could not sign out. Please try again.");
      }
    });
    signOutBtn.dataset.bound = "1";
  }
}

// Show/hide buttons based on auth state
function toggleButtons(isAuthed) {
  const signIn     = $(".sign-in");
  const getStarted = $(".get-started");
  const signOutBtn = ensureSignOutButton();

  if (signIn)     signIn.style.display     = isAuthed ? "none" : "";
  if (getStarted) getStarted.style.display = isAuthed ? "none" : "";
  if (signOutBtn) signOutBtn.style.display = isAuthed ? "" : "none";
}

// Bind once the DOM is ready; re-bind after a short delay in case navbar is injected late
document.addEventListener("DOMContentLoaded", () => {
  bindClickHandlers();
  setTimeout(bindClickHandlers, 150);
});

// React to auth state on every page
onAuthStateChanged(auth, (user) => {
  toggleButtons(!!user);

  // Optional: cache user name for pages that don't import Firebase
  if (user) {
    const name = user.displayName || user.email || "Friend";
    localStorage.setItem("fullName", name);
  }
});
// =====================
// DROPDOWN TOGGLE LOGIC
// =====================
document.addEventListener('DOMContentLoaded', () => {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Stop from bubbling up

      const dropdown = toggle.parentElement;

      // Close all dropdowns first
      document.querySelectorAll('.dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
      });

      // Toggle the clicked one
      dropdown.classList.toggle('active');
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  });
});

// =====================
// NAVBAR LINK LOGIC
// =====================
const home = document.querySelector('.home');
const donateLink = document.querySelector('.donate');
const youDonation = document.querySelector('.yourDonations');
const createCampaign = document.querySelector('.createCampaign');
const yourCampaign = document.querySelector('.yourCampaign');
const signin = document.querySelector('.sign-in');
const getstarted = document.querySelector('.get-started');

if (home) {
  home.addEventListener('click', (e) => {
    window.location.href = 'Home.html';
  });
}
if (donateLink) {
  donateLink.addEventListener('click', (e) => {
    window.location.href = 'Donation.html';
  });
}
if (youDonation) {
  youDonation.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'Your donations.html';
  });
}

if (createCampaign) {
  createCampaign.addEventListener('click', (e) => {
    window.location.href = 'New Campaign.html';
  });
}
if (yourCampaign) {
  yourCampaign.addEventListener('click', (e) => {
    window.location.href = 'Your Campaings.html';
  });
}

// Default button behavior (will be overridden below if Firebase detects login)
if (getstarted) {
  getstarted.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'Sign up.html?mode=signup';
  });
}
if (signin) {
  signin.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'Sign up.html?mode=login';
  });
}

// ==========================
// MAKE A DONATION BUTTON
// ==========================
const makeDonationBtn = document.querySelector('.cta-button');

if (makeDonationBtn) {
  makeDonationBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'Donation.html';
  });
}

// ==========================
// FIREBASE AUTH INTEGRATION
// ==========================
(function attachFirebaseBehavior() {
  // Wait until DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.querySelector('.sign-in');
    const getStartedBtn = document.querySelector('.get-started');

    const FB = window.__FIREBASE__;
    const canObserve = FB && FB.auth && typeof FB.onAuthStateChanged === 'function';

    if (canObserve && signInBtn) {
      FB.onAuthStateChanged(FB.auth, (user) => {
        if (user) {
          // ✅ User logged in
          signInBtn.textContent = 'Sign out';
          signInBtn.onclick = async (e) => {
            e.preventDefault();
            try {
              if (typeof window.firebaseSignOut === 'function') {
                await window.firebaseSignOut();
              } else if (typeof FB.signOut === 'function') {
                await FB.signOut(FB.auth);
              }
            } catch (err) {
              console.error('Sign out failed:', err);
            } finally {
              window.location.href = 'Home.html';
            }
          };

          // Optional: hide "Get Started" when logged in
          if (getStartedBtn) getStartedBtn.style.display = 'none';
        } else {
          // 🚪 User logged out
          signInBtn.textContent = 'Sign in →';
          signInBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'Sign up.html?mode=login';
          };
          if (getStartedBtn) {
            getStartedBtn.style.display = '';
            getStartedBtn.onclick = (e) => {
              e.preventDefault();
              window.location.href = 'Sign up.html?mode=signup';
            };
          }
        }
      });
    }
  });
})();