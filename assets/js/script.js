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
  var card = document.getElementById('spotify-link');
  var cardM = document.getElementById('spotify-link-m');
  if (!card && !cardM) return;
  fetch('https://spotify-last-played.routsiddharth2911.workers.dev/last-played', { mode: 'cors' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (d) {
      if (!d || !d.name) return;
      var tr = document.getElementById('spotify-track'); if (tr) tr.textContent = d.name;
      var trM = document.getElementById('spotify-track-m'); if (trM) trM.textContent = d.name;
      var ar = document.getElementById('spotify-artist'); if (ar) ar.textContent = d.artist || '';
      var art = document.getElementById('spotify-album-art'); if (art && d.albumArt) art.src = d.albumArt;
      if (d.songUrl) { if (card) card.href = d.songUrl; if (cardM) cardM.href = d.songUrl; }
      if (card) card.dataset.state = 'ready';
      if (cardM) cardM.dataset.state = 'ready';
    })
    .catch(function () { if (card) card.dataset.state = 'error'; if (cardM) cardM.dataset.state = 'error'; });
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
