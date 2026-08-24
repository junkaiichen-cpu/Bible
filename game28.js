(() => {
  'use strict';

  const boot = () => {
    if (!window.act || !window.start || !window.rematch || !window.S || !window.A && !window.B) return;

    const input = { p1: Object.create(null), p2: Object.create(null) };
    const bindings = {
      p1: { w:'up', a:'left', s:'down', d:'right', j:'attack', k:'skill1', l:'skill2', i:'sub', o:'ult', '6':'scroll', '7':'helper' },
      p2: { arrowup:'up', arrowleft:'left', arrowdown:'down', arrowright:'right', '1':'attack', '2':'skill1', '3':'skill2', '4':'sub', '5':'ult', '8':'scroll', '9':'helper' }
    };

    const mark = (slot, key, pressed) => { input[slot][key] = pressed; };

    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      for (const slot of ['p1','p2']) {
        const action = bindings[slot][key];
        if (!action) continue;
        mark(slot, action, true);
        if (['attack','skill1','skill2','sub','ult','scroll','helper'].includes(action)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          act(slot, action === 'attack' ? 'a' : action === 'skill1' ? 's1' : action === 'skill2' ? 's2' : action === 'sub' ? 'r' : action === 'ult' ? 'u' : action === 'scroll' ? 'c' : 'h');
        }
      }
    };
    const onKeyUp = (e) => {
      const key = e.key.toLowerCase();
      for (const slot of ['p1','p2']) {
        const action = bindings[slot][key];
        if (action) mark(slot, action, false);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);

    const loopMovement = () => {
      if (S.run && !S.paused) {
        const pairs = [['p1', window.A], ['p2', window.B]];
        for (const [slot, f] of pairs) {
          if (!f) continue;
          const q = input[slot];
          if (q.left) f.vx = Math.max(f.vx - f.sp * 0.45, -f.sp * 1.4);
          if (q.right) f.vx = Math.min(f.vx + f.sp * 0.45, f.sp * 1.4);
          if (q.up && f.on && f.st <= 0) f.vy = -f.jp;
          if (q.down && f.on) f.vy += 0.25;
        }
      }
      requestAnimationFrame(loopMovement);
    };
    requestAnimationFrame(loopMovement);

    window.BIBLE_FIGHTER_MULTIPLAYER_READY = true;
    window.BIBLE_FIGHTER_MULTIPLAYER = {
      version: '1.0-local-2p',
      slots: ['p1','p2'],
      bindings,
      input,
      snapshot() {
        return {
          ready: true,
          run: !!S.run,
          score: Array.isArray(S.score) ? [...S.score] : [0,0],
          p1: window.A ? { id:A.id, hp:A.hp, max:A.max, x:A.x, y:A.y, sub:A.sub, ult:A.u, combo:A.combo } : null,
          p2: window.B ? { id:B.id, hp:B.hp, max:B.max, x:B.x, y:B.y, sub:B.sub, ult:B.u, combo:B.combo } : null,
          over: !!S.over
        };
      }
    };
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
