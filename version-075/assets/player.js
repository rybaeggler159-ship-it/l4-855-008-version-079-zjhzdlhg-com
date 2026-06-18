function initMoviePlayer(videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;

    if (!video || !button || !sourceUrl) {
        return;
    }

    function bindSource() {
        if (video.getAttribute("data-ready") === "1") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        video.setAttribute("data-ready", "1");
    }

    function startPlayback() {
        bindSource();
        button.classList.add("is-hidden");
        var playAction = video.play();

        if (playAction && typeof playAction.catch === "function") {
            playAction.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", startPlayback);

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
        button.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
