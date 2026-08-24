(() => {
  'use strict';

  const version = '1.0.1-combat-smoke';
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

  const snapshot = () => {
    diagnostics.frame += 1;
    diagnostics.round = typeof S === 'object' && S ? S.r || 0 : 0;
    diagnostics.score = typeof S === 'object' && S ? [...(S.score || [0, 0])] : [0, 0];
    diagnostics.phase = typeof S === 'object' && S ? (S.run ? 'battle' : 'idle') : 'boot';
    diagnostics.fighters = [A, B].filter(Boolean).map((f) => ({
      slot: f.slot,
      id: f.id,
      hp: Math.round(f.hp),
      maxHp: f.max,
      x: Math.round(f.x),
      y: Math.round(f.y),
      combo: f.combo || 0,
      ult: Math.round(f.u || 0),
      st: Math.round(f.st || 0)
    }));
  };

  const boot = () => {
    try {
      if (!window.BIBLE_ROSTER || !window.BIBLE_SUPPORTS) throw new Error('combat data unavailable');
      if (!window.start || !window.act) throw new Error('combat actions unavailable');
      diagnostics.ready = true;
      diagnostics.phase = 'ready';
      snapshot();
      window.setInterval(snapshot, 100);
    } catch (error) {
      capture(error?.stack || error);
    }
  };

  window.BIBLE_FIGHTER_TEST_API = {
    selectAndStart(p1 = 'david', p2 = 'moses') {
      if (!diagnostics.ready) throw new Error('diagnostics not ready');
      S.pick.p1 = p1;
      S.pick.p2 = p2;
      S.pick.sc1 = document.querySelector('#p1Scroll')?.value || S.pick.sc1;
      S.pick.sc2 = document.querySelector('#p2Scroll')?.value || S.pick.sc2;
      S.pick.h1 = document.querySelector('#p1Helper')?.value || S.pick.h1;
      S.pick.h2 = document.querySelector('#p2Helper')?.value || S.pick.h2;
      start();
      diagnostics.lastAction = `start:${p1}:${p2}`;
      return true;
    },
    press(slot, action) {
      act(slot, action);
      diagnostics.lastAction = `${slot}:${action}`;
      return true;
    },
    snapshot() {
      snapshot();
      return JSON.parse(JSON.stringify(diagnostics));
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
