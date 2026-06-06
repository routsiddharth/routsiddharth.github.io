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

// Visited countries — opens a dialog with an equirectangular world map and
// fills every visited country in white. Map land + country paths are
// lazy-loaded on first open. City-states too small to read as a filled shape
// (below) get a single white dot instead.
(function () {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const MAP_SRC = 'assets/maps/world-equirect.js';
    const COUNTRIES_SRC = 'assets/maps/visited-countries.js';

    // [name, lat, lon] — micro/island states whose filled outline is sub-pixel
    // at this scale, so they'd otherwise vanish. Drawn as small white dots.
    // Equirectangular: x = (lon+180)/360*2000, y = (90-lat)/180*1000.
    const DOT_STATES = [
        ['Monaco', 43.74, 7.42], ['Vatican City', 41.90, 12.45],
        ['Singapore', 1.35, 103.82], ['Bahrain', 26.23, 50.58]
    ];

    const trigger = document.querySelector('.map-trigger');
    const dialog = document.getElementById('map-dialog');
    if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;

    const closeBtn = dialog.querySelector('.map-dialog-close');
    const mapLand = dialog.querySelector('.map-land');
    const graticule = dialog.querySelector('.map-graticule');
    const countriesGroup = dialog.querySelector('.visited-countries');
    const dotsGroup = dialog.querySelector('.visited-dots');
    let built = false;

    const projX = (lon) => ((lon + 180) / 360) * 2000;
    const projY = (lat) => ((90 - lat) / 180) * 1000;

    function drawGraticule() {
        for (let lon = -180; lon <= 180; lon += 30) {
            const line = document.createElementNS(SVG_NS, 'line');
            const x = projX(lon);
            line.setAttribute('x1', x); line.setAttribute('y1', 0);
            line.setAttribute('x2', x); line.setAttribute('y2', 1000);
            graticule.appendChild(line);
        }
        for (let lat = -60; lat <= 90; lat += 30) {
            const line = document.createElementNS(SVG_NS, 'line');
            const y = projY(lat);
            line.setAttribute('x1', 0); line.setAttribute('y1', y);
            line.setAttribute('x2', 2000); line.setAttribute('y2', y);
            graticule.appendChild(line);
        }
    }

    function drawDots() {
        DOT_STATES.forEach(([name, lat, lon]) => {
            const dot = document.createElementNS(SVG_NS, 'circle');
            dot.setAttribute('cx', projX(lon));
            dot.setAttribute('cy', projY(lat));
            dot.setAttribute('r', 4);
            dot.setAttribute('class', 'visited-dot');
            const title = document.createElementNS(SVG_NS, 'title');
            title.textContent = name;
            dot.appendChild(title);
            dotsGroup.appendChild(dot);
        });
    }

    function drawLand(paths) {
        const frag = document.createDocumentFragment();
        paths.forEach((d) => {
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', d);
            frag.appendChild(path);
        });
        mapLand.appendChild(frag);
    }

    function drawCountries(countries) {
        const frag = document.createDocumentFragment();
        countries.forEach(({ n, d }) => {
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', d);
            path.setAttribute('class', 'visited-country');
            const title = document.createElementNS(SVG_NS, 'title');
            title.textContent = n;
            path.appendChild(title);
            frag.appendChild(path);
        });
        countriesGroup.appendChild(frag);
    }

    // Lazy-load a path data file via a <script> tag (works under file:// too,
    // where fetch() is blocked by CORS).
    function loadScript(src, ready, draw) {
        const existing = ready();
        if (existing) { draw(existing); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => { const data = ready(); if (data) draw(data); };
        s.onerror = () => { /* leave the rest of the map even if this fails */ };
        document.head.appendChild(s);
    }

    function build() {
        if (built) return;
        built = true;
        drawGraticule();
        drawDots();
        loadScript(MAP_SRC, () => window.__WORLD_PATHS, drawLand);
        loadScript(COUNTRIES_SRC, () => window.__VISITED_COUNTRIES, drawCountries);
    }

    trigger.addEventListener('click', () => {
        build();
        dialog.showModal();
        if (closeBtn) closeBtn.focus();
    });

    if (closeBtn) closeBtn.addEventListener('click', () => dialog.close());

    // Backdrop click closes (clicks inside .map-dialog-inner don't reach here).
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });
})();
