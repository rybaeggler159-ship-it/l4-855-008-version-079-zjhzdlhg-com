import { H as Hls } from './hls-vendor-bbsaiqh1.js';

var onReady = function (callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

onReady(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.watch-overlay');
    var source = player.getAttribute('data-play-src');
    var loaded = false;
    var hlsInstance = null;

    var load = function () {
      if (!video || !source || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    var play = function () {
      load();
      player.classList.add('is-playing');
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
