// newCampaign.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ newCampaign.js loaded");

  const firebaseExports = window.__FIREBASE__;

  if (!firebaseExports) {
    console.error("Firebase not initialized. Make sure firebase.js is loaded BEFORE newCampaign.js");
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

  // Styled message helper
  function showMessage(type, html) {
    const box = document.getElementById("campaign-message");
    if (!box) return;

    // Reset classes
    box.classList.remove("success", "error");

    // Apply type class
    box.classList.add(type === "success" ? "success" : "error");

    // Set content and show
    box.innerHTML = html;
    box.style.display = "block";
    box.style.animation = "fadeIn 0.3s ease-out";

    // Clear previous timer if any
    if (box._hideTimeout) {
      clearTimeout(box._hideTimeout);
    }

    // Auto hide
    box._hideTimeout = setTimeout(() => {
      box.style.animation = "fadeOut 0.3s ease-out";
      setTimeout(() => {
        box.style.display = "none";
        box.style.animation = "";
      }, 300);
    }, 4000);
  }

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
        showMessage("error", "You must be signed in to publish a campaign.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "POST CAMPAIGN";
        }
        return;
      }

      // 1. Read form fields
      const organizer = document.getElementById("organizer").value.trim();
      const title = document.getElementById("title").value.trim();
      const location = document.getElementById("location").value.trim();
      const goalAmount = Number(document.getElementById("goal").value);
      const startDate = document.getElementById("start-date").value;
      const endDate = document.getElementById("end-date").value;
      const description = document.getElementById("description").value.trim();

      const coverInput = document.getElementById("cover-photo");
      const additionalInput = document.getElementById("additional-photos");

      console.log("Form values:", {
        organizer,
        title,
        location,
        goalAmount,
        startDate,
        endDate,
        description
      });

      if (!organizer || !title || !location || !goalAmount || !startDate || !endDate || !description) {
        showMessage("error", "Please fill in all required fields before posting your campaign.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "POST CAMPAIGN";
        }
        return;
      }

      // 2. Upload cover image (single)
      let coverImageUrl = "";

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
        showMessage("error", "Please select a cover image for your campaign.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "POST CAMPAIGN";
        }
        return;
      }

      // 3. Upload additional photos (multiple)
      const additionalPhotoUrls = [];

      if (additionalInput && additionalInput.files && additionalInput.files.length > 0) {
        console.log(`Uploading ${additionalInput.files.length} additional photo(s)...`);

        for (let i = 0; i < additionalInput.files.length; i++) {
          const file = additionalInput.files[i];

          const extraRef = storageRef(
            storage,
            `campaign-photos/${user.uid}/${Date.now()}-${i}-${file.name}`
          );

          const snap = await uploadBytes(extraRef, file);
          const url = await getDownloadURL(snap.ref);
          additionalPhotoUrls.push(url);

          console.log(`✅ Uploaded extra photo ${i + 1}:`, url);
        }
      } else {
        console.log("No additional photos selected.");
      }

      // 4. Prepare campaign data for Firestore
      const campaignData = {
        title,
        summary: description,
        goalAmount,
        coverImageUrl,
        location,
        category: "",
        organizer,
        startDate,
        endDate,
        gallery: additionalPhotoUrls
      };

      console.log("Sending campaignData to createCampaign:", campaignData);

      // 5. Save campaign in Firestore
      const campaignId = await createCampaign(campaignData, user);
      console.log("✅ Campaign created with ID:", campaignId);

      showMessage(
        "success",
        "🎉 Thank you for using <span style='color:#4A249D; font-weight:600;'>AidReach</span>.<br>Your campaign has been posted successfully, it is currently under review!"
      );

      form.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "POST CAMPAIGN";
      }

      // Optional redirect
    setTimeout(() => {
      window.location.href = "Your Campaings.html";
    }, 10000);
    } catch (error) {
      console.error("❌ Error publishing campaign:", error);
      showMessage("error", "Something went wrong while publishing your campaign. Please try again.");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "POST CAMPAIGN";
      }
    }
  });
});
