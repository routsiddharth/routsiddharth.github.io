// Smooth fade-in animation on page load
document.addEventListener('DOMContentLoaded', function() {
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        profileCard.style.opacity = '0';
        profileCard.style.transform = 'translateY(10px)';

        setTimeout(() => {
            profileCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            profileCard.style.opacity = '1';
            profileCard.style.transform = 'translateY(0)';
        }, 50);
    }

    // Hide scroll indicator on scroll
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
        }, { passive: true });
    }

    // Add subtle hover effects to social buttons
    const socialButtons = document.querySelectorAll('.social-button');
    socialButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // Fetch last played Spotify track
    const WORKER_URL = 'https://spotify-last-played.routsiddharth2911.workers.dev/last-played';
    fetch(WORKER_URL)
        .then(res => res.json())
        .then(data => {
            if (data.name) {
                document.getElementById('spotify-track').textContent = data.name;
                document.getElementById('spotify-artist').textContent = data.artist;
                document.getElementById('spotify-album-art').src = data.albumArt;
                document.getElementById('spotify-link').href = data.songUrl;
                document.getElementById('spotify-widget').style.display = 'block';
            }
        })
        .catch(() => {
            // Widget stays hidden on error — graceful degradation
        });
});
