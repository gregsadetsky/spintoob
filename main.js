// spintoob
// parses a youtube url, embeds it, spins it.

const formView = document.getElementById('form-view');
const spinView = document.getElementById('spin-view');
const form = document.getElementById('spin-form');
const player = document.getElementById('player');
const spinner = document.getElementById('spinner');
const backLink = document.getElementById('back-link');

function parseVideoId(input) {
  const trimmed = input.trim();
  // bare 11-char id
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (url.pathname === '/watch') {
      const v = url.searchParams.get('v');
      return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
    }
    const m = url.pathname.match(/^\/(embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[2];
  }
  return null;
}

function parseHash() {
  const hash = location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);
  return {
    id: params.get('id'),
    speed: params.get('speed'),
  };
}

function renderRoute() {
  const { id, speed } = parseHash();
  if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
    showSpin(id, parseFloat(speed) || 0);
  } else {
    showForm();
  }
}

function showForm() {
  spinView.hidden = true;
  formView.hidden = false;
  player.src = ''; // stop playback
}

function showSpin(id, rpm) {
  formView.hidden = true;
  spinView.hidden = false;
  player.src = `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1`;

  if (rpm === 0 || !isFinite(rpm)) {
    spinner.classList.add('paused');
    spinner.style.removeProperty('--spin-duration');
    spinner.style.removeProperty('--spin-direction');
  } else {
    spinner.classList.remove('paused');
    const duration = 60 / Math.abs(rpm);
    spinner.style.setProperty('--spin-duration', `${duration}s`);
    spinner.style.setProperty('--spin-direction', rpm < 0 ? 'reverse' : 'normal');
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const urlInput = document.getElementById('url').value;
  const speedInput = document.getElementById('speed').value;
  const id = parseVideoId(urlInput);
  if (!id) {
    alert("can't find a youtube video id in that url. try something like https://www.youtube.com/watch?v=...");
    return;
  }
  const speed = parseFloat(speedInput);
  if (!isFinite(speed)) {
    alert("spin speed must be a number.");
    return;
  }
  location.hash = `id=${encodeURIComponent(id)}&speed=${encodeURIComponent(speed)}`;
});

backLink.addEventListener('click', (e) => {
  e.preventDefault();
  location.hash = '';
});

document.getElementById('example-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('url').value = 'https://www.youtube.com/watch?v=rrxk2WzrE14';
});

window.addEventListener('hashchange', renderRoute);
renderRoute();
