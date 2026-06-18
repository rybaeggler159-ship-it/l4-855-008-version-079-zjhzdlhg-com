(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initCardFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    var chipGroups = Array.prototype.slice.call(document.querySelectorAll(".filter-chips"));

    function apply(root) {
      var scope = root.closest("section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var input = scope.querySelector("[data-card-filter]");
      var activeChip = scope.querySelector(".chip.active");
      var query = normalize(input ? input.value : "");
      var chipValue = activeChip ? normalize(activeChip.getAttribute("data-filter-value")) : "all";
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search") || card.textContent);
        var type = normalize(card.getAttribute("data-type"));
        var year = normalize(card.getAttribute("data-year"));
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedChip = chipValue === "all" || text.indexOf(chipValue) !== -1 || type.indexOf(chipValue) !== -1 || year.indexOf(chipValue) !== -1;
        card.classList.toggle("is-hidden", !(matchedQuery && matchedChip));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        apply(input);
      });
    });

    chipGroups.forEach(function (group) {
      group.addEventListener("click", function (event) {
        var chip = event.target.closest(".chip");
        if (!chip) {
          return;
        }
        group.querySelectorAll(".chip").forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        apply(chip);
      });
    });
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !results || !window.SiteIndex) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\">",
        "<a class=\"movie-cover\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">",
        "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
        "<span class=\"cover-gradient\"></span>",
        "<span class=\"year-badge\">" + escapeHtml(item.year) + "</span>",
        "<span class=\"play-dot\">▶</span>",
        "</a>",
        "<div class=\"movie-info\">",
        "<div class=\"movie-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</div>",
        "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
        "<p>" + escapeHtml(item.oneLine) + "</p>",
        "<div class=\"tag-row\">" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function render() {
      var query = normalize(input.value);
      var pool = window.SiteIndex.filter(function (item) {
        if (!query) {
          return true;
        }
        return normalize([item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(" ")].join(" ")).indexOf(query) !== -1;
      }).slice(0, 240);
      results.innerHTML = pool.map(card).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set("q", input.value.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.toString());
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js";
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = function () {
        resolve(null);
      };
      document.head.appendChild(script);
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var overlay = wrap.querySelector("[data-player-overlay]");
      var src = wrap.getAttribute("data-video");
      var loaded = false;
      var hlsObject = null;
      if (!video || !src) {
        return;
      }

      function attach() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          return Promise.resolve();
        }
        return loadHlsLibrary().then(function (HlsClass) {
          if (HlsClass && HlsClass.isSupported()) {
            hlsObject = new HlsClass({ enableWorker: true });
            hlsObject.loadSource(src);
            hlsObject.attachMedia(video);
          } else {
            video.src = src;
          }
        });
      }

      function play() {
        attach().then(function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          var action = video.play();
          if (action && typeof action.catch === "function") {
            action.catch(function () {});
          }
        });
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsObject) {
          hlsObject.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
})();
