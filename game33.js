(() => {
  'use strict';
  const boot = () => {
    if (!window.S || !window.roundInit || !window.rematch || !window.back) { setTimeout(boot, 50); return; }

    const lifecycle = window.BIBLE_FIGHTER_MATCH = window.BIBLE_FIGHTER_MATCH || {
      version: '1.0-rc',
      epoch: 0,
      active: false,
      round: 0,
      score: [0, 0]
    };

    const clearInput = () => {
      const mp = window.BIBLE_FIGHTER_MULTIPLAYER;
      if (!mp?.input) return;
      for (const slot of ['p1', 'p2']) {
        for (const key of ['up','down','left','right','attack','skill1','skill2','sub','ult','scroll','helper']) {
          mp.input[slot][key] = false;
        }
      }
      if (window.Q) for (const key of Object.keys(window.Q)) window.Q[key] = 0;
    };

    const sync = () => {
      lifecycle.round = Number(S.r || 0);
      lifecycle.score = Array.isArray(S.score) ? [...S.score] : [0, 0];
      lifecycle.active = !!S.run && !S.over;
    };

    const baseRoundInit = window.roundInit;
    const baseRematch = window.rematch;
    const baseBack = window.back;

    window.roundInit = () => {
      lifecycle.epoch += 1;
      clearInput();
      baseRoundInit();
      sync();
    };

    window.rematch = () => {
      lifecycle.epoch += 1;
      clearInput();
      baseRematch();
      sync();
    };

    window.back = () => {
      lifecycle.epoch += 1;
      lifecycle.active = false;
      clearInput();
      baseBack();
      sync();
    };

    window.BIBLE_FIGHTER_RESET_INPUT = clearInput;
    window.BIBLE_FIGHTER_MATCH_SYNC = sync;
    window.BIBLE_FIGHTER_MATCH_READY = true;
    sync();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
