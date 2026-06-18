(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var links = document.querySelector(".nav-links");

        if (toggle && links) {
            toggle.addEventListener("click", function () {
                links.classList.toggle("is-open");
            });
        }

        var backTop = document.querySelector(".back-top");
        if (backTop) {
            window.addEventListener("scroll", function () {
                backTop.classList.toggle("is-visible", window.scrollY > 520);
            });
            backTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var heroIndex = 0;

        function showHero(index) {
            if (!slides.length) {
                return;
            }
            heroIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === heroIndex);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === heroIndex);
            });
        }

        if (slides.length) {
            dots.forEach(function (dot, itemIndex) {
                dot.addEventListener("click", function () {
                    showHero(itemIndex);
                });
            });
            window.setInterval(function () {
                showHero(heroIndex + 1);
            }, 5600);
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-search]"));
        var filterSelects = Array.prototype.slice.call(document.querySelectorAll("[data-movie-filter]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        function applyFilters() {
            var query = searchInputs.map(function (input) {
                return input.value.trim().toLowerCase();
            }).join(" ").trim();
            var activeType = filterSelects.length ? filterSelects[0].value : "all";

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var matchedText = !query || haystack.indexOf(query) !== -1;
                var matchedType = activeType === "all" || type === activeType;
                card.classList.toggle("hidden-by-filter", !(matchedText && matchedType));
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
        });

        filterSelects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        var player = document.querySelector(".player-wrap[data-hls]");
        if (player) {
            var video = player.querySelector("video");
            var mask = player.querySelector(".play-mask");
            var hlsUrl = player.getAttribute("data-hls");
            var attached = false;
            var instance = null;

            function attachVideo() {
                if (attached || !video || !hlsUrl) {
                    return;
                }
                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = hlsUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({ enableWorker: true });
                    instance.loadSource(hlsUrl);
                    instance.attachMedia(video);
                } else {
                    video.src = hlsUrl;
                }
            }

            function playVideo() {
                attachVideo();
                player.classList.add("is-playing");
                if (video) {
                    var playPromise = video.play();
                    if (playPromise && playPromise.catch) {
                        playPromise.catch(function () {});
                    }
                }
            }

            if (mask) {
                mask.addEventListener("click", playVideo);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!attached) {
                        playVideo();
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (instance) {
                    instance.destroy();
                }
            });
        }
    });
})();
