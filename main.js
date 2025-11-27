

    // Newsletter form validation
    const newsletterForm = document.querySelector('.impact-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value.includes('@')) {
                alert('Thank you for subscribing!');
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // See More button (example: show alert or load more cards)
    const seeMoreBtn = document.querySelector('.see-more');
    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', function () {
            window.location.href = 'Donation.html';
        });
    }


//progress bar
const progressBarFill = document.getElementById('progress-bar-fill');

if (progressBarFill) {
      document.getElementById("raised").textContent = `₦${campaign.raised.toLocaleString()}`;
      document.getElementById("goal").textContent = `₦${campaign.goal.toLocaleString()}`;
      document.getElementById("remaining").textContent = `₦${(campaign.goal - campaign.raised).toLocaleString()} to go`;
}
