
(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    var started = false;
    var instance = null;

    if (!video || !button || !source) {
      return;
    }

    function begin() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      button.classList.add('is-hidden');
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        instance.loadSource(source);
        instance.attachMedia(video);
        instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        instance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !instance) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            instance.startLoad();
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            instance.recoverMediaError();
          }
        });
        return;
      }

      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
    }

    button.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });

    window.addEventListener('pagehide', function () {
      if (instance) {
        instance.destroy();
        instance = null;
      }
    });
  };
})();
