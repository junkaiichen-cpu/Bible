(() => {
  'use strict';

  // 1.5.1 -> 1.6 combat-core foundation.
  // This is intentionally data-only: existing gameplay remains the source of truth
  // until the state machine migration is completed.
  window.BIBLE_COMBAT_CORE = Object.freeze({
    version: '0.1.0',
    fps: 60,
    states: Object.freeze([
      'idle', 'walk', 'jump', 'attack', 'skill', 'dash', 'substitution',
      'hitstun', 'airborne', 'knockdown', 'invulnerable', 'dead'
    ]),
    phases: Object.freeze(['startup', 'active', 'recovery']),
    defaultMove: Object.freeze({
      startup: 3,
      active: 3,
      recovery: 6,
      cancelInto: Object.freeze([])
    }),
    normal5: Object.freeze([
      Object.freeze({ id: 1, startup: 3, active: 3, recovery: 6, damage: 6 }),
      Object.freeze({ id: 2, startup: 3, active: 3, recovery: 6, damage: 7 }),
      Object.freeze({ id: 3, startup: 3, active: 4, recovery: 6, damage: 9 }),
      Object.freeze({ id: 4, startup: 4, active: 4, recovery: 7, damage: 11 }),
      Object.freeze({ id: 5, startup: 5, active: 5, recovery: 10, damage: 14 })
    ])
  });
})();
