(() => {
  'use strict';
  const boot = () => {
    if (!window.update || !window.S) { setTimeout(boot, 50); return; }
    const baseUpdate = window.update;
    const state = window.BIBLE_FIGHTER_STABILITY = window.BIBLE_FIGHTER_STABILITY || { version:'1.0', bounds:[34,884], separation:44, hitstop:0 };
    const HOLD_KEYS = ['up','down','left','right','attack','skill1','skill2','sub','ult','scroll','helper'];
    const clearInput = () => {
      const mp = window.BIBLE_FIGHTER_MULTIPLAYER;
      if (!mp?.input) return;
      for (const slot of ['p1','p2']) for (const key of HOLD_KEYS) mp.input[slot][key] = false;
    };
    window.addEventListener('blur', clearInput, { passive:true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearInput(); }, { passive:true });

    const clamp = (f) => {
      if (!f) return;
      f.x = Math.max(state.bounds[0], Math.min(state.bounds[1] - f.w, f.x));
      if (f.y < 0) f.y = 0;
      if (f.y > window.G - f.h) { f.y = window.G - f.h; f.vy = 0; f.on = 1; }
    };
    const separate = () => {
      const a = window.A, b = window.B;
      if (!a || !b || !S.run) return;
      const gap = Math.abs((a.x + a.w/2) - (b.x + b.w/2));
      if (gap >= state.separation) return;
      const push = (state.separation - gap) / 2;
      if (a.x < b.x) { a.x -= push; b.x += push; }
      else { a.x += push; b.x -= push; }
      clamp(a); clamp(b);
    };
    window.update = (f, dt) => {
      if (state.hitstop > 0) { state.hitstop = Math.max(0, state.hitstop - 1); return; }
      baseUpdate(f, dt);
      clamp(f);
      if (f?.slot === 'p2') separate();
    };
    window.BIBLE_FIGHTER_TRIGGER_HITSTOP = (frames=2) => { state.hitstop = Math.max(state.hitstop, Math.min(4, frames)); };
    window.BIBLE_FIGHTER_STABILITY_READY = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
