
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var forms = document.querySelectorAll('[data-search-form]');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');

      if (input && input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row'));
    var empty = scope.querySelector('[data-empty-state]');
    var filters = {};

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilters = Object.keys(filters).every(function (key) {
          var value = filters[key];

          if (!value || value === 'all') {
            return true;
          }

          if (key === 'text') {
            return text.indexOf(normalize(value)) !== -1;
          }

          return normalize(card.getAttribute('data-' + key)) === normalize(value);
        });
        var isVisible = matchQuery && matchFilters;

        card.hidden = !isVisible;

        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    scope.querySelectorAll('[data-filter-key]').forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-filter-key');
        var value = button.getAttribute('data-filter-value');

        if (key === 'all') {
          filters = {};
          scope.querySelectorAll('[data-filter-key]').forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
        } else {
          filters[key] = value;
          scope.querySelectorAll('[data-filter-key="' + key + '"]').forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          scope.querySelectorAll('[data-filter-key="all"]').forEach(function (item) {
            item.classList.remove('is-active');
          });
        }

        applyFilters();
      });
    });

    var queryInput = scope.querySelector('[data-query-input]');

    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var keyword = params.get('q');

      if (keyword) {
        queryInput.value = keyword;
      }
    }

    applyFilters();
  });

  var backTop = document.createElement('button');
  backTop.className = 'back-top';
  backTop.type = 'button';
  backTop.setAttribute('aria-label', '返回顶部');
  backTop.textContent = '↑';
  document.body.appendChild(backTop);

  backTop.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('scroll', function () {
    backTop.classList.toggle('is-visible', window.scrollY > 520);
  });
})();
