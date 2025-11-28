// newCampaign.js

const firebaseExports = window.__FIREBASE__;

if (!firebaseExports) {
  console.error("Firebase not initialized. Check that firebase.js is loaded before this file.");
}

const {
  auth,
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL,
  createCampaign
} = firebaseExports || {};

const form = document.getElementById("campaign-form");

if (form && firebaseExports) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Publishing...";
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please sign in before creating a campaign.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "PUBLISH CAMPAIGN";
        }
        return;
      }

      // Grab form values
      const organizer = document.getElementById("organizer").value.trim();
      const title = document.getElementById("title").value.trim();
      const location = document.getElementById("location").value.trim();
      const goal = document.getElementById("goal").value;
      const accountNumber = document.getElementById("account").value.trim();
      const accountName = document.getElementById("account-name").value.trim();
      const startDate = document.getElementById("start-date").value;
      const endDate = document.getElementById("end-date").value;
      const description = document.getElementById("description").value.trim();
      const termsChecked = document.getElementById("terms").checked;

      const coverFileInput = document.getElementById("cover-photo");
      const extraFilesInput = document.getElementById("additional-photos");

      const coverFile = coverFileInput.files[0] || null;
      const extraFiles = extraFilesInput.files || [];

      if (!termsChecked) {
        alert("You must agree to the terms and conditions.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "PUBLISH CAMPAIGN";
        }
        return;
      }

      if (!coverFile) {
        alert("Please select a cover photo.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "PUBLISH CAMPAIGN";
        }
        return;
      }

      // 1. Upload cover photo to Firebase Storage
      let coverImageUrl = "";
      const timestamp = Date.now();

      const coverPath = `campaigns/${user.uid}/${timestamp}-cover-${coverFile.name}`;
      const coverRef = storageRef(storage, coverPath);
      await uploadBytes(coverRef, coverFile);
      coverImageUrl = await getDownloadURL(coverRef);

      // 2. Upload additional photos (if any)
      const additionalImageUrls = [];
      for (let i = 0; i < extraFiles.length; i++) {
        const file = extraFiles[i];
        const extraPath = `campaigns/${user.uid}/${timestamp}-extra-${i}-${file.name}`;
        const extraRef = storageRef(storage, extraPath);
        await uploadBytes(extraRef, file);
        const url = await getDownloadURL(extraRef);
        additionalImageUrls.push(url);
      }

      // 3. Build data object for createCampaign
      const campaignData = {
        organizer,
        title,
        summary: description,           // map description textarea to "summary"
        goalAmount: goal,
        coverImageUrl,
        additionalImageUrls,
        accountNumber,
        accountName,
        startDate,
        endDate,
        location,
        category: ""                    // you can add a real category field later
      };

      // 4. Save campaign in Firestore
      const campaignId = await createCampaign(campaignData, user);
      console.log("Campaign created with ID:", campaignId);

      alert("Campaign published successfully!");

      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "PUBLISH CAMPAIGN";
      }

      // Redirect to your campaigns dashboard
      window.location.href = "Your Campaings.html";
    } catch (err) {
      console.error("Error publishing campaign:", err);
      alert("There was an error publishing your campaign. Please try again.");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "PUBLISH CAMPAIGN";
      }
    }
  });
}
