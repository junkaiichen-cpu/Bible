(() => {
  'use strict';

  const version = '1.1.0-combat-hud';
  const diagnostics = {
    version,
    ready: false,
    phase: 'boot',
    frame: 0,
    round: 0,
    score: [0, 0],
    fighters: [],
    lastAction: null,
    errors: []
  };

  window.BIBLE_FIGHTER_DIAGNOSTICS = diagnostics;

  const capture = (message) => {
    diagnostics.errors.push(String(message));
    diagnostics.errors = diagnostics.errors.slice(-20);
  };

  window.addEventListener('error', (event) => capture(event.error?.stack || event.message || 'window error'));
  window.addEventListener('unhandledrejection', (event) => capture(event.reason?.stack || event.reason || 'unhandled rejection'));

  const readGlobal = (name) => {
    try { return window[name]; } catch { return undefined; }
  };

  const snapshot = () => {
    diagnostics.frame += 1;
    const state = readGlobal('S');
    const fighterA = readGlobal('A');
    const fighterB = readGlobal('B');
    diagnostics.round = state?.r || 0;
    diagnostics.score = Array.isArray(state?.score) ? [...state.score] : [0, 0];
    diagnostics.phase = state?.run ? 'battle' : 'idle';
    diagnostics.fighters = [fighterA, fighterB].filter(Boolean).map((f) => ({
      slot: f.slot, id: f.id, hp: Math.round(f.hp), maxHp: f.max,
      x: Math.round(f.x), y: Math.round(f.y), combo: f.combo || 0,
      ult: Math.round(f.u || 0), st: Math.round(f.st || 0)
    }));
    return diagnostics;
  };

  const loadCombatHud = () => {
    if (window.BIBLE_FIGHTER_HUD_LOADING || window.BIBLE_FIGHTER_HUD_READY) return;
    window.BIBLE_FIGHTER_HUD_LOADING = true;

    if (!document.querySelector('link[data-bible-hud-css]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'game20.css';
      css.dataset.bibleHudCss = '1';
      document.head.appendChild(css);
    }
    const script = document.createElement('script');
    script.src = 'game20.js';
    script.async = false;
    script.onload = () => { window.BIBLE_FIGHTER_HUD_READY = true; window.BIBLE_FIGHTER_HUD_LOADING = false; };
    script.onerror = () => { window.BIBLE_FIGHTER_HUD_LOADING = false; capture('combat HUD failed to load'); };
    document.body.appendChild(script);
  };

  const boot = () => {
    try {
      if (!window.BIBLE_ROSTER || !window.BIBLE_SUPPORTS) throw new Error('combat data unavailable');
      if (typeof window.start !== 'function' || typeof window.act !== 'function') throw new Error('combat actions unavailable');
      diagnostics.ready = true;
      diagnostics.phase = 'ready';
      snapshot();
      window.setInterval(snapshot, 100);
      loadCombatHud();
    } catch (error) {
      capture(error?.stack || error);
    }
  };

  window.BIBLE_FIGHTER_TEST_API = {
    selectAndStart(p1 = 'david', p2 = 'moses') {
      if (!diagnostics.ready) throw new Error('diagnostics not ready');
      const state = readGlobal('S');
      if (!state?.pick) throw new Error('combat state unavailable');
      state.pick.p1 = p1; state.pick.p2 = p2;
      state.pick.sc1 = document.querySelector('#p1Scroll')?.value || state.pick.sc1;
      state.pick.sc2 = document.querySelector('#p2Scroll')?.value || state.pick.sc2;
      state.pick.h1 = document.querySelector('#p1Helper')?.value || state.pick.h1;
      state.pick.h2 = document.querySelector('#p2Helper')?.value || state.pick.h2;
      window.start();
      diagnostics.lastAction = `start:${p1}:${p2}`;
      return true;
    },
    press(slot, action) {
      window.act(slot, action);
      diagnostics.lastAction = `${slot}:${action}`;
      return true;
    },
    snapshot() { snapshot(); return JSON.parse(JSON.stringify(diagnostics)); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
