(() => {
  'use strict';

  // Build 19 combat-frame contract: explicit move phases, cancel windows,
  // juggle protection and substitution timing. This layer observes the
  // existing engine without replacing its core damage rules.
  const boot = () => {
    if (!window.S || !window.A || !window.B || !window.attack) return;

    window.BIBLE_MOVE_DATA = {
      normal: {
        1: { startup: 5, active: 4, recovery: 8, cancel: 5, hitstop: 4, juggle: 1 },
        2: { startup: 5, active: 4, recovery: 8, cancel: 5, hitstop: 4, juggle: 1 },
        3: { startup: 6, active: 4, recovery: 9, cancel: 6, hitstop: 4, juggle: 1 },
        4: { startup: 7, active: 4, recovery: 10, cancel: 7, hitstop: 5, juggle: 1 },
        5: { startup: 8, active: 5, recovery: 15, cancel: 8, hitstop: 7, juggle: 2 }
      },
      david: { s1: { startup: 8, active: 5, recovery: 18, cancel: 10 }, s2: { startup: 7, active: 8, recovery: 20, cancel: 12 } },
      moses: { s1: { startup: 7, active: 6, recovery: 20, cancel: 9 }, s2: { startup: 9, active: 12, recovery: 24, cancel: 12 } },
      samson: { s1: { startup: 6, active: 7, recovery: 22, cancel: 10 }, s2: { startup: 8, active: 10, recovery: 22, cancel: 12 } },
      daniel: { s1: { startup: 5, active: 4, recovery: 18, cancel: 9 }, s2: { startup: 7, active: 5, recovery: 20, cancel: 10 } },
      elijah: { s1: { startup: 8, active: 6, recovery: 20, cancel: 10 }, s2: { startup: 9, active: 10, recovery: 24, cancel: 12 } },
      paul: { s1: { startup: 7, active: 7, recovery: 20, cancel: 10 }, s2: { startup: 8, active: 8, recovery: 22, cancel: 11 } }
    };

    const ensure = (f) => {
      if (!f) return;
      f.movePhase = f.movePhase || 'idle';
      f.moveTimer = f.moveTimer || 0;
      f.moveKind = f.moveKind || null;
      f.cancelUntil = f.cancelUntil || 0;
      f.juggleProtect = f.juggleProtect || 0;
      f.subWindow = f.subWindow || 0;
    };
    ensure(A); ensure(B);

    const phaseFrom = (ctx) => ctx?.phase || 'idle';
    const wrapAttack = window.attack;
    window.attack = function (f) {
      ensure(f);
      const before = f.attackCtx;
      const r = wrapAttack(f);
      if (!before && f.attackCtx) {
        const data = window.BIBLE_MOVE_DATA.normal[f.attackCtx.step] || window.BIBLE_MOVE_DATA.normal[1];
        f.movePhase = 'startup';
        f.moveTimer = data.startup;
        f.moveKind = `5A-${f.attackCtx.step}`;
        f.cancelUntil = data.cancel;
      }
      return r;
    };

    const wrapSkill = (name, key) => {
      const base = window[name];
      if (!base) return;
      window[name] = function (f) {
        ensure(f);
        const before = f.skillCtx;
        const r = base(f);
        const profile = window.BIBLE_MOVE_DATA[f.id]?.[key] || { startup: 8, active: 6, recovery: 20, cancel: 10 };
        f.movePhase = 'startup';
        f.moveTimer = profile.startup;
        f.moveKind = `${key.toUpperCase()}:${f.id}`;
        f.cancelUntil = profile.cancel;
        if (before !== f.skillCtx) f.skillCtx = f.skillCtx || { phase: 'startup', timer: profile.startup };
        return r;
      };
    };
    wrapSkill('skill1', 's1');
    wrapSkill('skill2', 's2');

    const baseUpdate = window.update;
    window.update = function (f, dt) {
      ensure(f);
      baseUpdate?.(f, dt);
      if (!S.run || S.paused) return;

      if (f.attackCtx) {
        f.movePhase = f.attackCtx.phase;
        f.moveTimer = f.attackCtx.timer;
      } else if (f.skillBusy > 0) {
        if (f.movePhase === 'startup' && f.moveTimer > 0) f.moveTimer -= 1;
        if (f.moveTimer <= 0) f.movePhase = 'active';
      } else if (f.st > 0) {
        f.movePhase = 'hitstun';
        f.moveTimer = f.st;
      } else {
        f.movePhase = 'idle';
        f.moveTimer = 0;
      }

      f.cancelUntil = Math.max(0, (f.cancelUntil || 0) - 1);
      f.juggleProtect = Math.max(0, (f.juggleProtect || 0) - 1);
      f.subWindow = Math.max(0, (f.subWindow || 0) - 1);
    };

    const baseHit = window.hit;
    window.hit = function (f, e, d, st, kn, label) {
      if (e?.juggleProtect > 0 && Math.abs(kn || 0) > 4) {
        st = Math.min(st, 6);
        kn *= 0.65;
      }
      baseHit?.(f, e, d, st, kn, label);
      if (e) {
        e.juggleProtect = Math.min(22, (e.juggleProtect || 0) + (Math.abs(kn || 0) >= 12 ? 6 : 3));
        e.subWindow = e.sub > 0 ? 12 : 0;
      }
    };

    const baseSub = window.sub;
    if (baseSub) {
      window.sub = function (f) {
        ensure(f);
        if (f.sub <= 0) return;
        f.subWindow = 20;
        return baseSub(f);
      };
    }

    window.BIBLE_FIGHTER_COMBAT_FRAMES_READY = true;
    window.BIBLE_FIGHTER_COMBAT_FRAMES = () => ({
      p1: { phase: A?.movePhase, timer: A?.moveTimer, kind: A?.moveKind, cancel: A?.cancelUntil },
      p2: { phase: B?.movePhase, timer: B?.moveTimer, kind: B?.moveKind, cancel: B?.cancelUntil }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
