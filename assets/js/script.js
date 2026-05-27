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

// Visited cities — opens a dialog with an equirectangular world map and a
// white dot for every city. Map land paths are lazy-loaded on first open.
(function () {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const MAP_SRC = 'assets/maps/world-equirect.js';

    // [name, lat, lon]. Tiny countries (Monaco, Vatican City, Singapore) get a
    // single center point. Equirectangular: x = (lon+180)/360*2000, y = (90-lat)/180*1000.
    const CITIES = [
        ['Manama', 26.23, 50.58], ['Cairo', 30.04, 31.24],
        ['Amman', 31.95, 35.93], ['Petra', 30.33, 35.44], ['Aqaba', 29.53, 35.01],
        ['Kuwait City', 29.38, 47.99], ['Muscat', 23.59, 58.41], ['Doha', 25.29, 51.53],
        ['Jeddah', 21.49, 39.19], ['Khobar', 26.28, 50.21],
        ['Abu Dhabi', 24.45, 54.38], ['Dubai', 25.20, 55.27],
        ['London', 51.51, -0.13], ['Paris', 48.86, 2.35], ['Nice', 43.70, 7.27],
        ['Tbilisi', 41.72, 44.83], ['Athens', 37.98, 23.73],
        ['Rome', 41.90, 12.50], ['Florence', 43.77, 11.26],
        ['Monaco', 43.74, 7.42], ['Vatican City', 41.90, 12.45],
        ['Ankara', 39.93, 32.86], ['Antalya', 36.90, 30.71], ['Cappadocia', 38.65, 34.83],
        ['Beijing', 39.90, 116.41],
        ['Delhi', 28.61, 77.21], ['Bhubaneswar', 20.30, 85.82], ['Mumbai', 19.08, 72.88],
        ['Jaipur', 26.91, 75.79], ['Chennai', 13.08, 80.27], ['Goa', 15.30, 74.12],
        ['Jamshedpur', 22.80, 86.20],
        ['Kuala Lumpur', 3.14, 101.69], ['Langkawi', 6.35, 99.80],
        ['Singapore', 1.35, 103.82],
        ['Colombo', 6.93, 79.85], ['Kandy', 7.29, 80.64],
        ['Bangkok', 13.76, 100.50], ['Chiang Mai', 18.79, 98.99],
        ['New York', 40.71, -74.01], ['Boston', 42.36, -71.06],
        ['Washington DC', 38.91, -77.04], ['Honolulu', 21.31, -157.86]
    ];

    const trigger = document.querySelector('.map-trigger');
    const dialog = document.getElementById('map-dialog');
    if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;

    const closeBtn = dialog.querySelector('.map-dialog-close');
    const mapLand = dialog.querySelector('.map-land');
    const graticule = dialog.querySelector('.map-graticule');
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
        CITIES.forEach(([name, lat, lon]) => {
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

    // Lazy-load the land paths via a <script> tag (works under file:// too,
    // where fetch() is blocked by CORS).
    function loadLand() {
        if (window.__WORLD_PATHS) { drawLand(window.__WORLD_PATHS); return; }
        const s = document.createElement('script');
        s.src = MAP_SRC;
        s.onload = () => { if (window.__WORLD_PATHS) drawLand(window.__WORLD_PATHS); };
        s.onerror = () => { /* leave dots/graticule even if land fails to load */ };
        document.head.appendChild(s);
    }

    function build() {
        if (built) return;
        built = true;
        drawGraticule();
        drawDots();
        loadLand();
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
