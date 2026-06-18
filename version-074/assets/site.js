(function () {
  var body = document.body;
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restartTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restartTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartTimer();
      });
    });
    startTimer();
  }

  var searchPanel = document.querySelector('[data-search-panel]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var openButtons = Array.prototype.slice.call(document.querySelectorAll('[data-open-search]'));
  var closeButton = document.querySelector('[data-close-search]');
  var catalog = Array.isArray(window.searchCatalog) ? window.searchCatalog : [];

  function openSearch() {
    if (!searchPanel) {
      return;
    }
    searchPanel.classList.add('is-open');
    searchPanel.setAttribute('aria-hidden', 'false');
    body.classList.add('search-open');
    window.setTimeout(function () {
      if (searchInput) {
        searchInput.focus();
      }
    }, 50);
  }

  function closeSearch() {
    if (!searchPanel) {
      return;
    }
    searchPanel.classList.remove('is-open');
    searchPanel.setAttribute('aria-hidden', 'true');
    body.classList.remove('search-open');
  }

  function createSearchCard(item) {
    var link = document.createElement('a');
    link.className = 'search-result-item';
    link.href = item.url;

    var image = document.createElement('img');
    image.src = item.cover;
    image.alt = item.title;
    image.loading = 'lazy';

    var info = document.createElement('span');
    var title = document.createElement('strong');
    var meta = document.createElement('em');
    var line = document.createElement('small');

    title.textContent = item.title;
    meta.textContent = [item.year, item.region, item.type, item.genre].filter(Boolean).join(' · ');
    line.textContent = item.oneLine || '';

    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(line);
    link.appendChild(image);
    link.appendChild(info);
    return link;
  }

  function renderSearch(query) {
    if (!searchResults) {
      return;
    }
    searchResults.innerHTML = '';
    var keyword = (query || '').trim().toLowerCase();
    if (!keyword) {
      var empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = '输入片名、类型、地区或年份查找内容';
      searchResults.appendChild(empty);
      return;
    }
    var matched = catalog.filter(function (item) {
      var text = [item.title, item.year, item.region, item.type, item.genre, item.oneLine, (item.tags || []).join(' ')]
        .join(' ')
        .toLowerCase();
      return text.indexOf(keyword) !== -1;
    }).slice(0, 30);
    if (!matched.length) {
      var none = document.createElement('p');
      none.className = 'search-empty';
      none.textContent = '没有找到匹配内容';
      searchResults.appendChild(none);
      return;
    }
    matched.forEach(function (item) {
      searchResults.appendChild(createSearchCard(item));
    });
  }

  openButtons.forEach(function (button) {
    button.addEventListener('click', openSearch);
  });
  if (closeButton) {
    closeButton.addEventListener('click', closeSearch);
  }
  if (searchPanel) {
    searchPanel.addEventListener('click', function (event) {
      if (event.target === searchPanel) {
        closeSearch();
      }
    });
  }
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });
  renderSearch('');

  var grid = document.querySelector('[data-catalog-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-catalog-card]'));
    var pageInput = document.querySelector('[data-page-filter-input]');
    var regionFilter = document.querySelector('[data-filter-region]');
    var yearFilter = document.querySelector('[data-filter-year]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var resetButton = document.querySelector('[data-reset-filters]');
    var noResults = document.querySelector('[data-no-results]');

    function filterCards() {
      var keyword = pageInput ? pageInput.value.trim().toLowerCase() : '';
      var region = regionFilter ? regionFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year, card.dataset.type]
          .join(' ')
          .toLowerCase();
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && card.dataset.region !== region) {
          matched = false;
        }
        if (year && card.dataset.year !== year) {
          matched = false;
        }
        if (type && card.dataset.type !== type) {
          matched = false;
        }
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    }

    [pageInput, regionFilter, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (pageInput) {
          pageInput.value = '';
        }
        if (regionFilter) {
          regionFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        if (typeFilter) {
          typeFilter.value = '';
        }
        filterCards();
      });
    }
  }
})();
