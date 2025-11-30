// adminLogout.js
document.addEventListener("DOMContentLoaded", () => {
  const FB = window.__FIREBASE__;
  if (!FB) {
    console.error("❌ Firebase not initialized for logout.");
    return;
  }

  const { signOut, auth } = FB;
  const logoutLink = document.getElementById("logout");

  if (!logoutLink) return;

  logoutLink.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      await signOut(auth);  // REAL Firebase logout
      console.log("🔐 Admin logged out");

      // Clear any admin indicators
      localStorage.removeItem("loggedInAdmin");
      sessionStorage.removeItem("loggedInAdmin");

      // Redirect to sign in
      window.location.href = "Sign up.html?mode=login";
    } catch (err) {
      console.error("❌ Logout error:", err);
      alert("Failed to log out. Check console for details.");
    }
  });
});
