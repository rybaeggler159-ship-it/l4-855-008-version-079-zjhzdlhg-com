document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initHeroCarousel();
  initImageFallbacks();
  initCategoryFilters();
  initSearchPage();
  initHlsPlayers();
});

function initMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function initHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length < 2) {
    return;
  }

  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
      dot.setAttribute('aria-selected', String(dotIndex === index));
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
      start();
    });
  });

  show(0);
  start();
}

function initImageFallbacks() {
  var images = Array.prototype.slice.call(document.querySelectorAll('img'));
  images.forEach(function (img) {
    img.addEventListener('error', function () {
      var parent = img.closest('.card-cover, .hero-image, .detail-poster, .rank-cover, .related-card, .compact-card, .detail-backdrop');
      if (parent) {
        parent.classList.add('is-missing');
      }
      img.style.visibility = 'hidden';
    }, { once: true });
  });
}

function initCategoryFilters() {
  var filterRoot = document.querySelector('[data-filter-root]');
  if (!filterRoot) {
    return;
  }

  var input = filterRoot.querySelector('[data-filter-search]');
  var region = filterRoot.querySelector('[data-filter-region]');
  var type = filterRoot.querySelector('[data-filter-type]');
  var year = filterRoot.querySelector('[data-filter-year]');
  var sort = filterRoot.querySelector('[data-filter-sort]');
  var reset = filterRoot.querySelector('[data-filter-reset]');
  var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
  var grid = filterRoot.querySelector('[data-card-grid]');
  var count = filterRoot.querySelector('[data-filter-count]');
  var empty = filterRoot.querySelector('[data-empty]');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function matches(card) {
    var query = normalize(input && input.value);
    var text = normalize(card.getAttribute('data-title') + ' ' + card.textContent);
    var regionValue = region ? region.value : '';
    var typeValue = type ? type.value : '';
    var yearValue = year ? year.value : '';
    return (!query || text.indexOf(query) !== -1) &&
      (!regionValue || card.getAttribute('data-region') === regionValue) &&
      (!typeValue || card.getAttribute('data-type') === typeValue) &&
      (!yearValue || card.getAttribute('data-year').indexOf(yearValue) !== -1);
  }

  function applySort(visibleCards) {
    var mode = sort ? sort.value : 'default';
    var sorted = visibleCards.slice();
    if (mode === 'score') {
      sorted.sort(function (a, b) {
        return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
      });
    } else if (mode === 'year') {
      sorted.sort(function (a, b) {
        return parseInt(b.getAttribute('data-year'), 10) - parseInt(a.getAttribute('data-year'), 10);
      });
    } else if (mode === 'title') {
      sorted.sort(function (a, b) {
        return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-Hans-CN');
      });
    }
    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function update() {
    var visible = [];
    cards.forEach(function (card) {
      var ok = matches(card);
      card.hidden = !ok;
      if (ok) {
        visible.push(card);
      }
    });
    applySort(visible);
    if (count) {
      count.textContent = String(visible.length);
    }
    if (empty) {
      empty.classList.toggle('is-visible', visible.length === 0);
    }
  }

  [input, region, type, year, sort].forEach(function (control) {
    if (control) {
      control.addEventListener('input', update);
      control.addEventListener('change', update);
    }
  });

  if (reset) {
    reset.addEventListener('click', function () {
      if (input) input.value = '';
      if (region) region.value = '';
      if (type) type.value = '';
      if (year) year.value = '';
      if (sort) sort.value = 'default';
      update();
    });
  }

  update();
}

function initSearchPage() {
  var root = document.querySelector('[data-search-page]');
  if (!root || !window.MOVIES_SEARCH_INDEX) {
    return;
  }

  var form = root.querySelector('[data-search-form]');
  var input = root.querySelector('[data-search-input]');
  var category = root.querySelector('[data-search-category]');
  var type = root.querySelector('[data-search-type]');
  var resultGrid = root.querySelector('[data-search-results]');
  var count = root.querySelector('[data-search-count]');
  var empty = root.querySelector('[data-search-empty]');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  if (input) {
    input.value = initialQuery;
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function createCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="card-cover" href="' + movie.detail + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-badge" aria-hidden="true">▶</span>',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '<div class="tag-row"><span>' + escapeHtml(movie.categoryName) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function render() {
    var query = normalize(input && input.value);
    var selectedCategory = category ? category.value : '';
    var selectedType = type ? type.value : '';
    var movies = window.MOVIES_SEARCH_INDEX.filter(function (movie) {
      var haystack = normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine);
      return (!query || haystack.indexOf(query) !== -1) &&
        (!selectedCategory || movie.categorySlug === selectedCategory) &&
        (!selectedType || movie.type === selectedType);
    });

    movies.sort(function (a, b) {
      return b.score - a.score;
    });

    resultGrid.innerHTML = '';
    movies.slice(0, 240).forEach(function (movie) {
      resultGrid.appendChild(createCard(movie));
    });

    initImageFallbacks();

    if (count) {
      count.textContent = String(movies.length);
    }
    if (empty) {
      empty.classList.toggle('is-visible', movies.length === 0);
    }
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
  }

  [input, category, type].forEach(function (control) {
    if (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    }
  });

  render();
}

function initHlsPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var source = player.getAttribute('data-video-src');
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (!video || !source) {
        setStatus('暂无可用播放源');
        return Promise.reject(new Error('missing video source'));
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放源加载异常，请稍后重试');
            }
          });
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== source) {
          video.src = source;
        }
      } else {
        video.src = source;
      }

      return video.play();
    }

    if (button) {
      button.addEventListener('click', function () {
        setStatus('正在加载播放源...');
        attachSource().then(function () {
          player.classList.add('is-playing');
          setStatus('正在播放');
        }).catch(function () {
          setStatus('播放未能自动开始，可再次点击或使用浏览器控件播放');
        });
      });
    }

    if (video) {
      video.addEventListener('playing', function () {
        player.classList.add('is-playing');
        setStatus('正在播放');
      });
      video.addEventListener('pause', function () {
        setStatus('已暂停');
      });
    }
  });
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function (character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[character];
  });
}
