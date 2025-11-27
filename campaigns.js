 // Campaign data 
    const campaigns = {
      1: {
        title: "Leadership Initiatives Students Creating Change",
        mainImage: "SDP/aid 4.jpg",
        thumbnails: ["SDP/aid header 2.jpg", "SDP/aid 4.jpg", "SDP/aid header 3.jpg", "SDP/aid.jpg"],
        overview: "Many families in Adamawa are currently struggling due to ongoing food shortages and economic hardship caused by conflict and displacement. Thousands of households lack access to daily meals, clean water, and basic healthcare",
        challenge: "This campaign aims to provide emergency food packs, clean /water, and essential supplies to the most vulnerable communities, especially children and widows, helping them survive and rebuild hope during this difficult time.",
        updates: "<strong>Date:</strong> 10 bags of rice have been bought so far, thank you to everyone who donated.",
        raised: 5000,
        goal: 80000,
        donations: 4,
        organizer: "David Sike",
        startDate: "August 15, 2025"
      },
      2: {
        title: "Help Nigerian Youth Achieve Their Educational Dreams",
        mainImage: "SDP/aid.jpg",
        thumbnails: ["SDP/aid header 2.jpg", "SDP/aid 4.jpg", "SDP/aid header 3.jpg", "SDP/aid.jpg"],
        overview: "Many families in Adamawa are currently struggling due to ongoing food shortages and economic hardship caused by conflict and displacement. Thousands of households lack access to daily meals, clean water, and basic healthcare",
        challenge: "This campaign aims to provide emergency food packs, clean /water, and essential supplies to the most vulnerable communities, especially children and widows, helping them survive and rebuild hope during this difficult time.",
        updates: "<strong>Date:</strong> 10 bags of rice have been bought so far, thank you to everyone who donated.",
        raised: 5000,
        goal: 80000,
        donations: 4,
        organizer: "David Sike",
        startDate: "August 15, 2025"
      },
      3: {
        title: "Support for Displaced Families in Northern Nigeria",
        mainImage: "SDP/aid header 2.jpg",
        thumbnails: ["SDP/aid header 2.jpg", "SDP/aid 4.jpg", "SDP/aid header 3.jpg", "SDP/aid.jpg"],
        overview: "Many families in Adamawa are currently struggling due to ongoing food shortages and economic hardship caused by conflict and displacement. Thousands of households lack access to daily meals, clean water, and basic healthcare",
        challenge: "This campaign aims to provide emergency food packs, clean /water, and essential supplies to the most vulnerable communities, especially children and widows, helping them survive and rebuild hope during this difficult time.",
        updates: "<strong>Date:</strong> 10 bags of rice have been bought so far, thank you to everyone who donated.",
        raised: 5000,
        goal: 80000,
        donations: 4,
        organizer: "David Sike",
        startDate: "August 15, 2025"
      },
    4: {
      title: "Adamawa: Individuals Distribute Rice to Displaced Individuals",
      mainImage: "SDP/nigeria-9417.jpg",
      thumbnails: ["SDP/aid header 2.jpg", "SDP/nigeria-9417.jpg", "SDP/aid header 3.jpg", "SDP/aid.jpg"],
      overview: "Many families in Adamawa are currently struggling due to ongoing food shortages and economic hardship caused by conflict and displacement. Thousands of households lack access to daily meals, clean water, and basic healthcare",
      challenge: "This campaign aims to provide emergency food packs, clean /water, and essential supplies to the most vulnerable communities, especially children and widows, helping them survive and rebuild hope during this difficult time.",
      updates: "<strong>Date:</strong> 10 bags of rice have been bought so far, thank you to everyone who donated.",
      raised: 5000,
      goal: 80000,
      donations: 4,
      organizer: "David Sike",
      startDate: "August 15, 2025"
    },
    5: {
      title: "Help Nigerian Youth Pursue Vocational Studies",
      mainImage: "SDP/aid.jpg",
      thumbnails: ["SDP/aid header 2.jpg", "SDP/aid 4.jpg", "SDP/aid header 3.jpg", "SDP/aid.jpg"],
      overview: "Many families in Adamawa are currently struggling due to ongoing food shortages and economic hardship caused by conflict and displacement. Thousands of households lack access to daily meals, clean water, and basic healthcare",
      challenge: "This campaign aims to provide emergency food packs, clean /water, and essential supplies to the most vulnerable communities, especially children and widows, helping them survive and rebuild hope during this difficult time.",
      updates: "<strong>Date:</strong> 10 bags of rice have been bought so far, thank you to everyone who donated.",
      raised: 5000,
      goal: 80000,
      donations: 4,
      organizer: "David Sike",
      startDate: "August 15, 2025"
    },
    6: {
      title: "BLACK GIRLS IN TECH NIGERIA FUNDRAISER",
      mainImage: "SDP/nigeria-9417.jpg",
      thumbnails: ["SDP/aid header 2.jpg", "SDP/nigeria-9417.jpg", "SDP/aid header 3.jpg", "SDP/aid.jpg"],
      overview: "Many families in Adamawa are currently struggling due to ongoing food shortages and economic hardship caused by conflict and displacement. Thousands of households lack access to daily meals, clean water, and basic healthcare",
      challenge: "This campaign aims to provide emergency food packs, clean /water, and essential supplies to the most vulnerable communities, especially children and widows, helping them survive and rebuild hope during this difficult time.",
      updates: "<strong>Date:</strong> 10 bags of rice have been bought so far, thank you to everyone who donated.",
      raised: 5000,
      goal: 80000,
      donations: 4,
      organizer: "David Sike",
      startDate: "August 15, 2025"
    }
  };

    // Get campaign ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const campaign = campaigns[id];

    if (campaign) {
      document.getElementById("campaign-title").textContent = campaign.title;
      document.getElementById("startDate").textContent = campaign.startDate;
      document.getElementById("main-image").src = campaign.mainImage;
      document.getElementById("overview").textContent = campaign.overview;
      document.getElementById("challenge").textContent = campaign.challenge;
      document.getElementById("updates").innerHTML = campaign.updates;
      document.getElementById("raised").textContent = `₦${campaign.raised.toLocaleString()}`;
      document.getElementById("goal").textContent = `₦${campaign.goal.toLocaleString()}`;
      document.getElementById("donations").textContent = `${campaign.donations} Donations`;
      document.getElementById("organizer").textContent = campaign.organizer;

      // Fill progress bar
      const progressPercent = (campaign.raised / campaign.goal) * 100;
      document.getElementById("progress-bar-fill").style.width = `${progressPercent}%`;

      // Thumbnails
      const thumbsContainer = document.getElementById("thumbnails");
      thumbsContainer.innerHTML = "";
      campaign.thumbnails.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.className = "img-thumbnail rounded";
        img.style.width = "230px";
        img.style.height = "230px";
        img.style.objectFit = "cover";
        thumbsContainer.appendChild(img);
      });
    } else {
      document.querySelector(".container").innerHTML = "<h2 class='text-center text-danger'>Campaign not found</h2>";
    }
