// newCampaign.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ newCampaign.js loaded");

  const firebaseExports = window.__FIREBASE__;
    function showMessage(type, text) {
  const box = document.getElementById("campaign-message");
  if (!box) {
    alert(text);
    return;
  }

  box.textContent = text;
  box.style.display = "block";

  // basic styling
  box.style.padding = "10px 14px";
  box.style.borderRadius = "8px";
  box.style.marginTop = "10px";
  box.style.fontSize = "14px";

  if (type === "success") {
    box.style.backgroundColor = "#dcfce7";
    box.style.color = "#166534";
  } else {
    box.style.backgroundColor = "#fee2e2";
    box.style.color = "#991b1b";
  }
}

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
    const messageBox = document.getElementById("message-box"); 

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

      if (!title || !description || !goalAmount) {
        alert("Please fill in all required fields.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "PUBLISH CAMPAIGN";
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
        console.warn("No cover image selected.");
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

        // Alert once all are done
        showMessage("success", "🎉 Thank you for using <span style='color:#1a73e8;'>AidReach</span>!<br>Your campaign has been published successfully.");

        alert(`Uploaded ${additionalPhotoUrls.length} photo(s).`);
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
        category: "",           // you can extend later
        organizer,
        startDate,
        endDate,
        gallery: additionalPhotoUrls   // store all extra photos here
      };

      console.log("Sending campaignData to createCampaign:", campaignData);

      // 5. Save campaign in Firestore
      const campaignId = await createCampaign(campaignData, user);
      console.log("✅ Campaign created with ID:", campaignId);

      alert("Campaign published successfully!");

      form.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "SUBMIT CAMPAIGN";
      }

      window.location.href = "Your Campaings.html";
    } 
    catch (error) {
  console.error("❌ Error publishing campaign:", error);
  showMessage("error", "Something went wrong while publishing your campaign. Please try again.");
  // do not rethrow here, we already handled it
  



      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "PUBLISH CAMPAIGN";
      }
    
    }
  });
});
