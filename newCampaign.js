// newCampaign.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ newCampaign.js loaded");

  const firebaseExports = window.__FIREBASE__;

  if (!firebaseExports) {
    console.error("❌ Firebase not initialized. Make sure firebase.js is loaded BEFORE newCampaign.js");
    return;
  }

  const {
    auth,
    storage,
    storageRef,
    uploadBytes,
    getDownloadURL,
    createCampaign
  } = firebaseExports;

  const form = document.getElementById("campaign-form");

  if (!form) {
    console.error("❌ Could not find form with id='campaign-form'");
    return;
  }

  console.log("✅ Campaign form found:", form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Publishing...";
    }

    try {
      const user = auth.currentUser;
      console.log("Current user:", user);

      if (!user) {
        alert("You must be signed in to publish a campaign.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "PUBLISH CAMPAIGN";
        }
        return;
      }

      // Get form values by their IDs from New Campaign.html
      const organizer = document.getElementById("organizer").value.trim();
      const title = document.getElementById("title").value.trim();
      const location = document.getElementById("location").value.trim();
      const goalAmount = Number(document.getElementById("goal").value);
      const startDate = document.getElementById("start-date").value;
      const endDate = document.getElementById("end-date").value;
      const description = document.getElementById("description").value.trim();
      const coverInput = document.getElementById("cover-photo");

      console.log("Form values:", {
        organizer,
        title,
        location,
        goalAmount,
        startDate,
        endDate,
        description
      });

      if (!title || !description || !goalAmount) {
        alert("Please fill in all required fields.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "PUBLISH CAMPAIGN";
        }
        return;
      }

      let coverImageUrl = "";

      // Upload cover image if provided
      if (coverInput && coverInput.files && coverInput.files[0]) {
        const file = coverInput.files[0];
        console.log("Uploading cover image:", file.name);

        const imageRef = storageRef(
          storage,
          `campaign-covers/${user.uid}/${Date.now()}-${file.name}`
        );

        const snapshot = await uploadBytes(imageRef, file);
        coverImageUrl = await getDownloadURL(snapshot.ref);

        console.log("✅ Cover image URL:", coverImageUrl);
      } else {
        console.warn("No cover image selected.");
      }

      // Build the data object expected by createCampaign in firebase.js
      const campaignData = {
        title,
        summary: description,     // mapped to "summary" field in Firestore
        goalAmount,
        coverImageUrl,
        location,
        category: "",            // you can extend this later
        organizer,
        startDate,
        endDate
      };

      console.log("Sending campaignData to createCampaign:", campaignData);

      // Save campaign in Firestore
      const campaignId = await createCampaign(campaignData, user);
      console.log("✅ Campaign created with ID:", campaignId);

      alert("Campaign published successfully!");

      // Reset form and redirect
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "PUBLISH CAMPAIGN";
      }

      window.location.href = "Your Campaings.html";
    } catch (err) {
      console.error("❌ Error publishing campaign:", err);
      alert("There was an error publishing your campaign. Please check the console for details.");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "PUBLISH CAMPAIGN";
      }
    }
  });
});
