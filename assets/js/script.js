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

// Selected work — tab switcher
(function () {
    const tabs = document.querySelectorAll('.work-tab');
    const cards = document.querySelectorAll('.work-card-detail');
    if (!tabs.length || !cards.length) return;

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            tabs.forEach((t) => {
                const active = t === tab;
                t.classList.toggle('is-active', active);
                t.setAttribute('aria-selected', String(active));
            });
            cards.forEach((c) => {
                c.classList.toggle('is-active', c.dataset.id === target);
            });
        });
    });
})();

// F1 races since Bahrain GP 2016 (the first one I watched).
// Estimates ~22 races/year so the count creeps up on its own.
(function () {
    const el = document.getElementById('f1-count');
    if (!el) return;
    const bahrain2016 = new Date('2016-04-03T00:00:00Z');
    const yearsElapsed = (Date.now() - bahrain2016.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    el.textContent = Math.round(yearsElapsed * 22);
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
