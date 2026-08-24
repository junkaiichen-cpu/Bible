(() => {
  'use strict';

  const boot = () => {
    if (!window.S || !window.A || !window.B) return false;

    const core = window.BIBLE_COMBAT_CORE;
    const api = window.BIBLE_FIGHTER_COMBAT_CORE = window.BIBLE_FIGHTER_COMBAT_CORE || {
      version: core?.version || '0.1.0',
      frame: 0,
      lastTime: performance.now(),
      state: Object.create(null),
      events: [],
      diagnostics: { transitions: 0, hits: 0, invalidStates: 0 }
    };

    const allowed = new Set(core?.states || []);
    const infer = (fighter) => {
      if (!fighter || fighter.hp <= 0) return 'dead';
      if (fighter.st > 0) return fighter.y < (window.G || 438) - 70 ? 'airborne' : 'hitstun';
      if (fighter.inv > 0) return 'invulnerable';
      if (fighter.subLock > 0) return 'substitution';
      if (fighter.skillBusy > 0) return 'skill';
      if (fighter.atk > 0) return 'attack';
      if (Math.abs(fighter.vy || 0) > 0.25 || fighter.y < (window.G || 438) - 68) return 'jump';
      if (Math.abs(fighter.vx || 0) > 0.25) return 'walk';
      return 'idle';
    };

    const transition = (fighter) => {
      if (!fighter) return;
      const next = infer(fighter);
      if (!allowed.has(next)) {
        api.diagnostics.invalidStates++;
        return;
      }
      const prev = api.state[fighter.slot];
      if (prev !== next) {
        api.state[fighter.slot] = next;
        api.diagnostics.transitions++;
        if (api.events.length >= 64) api.events.shift();
        api.events.push({ frame: api.frame, slot: fighter.slot, from: prev || null, to: next });
      }
    };

    const wrapHit = () => {
      const fn = window.hit;
      if (typeof fn !== 'function' || fn.__bfCombatCoreWrapped) return;
      const wrapped = (...args) => {
        api.diagnostics.hits++;
        return fn(...args);
      };
      wrapped.__bfCombatCoreWrapped = true;
      window.hit = wrapped;
    };
    wrapHit();

    const reset = () => {
      api.frame = 0;
      api.lastTime = performance.now();
      api.events.length = 0;
      api.diagnostics.transitions = 0;
      api.diagnostics.hits = 0;
      api.diagnostics.invalidStates = 0;
      api.state = Object.create(null);
    };

    const sample = () => {
      if (!window.S) return;
      api.frame++;
      transition(window.A);
      transition(window.B);
    };

    const snapshot = () => ({
      version: api.version,
      frame: api.frame,
      battle: !!window.S?.run,
      states: { ...api.state },
      diagnostics: { ...api.diagnostics },
      events: api.events.slice(-16),
      frameRateTarget: core?.fps || 60
    });

    api.snapshot = snapshot;
    api.reset = reset;
    api.sample = sample;
    api.ready = true;
    window.BIBLE_FIGHTER_COMBAT_CORE_READY = true;

    const baseStart = window.start;
    const baseRematch = window.rematch;
    const baseBack = window.back;
    window.start = (...args) => { reset(); return baseStart?.(...args); };
    window.rematch = (...args) => { reset(); return baseRematch?.(...args); };
    window.back = (...args) => { reset(); return baseBack?.(...args); };

    // One lightweight diagnostic timer; it does not drive gameplay timing.
    setInterval(sample, 1000 / 30);
    return true;
  };

  if (!boot()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (boot() || tries >= 120) clearInterval(timer);
    }, 50);
  }
})();
