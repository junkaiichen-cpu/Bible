(() => {
  'use strict';
  const C = document.querySelector('#game');
  if (!C) return;
  const state = window.BIBLE_FIGHTER_QUALITY = window.BIBLE_FIGHTER_QUALITY || {
    version: '1.0', targetFps: 60, fps: 60, frameMs: 16.7, dpr: 1, tier: 'high', hidden: false, resized: false
  };

  const capDpr = () => {
    state.dpr = Math.min(1.5, Math.max(1, Number(window.devicePixelRatio) || 1));
    C.style.imageRendering = 'pixelated';
    C.style.display = 'block';
    C.style.width = '100%';
    C.style.height = 'auto';
    state.resized = true;
  };

  const clearInput = () => window.BIBLE_FIGHTER_CLEAR_INPUT?.();
  const updateVisibility = () => {
    state.hidden = document.hidden;
    if (state.hidden) clearInput();
  };

  capDpr();
  window.addEventListener('resize', capDpr, { passive: true });
  window.addEventListener('blur', clearInput, { passive: true });
  document.addEventListener('visibilitychange', updateVisibility, { passive: true });

  let last = performance.now();
  let acc = 0;
  let samples = 0;
  let lastFrame = last;
  const sample = (now) => {
    const dt = Math.max(0, now - lastFrame);
    lastFrame = now;
    const fps = dt > 0 ? 1000 / dt : 60;
    if (fps < 30) acc += fps; else acc += fps;
    samples += 1;
    if (samples >= 30) {
      state.fps = Math.round(acc / samples);
      state.frameMs = Number((1000 / Math.max(1, state.fps)).toFixed(1));
      state.tier = state.fps < 42 ? 'low' : state.fps < 54 ? 'medium' : 'high';
      acc = 0; samples = 0;
    }
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);

  window.BIBLE_FIGHTER_QUALITY_READY = true;
  window.BIBLE_FIGHTER_QUALITY.snapshot = () => ({ ...state });
})();
