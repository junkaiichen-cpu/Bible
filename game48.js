(() => {
  'use strict';
  const boot = () => {
    if (!window.S || !window.A || !window.B) return false;
    const state = window.BIBLE_FIGHTER_RUNTIME_POLISH = window.BIBLE_FIGHTER_RUNTIME_POLISH || {
      version: '1.5.1', ready: true, samples: 0, last: performance.now(), frameMs: 16.67,
      fps: 60, spikes: 0, prunedFx: 0, prunedShots: 0
    };
    const clampArray = (name, max) => {
      const list = window.S?.[name];
      if (!Array.isArray(list) || list.length <= max) return;
      const remove = list.length - max;
      list.splice(0, remove);
      if (name === 'fx') state.prunedFx += remove;
      if (name === 'shots') state.prunedShots += remove;
    };
    const reset = () => {
      state.samples = 0; state.last = performance.now(); state.frameMs = 16.67; state.fps = 60; state.spikes = 0;
      for (const key of ['fx', 'shots', 'txt', 'rings']) if (Array.isArray(window.S?.[key])) window.S[key].length = 0;
    };
    const wrap = (name) => {
      const fn = window[name];
      if (typeof fn !== 'function' || fn.__bfWrapped) return;
      const wrapped = (...args) => {
        const r = fn(...args);
        clampArray('fx', 180); clampArray('shots', 32); clampArray('txt', 64); clampArray('rings', 40);
        return r;
      };
      wrapped.__bfWrapped = true;
      window[name] = wrapped;
    };
    ['burst','ring','shot','hit'].forEach(wrap);
    const baseStart = window.start, baseRematch = window.rematch, baseBack = window.back;
    window.start = (...args) => { reset(); return baseStart?.(...args); };
    window.rematch = (...args) => { reset(); return baseRematch?.(...args); };
    window.back = (...args) => { reset(); return baseBack?.(...args); };
    const sample = () => {
      const now = performance.now();
      const dt = now - state.last;
      state.last = now;
      if (Number.isFinite(dt) && dt > 0) {
        state.frameMs = state.frameMs * 0.82 + Math.min(100, dt) * 0.18;
        state.fps = 1000 / Math.max(1, state.frameMs);
        if (dt > 50) state.spikes++;
      }
      state.samples++;
      clampArray('fx', 180); clampArray('shots', 32); clampArray('txt', 64); clampArray('rings', 40);
    };
    window.BIBLE_FIGHTER_RUNTIME_POLISH_READY = true;
    window.BIBLE_FIGHTER_RUNTIME_POLISH_API = { snapshot: () => ({ ...state, battle: !!window.S?.run, p1Hp: window.A?.hp ?? 0, p2Hp: window.B?.hp ?? 0, effects: { fx: window.S?.fx?.length || 0, shots: window.S?.shots?.length || 0, txt: window.S?.txt?.length || 0, rings: window.S?.rings?.length || 0 } }) };
    setInterval(sample, 500);
    return true;
  };
  if (!boot()) {
    let tries = 0;
    const timer = setInterval(() => { tries++; if (boot() || tries >= 120) clearInterval(timer); }, 50);
  }
})();
