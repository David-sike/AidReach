/**
 * Logic for the "New Campaign" form. This script wires up the form
 * submission event, collects the user's input, persists it to
 * Firestore via helper functions from firebase.js, and provides
 * user feedback. To use this module, include it on the New Campaign
 * page with a script tag using `type="module"`.
 */

import { addCampaign } from "./firebase.js";

// Wait for the DOM to be fully loaded before attaching handlers.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("new-campaign-form");
  const statusContainer = document.getElementById("form-status");

  if (!form) {
    console.warn(
      "newcampaign.js: No form with id 'new-campaign-form' found on the page."
    );
    return;
  }

  /**
   * Helper to display a status message to the user.
   *
   * @param {string} message The message to display.
   * @param {string} type Bootstrap-like alert type (e.g. 'success', 'danger').
   */
  function showStatus(message, type = "info") {
    if (!statusContainer) return;
    statusContainer.textContent = message;
    statusContainer.className = "";
    statusContainer.classList.add("alert", `alert-${type}`);
  }

  // Attach the submit handler to the form.
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Collect the form data into an object. Adjust the selectors below
    // according to your actual input names/ids in the HTML.
    const formData = new FormData(form);
    const campaignData = {
      title: formData.get("title") || "",
      description: formData.get("description") || "",
      targetAmount: parseFloat(formData.get("targetAmount")) || 0,
      // Optionally store start/end dates as timestamps or strings.
      startDate: formData.get("startDate") || null,
      endDate: formData.get("endDate") || null,
      // You can include additional fields such as createdBy, imageUrl, etc.
      createdAt: new Date().toISOString(),
    };

    try {
      showStatus("Saving campaign…", "info");
      const docId = await addCampaign(campaignData);
      showStatus(
        `Campaign created successfully! Document ID: ${docId}.`,
        "success"
      );
      // Optionally reset the form after submission.
      form.reset();
    } catch (error) {
      showStatus("An error occurred while creating the campaign.", "danger");
    }
  });
});