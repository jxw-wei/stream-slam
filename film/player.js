(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const video = $('#film'), player = $('#player'), seek = $('#seek');
  const captionBox = $('#captions'), captionText = $('#captionText');
  const status = $('#status'), playButton = $('#playPause');
  const sources = {
    720: 'STREAM-SLAM_Film_v2_preview_720p.mp4?v=11',
    1080: 'STREAM-SLAM_Film_v2_1080p.mp4?v=11',
  };
  let wantPlaying = false, requestVersion = 0, sourceVersion = 0;
  let switching = false, scrubbing = false, captionLanguage = 'en';
  let nativeFullscreen = false, nativeCaptions = false;
  try {
    const saved = localStorage.getItem('stream-slam-caption-language');
    if (['en', 'zh', 'off'].includes(saved)) captionLanguage = saved;
  } catch (_) { /* The player also works when browser storage is disabled. */ }
  if(new URLSearchParams(location.search).has('embed'))captionLanguage='en';
  $('#captionLanguage').value = captionLanguage;
  let cues = [], chapters = [], chapterButtons = [], activeCue = -2;
  let feedbackTimer, waitingTimer;
  const hasVideoClock = 'requestVideoFrameCallback' in video;

  // Native controls and the VTT track remain usable without JavaScript.
  video.controls = false;
  $('.controls').hidden = false;
  function syncNativeTracks() {
    for (const track of video.textTracks) {
      track.mode = (nativeFullscreen || nativeCaptions) && track.language === captionLanguage ? 'showing' : 'hidden';
    }
  }
  syncNativeTracks();
  video.textTracks.addEventListener('addtrack', syncNativeTracks);
  video.addEventListener('webkitbeginfullscreen', () => {
    nativeFullscreen = true;
    syncNativeTracks(); activeCue = -2; paint(video.currentTime);
  });
  video.addEventListener('webkitendfullscreen', () => {
    nativeFullscreen = false;
    syncNativeTracks(); activeCue = -2; paint(video.currentTime);
  });

  function clock(t) {
    t = Math.max(0, Math.floor(t || 0));
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  }
  function updateControls() {
    $('#playLabel').textContent = wantPlaying ? 'Pause' : 'Play';
    $('#playIcon').textContent = wantPlaying ? 'Ⅱ' : '▶';
    playButton.setAttribute('aria-label', wantPlaying ? 'Pause' : 'Play');
  }
  function clearWaiting() { clearTimeout(waitingTimer); status.textContent = ''; }
  function feedback(symbol) {
    clearTimeout(feedbackTimer);
    $('#feedback').textContent = symbol;
    $('#feedback').classList.add('visible');
    feedbackTimer = setTimeout(() => $('#feedback').classList.remove('visible'), 260);
  }
  function requestPlay() {
    wantPlaying = true;
    const version = ++requestVersion;
    updateControls();
    // Pause remains synchronous, even when play() is waiting for network data.
    const promise = video.play();
    if (promise) promise.then(() => {
      if (version !== requestVersion || !wantPlaying) {
        if (!wantPlaying) video.pause();
        return;
      }
      clearWaiting();
    }).catch(error => {
      if (version !== requestVersion || error.name === 'AbortError') return;
      wantPlaying = false;
      updateControls();
      status.textContent = error.name === 'NotAllowedError' ? 'Click Play to start' : 'Video unavailable. Please reload.';
    });
  }
  function requestPause() {
    ++requestVersion;
    wantPlaying = false;
    video.pause();
    clearWaiting();
    updateControls();
    paint(video.currentTime);
  }
  function toggle() {
    if (wantPlaying) { requestPause(); feedback('Ⅱ'); }
    else { requestPlay(); feedback('▶'); }
  }
  playButton.addEventListener('click', toggle);
  video.addEventListener('click', toggle);
  document.addEventListener('keydown', event => {
    if (event.target.closest('input,select,textarea,button,a') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) toggle(); }
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      event.preventDefault(); seekTo(video.currentTime + (event.code === 'ArrowRight' ? 5 : -5));
    }
  });

  function cueAt(t) {
    let lo = 0, hi = cues.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (cues[mid].start > t) hi = mid - 1;
      else lo = mid + 1;
    }
    return hi >= 0 && t < cues[hi].end ? hi : -1;
  }
  function fitCaption() {
    captionText.style.fontSize = '';
    if (!captionText.textContent) return;
    const width = captionBox.clientWidth;
    const size = parseFloat(getComputedStyle(captionText).fontSize);
    if (captionText.scrollWidth > width && width > 0) {
      captionText.style.fontSize = `${size * (width - 16) / captionText.scrollWidth}px`;
    }
  }
  function paint(t) {
    const index = captionLanguage !== 'off' && !nativeCaptions && !nativeFullscreen ? cueAt(t) : -1;
    if (index !== activeCue) {
      activeCue = index;
      captionText.textContent = index < 0 ? '' : (captionLanguage === 'zh' ? cues[index].zh : cues[index].text);
      captionBox.hidden = index < 0;
      fitCaption();
    }
    if (!scrubbing) seek.value = String(t || 0);
    $('#time').textContent = `${clock(t)} / ${clock(video.duration || 272.966667)}`;
    chapterButtons.forEach((b, i) => b.classList.toggle('active', t >= chapters[i].start && t < chapters[i].start + chapters[i].duration));
  }
  if (hasVideoClock) {
    const onFrame = (_, frame) => {
      paint(frame.mediaTime);
      video.requestVideoFrameCallback(onFrame);
    };
    video.requestVideoFrameCallback(onFrame);
  }
  video.addEventListener('timeupdate', () => { if (!hasVideoClock || video.paused) paint(video.currentTime); });
  for (const event of ['loadeddata', 'seeked', 'pause']) video.addEventListener(event, () => paint(video.currentTime));
  video.addEventListener('loadedmetadata', () => { seek.max = String(video.duration); paint(video.currentTime); });
  video.addEventListener('playing', () => {
    if (!wantPlaying) video.pause();
    else clearWaiting();
  });
  video.addEventListener('pause', () => {
    if (video.paused && !switching && !scrubbing) { wantPlaying = false; updateControls(); }
  });
  video.addEventListener('ended', () => { requestPause(); paint(video.duration); });
  video.addEventListener('waiting', () => {
    clearTimeout(waitingTimer);
    waitingTimer = setTimeout(() => { if (wantPlaying && video.readyState < 3) status.textContent = 'Buffering…'; }, 250);
  });
  video.addEventListener('error', () => { requestPause(); status.textContent = 'Video failed to load. Please reload.'; });

  function seekTo(t) {
    const target = Math.min(video.duration || 272.966667, Math.max(0, t));
    video.currentTime = target;
    paint(target);
  }
  seek.addEventListener('pointerdown', () => { scrubbing = true; video.pause(); });
  seek.addEventListener('input', () => seekTo(Number(seek.value)));
  function endScrub() {
    if (!scrubbing) return;
    scrubbing = false;
    if (wantPlaying) requestPlay();
  }
  seek.addEventListener('change', endScrub);
  seek.addEventListener('pointercancel', endScrub);
  window.addEventListener('pointerup', endScrub);

  $('#captionLanguage').addEventListener('change', () => {
    captionLanguage = $('#captionLanguage').value;
    try { localStorage.setItem('stream-slam-caption-language', captionLanguage); } catch (_) {}
    syncNativeTracks();
    activeCue = -2; paint(video.currentTime);
  });
  $('#mute').addEventListener('click', () => { video.muted = !video.muted; });
  video.addEventListener('volumechange', () => {
    $('#mute').textContent = `Sound ${video.muted ? 'Off' : 'On'}`;
    $('#mute').setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
  });
  $('#fullscreen').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (player.requestFullscreen) player.requestFullscreen().catch(() => {});
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  });
  document.addEventListener('fullscreenchange', () => {
    $('#fullscreen').textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
    fitCaption();
  });
  new ResizeObserver(fitCaption).observe($('.screen'));

  $('#quality').addEventListener('change', () => {
    const version = ++sourceVersion, time = video.currentTime;
    ++requestVersion;
    switching = true;
    clearWaiting(); status.textContent = 'Switching quality…';
    video.pause();
    video.src = sources[$('#quality').value];
    video.load();
    video.addEventListener('loadedmetadata', () => {
      if (version !== sourceVersion) return;
      seekTo(time);
      video.addEventListener('seeked', () => {
        if (version !== sourceVersion) return;
        switching = false; clearWaiting();
        if (wantPlaying) requestPlay();
        else requestPause();
      }, { once: true });
    }, { once: true });
  });

  window.setFilmLocale=lang=>{captionLanguage=lang;$('#captionLanguage').value=lang;syncNativeTracks();activeCue=-2;paint(video.currentTime);};
  fetch('captions.json?v=11').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => {
    cues = data; activeCue = -2; paint(video.currentTime);
  }).catch(() => {
    nativeCaptions = true;
    syncNativeTracks(); activeCue = -2; paint(video.currentTime);
  });
  const names = ['Opening','Sparse to dense','Depth filtering','Retrospective correction','Asynchronous mapping','Scene tour','Comparison','Accuracy','Memory','Closing'];
  fetch('timeline.json').then(r => r.json()).then(data => {
    chapters = data;
    chapterButtons = data.map((scene, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = names[i];
      b.addEventListener('click', () => { seekTo(scene.start + .25); requestPlay(); });
      $('#chapters').appendChild(b); return b;
    });
    const requestedKind = new URLSearchParams(location.search).get('chapter');
    const requested = data.find(scene => scene.kind === requestedKind);
    if (requested) {
      const cueChapter = () => seekTo(requested.start + .25);
      if (video.readyState >= 1) cueChapter();
      else video.addEventListener('loadedmetadata', cueChapter, { once: true });
    }
  }).catch(() => {});
})();
