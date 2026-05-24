// Experience expand/collapse — animates via CSS grid-template-rows transition.
(function () {
    const list = document.querySelector('.experience-list');
    const hidden = document.getElementById('experience-hidden');
    const button = document.querySelector('.experience-toggle');
    if (!list || !hidden || !button) return;

    const label = button.querySelector('.experience-toggle-text');
    const hiddenCount = hidden.querySelectorAll('.experience-entry').length;

    button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const next = !isExpanded;
        button.setAttribute('aria-expanded', String(next));
        list.dataset.expanded = String(next);
        hidden.dataset.collapsed = String(!next);
        hidden.setAttribute('aria-hidden', String(!next));
        label.textContent = next ? 'Show less' : `Show ${hiddenCount} more`;
    });
})();

// Spotify last-played — fetched via Cloudflare Worker proxy.
// On failure (e.g. CORS off-origin during local dev), the pill stays as
// its fallback state showing just the green Spotify icon.
(function () {
    const WORKER_URL = 'https://spotify-last-played.routsiddharth2911.workers.dev/last-played';
    const card = document.getElementById('spotify-link');
    if (!card) return;

    fetch(WORKER_URL, { mode: 'cors' })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => {
            if (!data || !data.name) return;
            document.getElementById('spotify-track').textContent = data.name;
            document.getElementById('spotify-artist').textContent = data.artist || '';
            if (data.albumArt) {
                document.getElementById('spotify-album-art').src = data.albumArt;
            }
            if (data.songUrl) {
                card.href = data.songUrl;
            }
            card.dataset.state = 'ready';
        })
        .catch(() => {
            card.dataset.state = 'error';
        });
})();
