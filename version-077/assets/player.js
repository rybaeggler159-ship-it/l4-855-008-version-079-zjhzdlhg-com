import { H as Hls } from './hls-vendor-BbSaIQh1.js';

function initPlayer(video) {
  var box = video.closest('.player-shell');
  var button = box ? box.querySelector('.player-start') : null;
  var source = video.getAttribute('data-stream');
  var hls = null;

  function attach() {
    if (video.dataset.ready === '1') return;
    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      return;
    }

    video.src = source;
  }

  function start() {
    attach();
    if (box) box.classList.add('is-started');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.dataset.ready !== '1') start();
  });

  video.addEventListener('play', function () {
    if (box) box.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (box) box.classList.remove('is-playing');
  });

  window.addEventListener('pagehide', function () {
    if (hls) hls.destroy();
  });
}

document.querySelectorAll('video[data-stream]').forEach(initPlayer);
