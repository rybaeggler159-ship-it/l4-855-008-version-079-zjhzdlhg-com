(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-to-top]").forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });

        setupHero();
        setupFilters();
    });

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-filter-search]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var scope = panel.parentElement;

            if (!scope) {
                return;
            }

            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card='movie']"));

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ").toLowerCase();
                    var cardType = card.getAttribute("data-type") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var passQuery = !query || haystack.indexOf(query) !== -1;
                    var passType = !typeValue || cardType.indexOf(typeValue) !== -1 || haystack.indexOf(typeValue.toLowerCase()) !== -1;
                    var passYear = true;

                    if (yearValue === "2020") {
                        var parsed = parseInt(cardYear, 10);
                        passYear = !parsed || parsed <= 2020;
                    } else if (yearValue) {
                        passYear = cardYear.indexOf(yearValue) !== -1;
                    }

                    card.classList.toggle("is-filtered-out", !(passQuery && passType && passYear));
                });
            }

            [input, type, year].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
        });
    }
})();
