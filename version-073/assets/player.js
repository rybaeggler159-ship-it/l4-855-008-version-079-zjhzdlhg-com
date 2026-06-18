(function () {
  function attachPlayer(box) {
    const video = box.querySelector('video');
    const overlay = box.querySelector('[data-play-overlay]');
    const button = box.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    const stream = video.getAttribute('data-stream');
    let started = false;
    let hls = null;

    function load() {
      if (!stream || started) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      started = true;
    }

    function play() {
      load();
      video.setAttribute('controls', 'controls');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!started || video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
