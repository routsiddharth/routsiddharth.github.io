// Smooth fade-in animation on page load
document.addEventListener('DOMContentLoaded', function() {
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        // Animation is handled via CSS, but we can add any additional JS interactions here
        profileCard.style.opacity = '0';
        profileCard.style.transform = 'translateY(10px)';
        
        // Trigger animation after a brief delay
        setTimeout(() => {
            profileCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            profileCard.style.opacity = '1';
            profileCard.style.transform = 'translateY(0)';
        }, 50);
    }

    // Add subtle hover effects to social buttons
    const socialButtons = document.querySelectorAll('.social-button');
    socialButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
});
