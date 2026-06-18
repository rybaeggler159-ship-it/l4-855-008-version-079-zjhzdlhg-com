(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initHomeSearch() {
    var form = document.querySelector('[data-home-search]');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './movies.html';
      if (query) target += '?q=' + encodeURIComponent(query);
      window.location.href = target;
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!panel || !grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search]'));
    var input = panel.querySelector('[data-filter-input]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function match(card) {
      var q = normalize(input && input.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var haystack = normalize(card.getAttribute('data-search'));
      var ok = true;
      if (q) ok = haystack.indexOf(q) !== -1;
      if (ok && r) ok = normalize(card.getAttribute('data-region')) === r;
      if (ok && t) ok = normalize(card.getAttribute('data-type')) === t;
      if (ok && y) ok = normalize(card.getAttribute('data-year')) === y;
      return ok;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.hidden = !ok;
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    [input, region, type, year].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });

    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initHomeSearch();
    initFilters();
  });
})();
