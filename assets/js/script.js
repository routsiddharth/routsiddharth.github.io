/* ---------- reveal on scroll (robust + fallback) ---------- */
(function () {
  var els = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  els.forEach(function (e) { io.observe(e); });
  /* safety fallback: ensure everything visible shortly after load */
  window.addEventListener('load', function () {
    setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 1400);
  });
})();

/* ---------- scrollspy: highlight the current section in the rail nav ---------- */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.rail-nav a'));
  if (!links.length) return;
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  var raf = null;
  function update() {
    raf = null;
    var marker = window.innerHeight * 0.32;   // the line that "enters" a section
    var current = sections[0];
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= marker) current = s;
    });
    // near the very bottom, force the last section active
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      current = sections[sections.length - 1];
    }
    var id = current ? current.id : '';
    links.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href').slice(1) === id);
    });
  }
  function onScroll() { if (raf == null) raf = requestAnimationFrame(update); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* ---------- experience show-more ---------- */
(function () {
  var btn = document.getElementById('xp-toggle');
  var txt = document.getElementById('xp-toggle-text');
  var list = document.getElementById('xp-list');
  var mark = btn ? btn.querySelector('.tog-mark') : null;
  if (!btn || !list) return;
  var open = false;
  btn.addEventListener('click', function () {
    open = !open;
    list.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    txt.textContent = open ? 'Show less' : 'Show 5 more';
    if (mark) mark.textContent = open ? '−' : '+';
  });
})();

/* ---------- selected work accordion ---------- */
(function () {
  var items = document.querySelectorAll('.work-item');
  items.forEach(function (item) {
    var btn = item.querySelector('.work-summary');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      items.forEach(function (o) { o.classList.remove('open'); o.querySelector('.work-summary').setAttribute('aria-expanded', 'false'); });
      if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });
})();

/* ---------- F1 live counter ---------- */
(function () {
  var el = document.getElementById('f1-count'); if (!el) return;
  var start = new Date('2016-04-03T00:00:00Z');
  var yrs = (Date.now() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  el.textContent = Math.round(yrs * 22);
})();

/* ---------- stats count-up (animate numbers in when scrolled into view) ---------- */
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll('.stat-val .count'));
  if (!els.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;   // leave the real values in place
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 4); };   // quick off the line, long slow tail
  function run(el) {
    var target = parseInt((el.textContent || '').replace(/[^0-9]/g, ''), 10);
    if (!isFinite(target)) return;
    var dur = 2000 + Math.random() * 4000, startT = null;   // each number independently takes 2–6s
    el.textContent = '0';
    function frame(ts) {
      if (startT == null) startT = ts;
      var p = Math.min((ts - startT) / dur, 1);
      el.textContent = Math.round(easeOut(p) * target).toString();
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(frame);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  els.forEach(function (e) { io.observe(e); });
})();

/* ---------- Spotify last-played ---------- */
(function () {
  var widget = document.getElementById('spotify-widget');
  var card = document.getElementById('spotify-link');
  var cardM = document.getElementById('spotify-link-m');
  if (!card && !cardM) return;
  fetch('https://spotify-last-played.routsiddharth2911.workers.dev/last-played', { mode: 'cors' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (d) {
      var name = d && typeof d.name === 'string' ? d.name.trim() : '';
      if (!name) return;
      var artist = typeof d.artist === 'string' ? d.artist.trim() : '';
      var tr = document.getElementById('spotify-track'); if (tr) tr.textContent = name;
      var trM = document.getElementById('spotify-track-m'); if (trM) trM.textContent = name;
      var ar = document.getElementById('spotify-artist'); if (ar) ar.textContent = artist;
      var art = document.getElementById('spotify-album-art');
      if (art && d.albumArt) {
        var artImg = document.createElement('img');
        artImg.src = d.albumArt;
        artImg.alt = '';
        art.appendChild(artImg);
      }
      if (d.songUrl) { if (card) card.href = d.songUrl; if (cardM) cardM.href = d.songUrl; }
      var label = 'Listen to ' + name + (artist ? ' by ' + artist : '') + ' on Spotify';
      if (card) { card.dataset.state = 'ready'; card.setAttribute('aria-label', label); }
      if (cardM) { cardM.dataset.state = 'ready'; cardM.setAttribute('aria-label', label); cardM.hidden = false; }
      if (widget) widget.hidden = false;
    })
    .catch(function () { /* live data is optional; keep the widget hidden on failure */ });
})();

/* ---------- five-star films ---------- */
(function () {
  var wrap = document.getElementById('films');
  var strip = document.getElementById('film-strip');
  if (!wrap || !strip) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var arrows = Array.prototype.slice.call(wrap.querySelectorAll('.film-arrow'));
  var raf = null;
  var cycleWidth = 0;

  /* the list is unranked, so deal it fresh on every visit */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function renderCopy(films, copyIndex) {
    var frag = document.createDocumentFragment();
    films.forEach(function (f, i) {
      var label = f.year ? f.title + ' (' + f.year + ')' : f.title;
      var a = document.createElement('a');
      a.className = 'film';
      a.href = f.url || '#';
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = label;
      if (copyIndex !== 1) {
        a.setAttribute('aria-hidden', 'true');
        a.tabIndex = -1;
      }
      if (f.poster) {
        var img = document.createElement('img');
        img.className = 'film-poster film-img';
        img.src = f.poster;
        img.alt = copyIndex === 1 ? label : '';
        img.loading = copyIndex === 1 && i < 6 ? 'eager' : 'lazy';
        img.decoding = 'async';
        a.appendChild(img);
      } else {
        var span = document.createElement('span');
        span.className = 'film-poster film-blank';
        span.textContent = label;
        a.appendChild(span);
      }
      frag.appendChild(a);
    });
    strip.appendChild(frag);
  }

  function render(films) {
    /* Three identical runs let us recenter on the middle one without a visible seam. */
    for (var copy = 0; copy < 3; copy++) renderCopy(films, copy);
  }

  /* one poster + one gap, measured rather than assumed — the width is fluid */
  function stepSize() {
    var first = strip.querySelector('.film');
    if (!first) return strip.clientWidth;
    var gap = parseFloat(getComputedStyle(strip).columnGap);
    return first.getBoundingClientRect().width + (isFinite(gap) ? gap : 0);
  }

  function measureCycle(filmCount) {
    cycleWidth = stepSize() * filmCount;
    return cycleWidth;
  }

  function keepLoopCentered() {
    raf = null;
    if (!cycleWidth) return;
    if (strip.scrollLeft < cycleWidth * 0.5) strip.scrollLeft += cycleWidth;
    else if (strip.scrollLeft >= cycleWidth * 1.5) strip.scrollLeft -= cycleWidth;
  }
  function queueLoopCheck() { if (raf == null) raf = requestAnimationFrame(keepLoopCentered); }

  arrows.forEach(function (b) {
    b.addEventListener('click', function () {
      strip.scrollBy({
        left: stepSize() * parseInt(b.dataset.dir, 10),
        behavior: reduce ? 'auto' : 'smooth'
      });
    });
  });
  strip.addEventListener('scroll', queueLoopCheck, { passive: true });

  fetch('assets/data/films.json')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (d) {
      var films = ((d && d.films) || []).filter(function (f) { return f && f.title; });
      if (!films.length) return;               // nothing to show — leave the band hidden
      films = shuffle(films.slice());
      render(films);
      var src = document.getElementById('film-src');
      if (src && d.list) src.href = d.list;
      wrap.hidden = false;
      measureCycle(films.length);
      strip.scrollLeft = cycleWidth;
      window.addEventListener('resize', function () {
        var oldCycle = cycleWidth;
        var phase = oldCycle ? ((strip.scrollLeft % oldCycle) + oldCycle) % oldCycle / oldCycle : 0;
        requestAnimationFrame(function () {
          measureCycle(films.length);
          strip.scrollLeft = cycleWidth * (1 + phase);
        });
      });
    })
    .catch(function () { /* stays hidden rather than rendering an empty band */ });
})();

/* ---------- world map popup ---------- */
(function () {
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var MAP_SRC = 'assets/maps/world-equirect.js';
  var COUNTRIES_SRC = 'assets/maps/visited-countries.js';
  var trigger = document.querySelector('.map-trigger');
  var dialog = document.getElementById('map-dialog');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;
  var closeBtn = dialog.querySelector('.map-dialog-close');
  var mapLand = dialog.querySelector('.map-land');
  var graticule = dialog.querySelector('.map-graticule');
  var countriesGroup = dialog.querySelector('.visited-countries');
  var dotsGroup = dialog.querySelector('.visited-dots');
  var built = false;
  // micro-states too small to render as a filled shape at this map scale — a dot stands in for them.
  var DOT_STATES = [
    ['Monaco', 43.74, 7.42],
    ['Vatican City', 41.90, 12.45]
  ];
  var projX = function (lon) { return ((lon + 180) / 360) * 2000; };
  var projY = function (lat) { return ((90 - lat) / 180) * 1000; };
  function drawGraticule() { for (var lon = -180; lon <= 180; lon += 30) { var l = document.createElementNS(SVG_NS, 'line'); var x = projX(lon); l.setAttribute('x1', x); l.setAttribute('y1', 0); l.setAttribute('x2', x); l.setAttribute('y2', 1000); graticule.appendChild(l); } for (var lat = -60; lat <= 90; lat += 30) { var l2 = document.createElementNS(SVG_NS, 'line'); var y = projY(lat); l2.setAttribute('x1', 0); l2.setAttribute('y1', y); l2.setAttribute('x2', 2000); l2.setAttribute('y2', y); graticule.appendChild(l2); } }
  function drawLand(paths) { var f = document.createDocumentFragment(); paths.forEach(function (d) { var p = document.createElementNS(SVG_NS, 'path'); p.setAttribute('d', d); f.appendChild(p); }); mapLand.appendChild(f); }
  function drawCountries(cs) { var f = document.createDocumentFragment(); cs.forEach(function (c) { var p = document.createElementNS(SVG_NS, 'path'); p.setAttribute('d', c.d); p.setAttribute('class', 'visited-country'); var t = document.createElementNS(SVG_NS, 'title'); t.textContent = c.n; p.appendChild(t); f.appendChild(p); }); countriesGroup.appendChild(f); }
  function drawDots() { var f = document.createDocumentFragment(); DOT_STATES.forEach(function (s) { var name = s[0], lat = s[1], lon = s[2]; var c = document.createElementNS(SVG_NS, 'circle'); c.setAttribute('cx', projX(lon)); c.setAttribute('cy', projY(lat)); c.setAttribute('r', 4); c.setAttribute('class', 'visited-dot'); var t = document.createElementNS(SVG_NS, 'title'); t.textContent = name; c.appendChild(t); f.appendChild(c); }); dotsGroup.appendChild(f); }
  function loadScript(src, ready, draw) { var e = ready(); if (e) { draw(e); return; } var s = document.createElement('script'); s.src = src; s.onload = function () { var d = ready(); if (d) draw(d); }; document.head.appendChild(s); }
  function build() { if (built) return; built = true; drawGraticule(); drawDots(); loadScript(MAP_SRC, function () { return window.__WORLD_PATHS; }, drawLand); loadScript(COUNTRIES_SRC, function () { return window.__VISITED_COUNTRIES; }, drawCountries); }
  trigger.addEventListener('click', function () { build(); dialog.showModal(); if (closeBtn) closeBtn.focus(); });
  if (closeBtn) closeBtn.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
})();
