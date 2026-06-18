import { H as Hls } from './hls-vendor.js';

const navToggle = document.querySelector('[data-nav-toggle]');
const mainNav = document.querySelector('[data-main-nav]');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('is-open');
  });
}

const slider = document.querySelector('[data-hero-slider]');
if (slider) {
  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-slide-dot]'));
  const prev = slider.querySelector('[data-slide-prev]');
  const next = slider.querySelector('[data-slide-next]');
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const schedule = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5000);
  };

  prev?.addEventListener('click', () => {
    show(index - 1);
    schedule();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    schedule();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      show(dotIndex);
      schedule();
    });
  });

  show(0);
  schedule();
}

const filterInput = document.querySelector('[data-filter-input]');
const sortSelect = document.querySelector('[data-sort-select]');
const cardContainer = document.querySelector('[data-card-container]');
const cards = cardContainer ? Array.from(cardContainer.querySelectorAll('.movie-card')) : [];
const countBox = document.querySelector('[data-filter-count]');

const applyFilter = () => {
  if (!cardContainer) {
    return;
  }
  const keyword = (filterInput?.value || '').trim().toLowerCase();
  let visible = 0;
  cards.forEach((card) => {
    const haystack = [
      card.dataset.title || '',
      card.dataset.year || '',
      card.dataset.region || '',
      card.dataset.tags || ''
    ].join(' ').toLowerCase();
    const matched = !keyword || haystack.includes(keyword);
    card.hidden = !matched;
    if (matched) {
      visible += 1;
    }
  });
  if (countBox) {
    countBox.textContent = String(visible);
  }
};

const applySort = () => {
  if (!cardContainer || !sortSelect) {
    return;
  }
  const sorted = [...cards].sort((a, b) => {
    if (sortSelect.value === 'title') {
      return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
    }
    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
  });
  sorted.forEach((card) => cardContainer.appendChild(card));
};

filterInput?.addEventListener('input', applyFilter);
sortSelect?.addEventListener('change', () => {
  applySort();
  applyFilter();
});
applySort();
applyFilter();

const playerCards = Array.from(document.querySelectorAll('[data-player]'));
const playerMap = new WeakMap();

const bindPlayer = (player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const state = player.querySelector('[data-player-state]');
  if (!video) {
    return;
  }
  const source = video.dataset.src;
  let loaded = false;

  const setState = (message) => {
    if (state) {
      state.textContent = message;
    }
  };

  const load = () => {
    if (loaded || !source) {
      return;
    }
    loaded = true;
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setState('已就绪');
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setState('网络错误，正在重试');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setState('媒体错误，正在恢复');
          hls.recoverMediaError();
        } else {
          setState('播放出错');
          hls.destroy();
        }
      });
      playerMap.set(video, hls);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setState('已就绪');
    } else {
      setState('当前浏览器不支持播放');
    }
  };

  const play = async () => {
    load();
    try {
      await video.play();
      player.classList.add('is-playing');
      setState('正在播放');
    } catch (_error) {
      video.controls = true;
      setState('请使用播放器控件开始播放');
    }
  };

  button?.addEventListener('click', play);
  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', () => {
    player.classList.add('is-playing');
    setState('正在播放');
  });
  video.addEventListener('pause', () => {
    player.classList.remove('is-playing');
    setState('已暂停');
  });
  video.addEventListener('ended', () => {
    player.classList.remove('is-playing');
    setState('播放结束');
  });
};

playerCards.forEach(bindPlayer);

const searchRoot = document.querySelector('[data-search-page]');
if (searchRoot && Array.isArray(window.MOVIE_INDEX)) {
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  const input = searchRoot.querySelector('[data-search-input]');
  const resultBox = searchRoot.querySelector('[data-search-results]');
  const count = searchRoot.querySelector('[data-search-count]');
  if (input) {
    input.value = initial;
  }

  const render = () => {
    const query = (input?.value || '').trim().toLowerCase();
    const items = window.MOVIE_INDEX.filter((item) => {
      const haystack = [item.title, item.region, item.type, item.year, item.tags].join(' ').toLowerCase();
      return !query || haystack.includes(query);
    }).slice(0, 120);
    if (count) {
      count.textContent = String(items.length);
    }
    if (!resultBox) {
      return;
    }
    resultBox.innerHTML = items.map((item) => `
      <article class="rank-item">
        <span class="rank-num">${item.id}</span>
        <div>
          <h3><a href="${item.url}">${item.title}</a></h3>
          <p>${item.year} · ${item.region} · ${item.type}</p>
          <p>${item.line}</p>
        </div>
      </article>
    `).join('') || '<div class="no-results">没有找到匹配影片</div>';
  };

  input?.addEventListener('input', render);
  render();
}
