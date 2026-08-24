(() => {
  'use strict';

  const boot = () => {
    if (!window.skill1 || !window.skill2 || !window.sub || !window.hit || !window.update) return;

    const baseSkill1 = window.skill1;
    const baseSkill2 = window.skill2;
    const baseSub = window.sub;
    const baseHit = window.hit;
    const baseUpdate = window.update;

    S.juggleFx = S.juggleFx || [];
    S.davidSkill = S.davidSkill || {};
    S.subNotice = S.subNotice || {};

    const resetFighter = (f) => {
      if (!f) return;
      f.skillCtx = null;
      f.juggleCount = 0;
      f.juggleGrace = 0;
      f.airborneTime = 0;
      f.subState = 'ready';
      f.subLock = 0;
      f.stall = 0;
    };

    const clearSkill = (f) => {
      if (!f) return;
      f.skillCtx = null;
      f.skillBusy = 0;
      f.lock = Math.min(f.lock || 0, 1);
    };

    const beginSkill = (f, which) => {
      if (!S.run || !f || f.st > 0 || f.skillBusy > 0) return false;
      const cd = which === 1 ? f.cd1 : f.cd2;
      if (cd > 0) return false;
      // Build 13 cancel support: skill can start during the final recovery window of 5A.
      if (f.attackCtx && f.attackCtx.phase === 'recovery' && f.attackCtx.timer <= 7) {
        f.attackCtx = null;
        f.bufferedAttack = 0;
        f.atk = 0;
        f.lock = 0;
      } else if (f.attackCtx) {
        return false;
      }
      f.skillBusy = 1;
      const data = which === 1
        ? { startup: f.id === 'david' ? 7 : 5, active: 3, recovery: f.id === 'david' ? 18 : 12 }
        : { startup: f.id === 'david' ? 6 : 6, active: 4, recovery: f.id === 'david' ? 20 : 14 };
      f.skillCtx = { which, phase: 'startup', timer: data.startup, data, fired: false };
      f.lock = data.startup + data.active + data.recovery;
      f.stall = data.startup;
      return true;
    };

    const fireSkill = (f, which) => {
      const e = opp(f);
      if (f.id === 'david') {
        if (which === 1) {
          const aimUp = Q[f.slot === 'p1' ? 'w' : 'arrowup'];
          const q = {
            o: f,
            x: f.x + 21 + f.f * 22,
            y: f.y + (aimUp ? 9 : 28),
            v: f.f * 17,
            vy: aimUp ? -2.4 : 0,
            l: 54,
            k: 'davidStone',
            d: 25
          };
          S.shots.push(q);
          txt(f.x + 21, f.y - 18, '投石索', 'skill');
          burst(f.x + 21 + f.f * 18, f.y + 26, 8, '#e4c37f', 2.2);
          ring(f.x + f.f * 34 + 21, f.y + 28, 24, '#d4b66f');
        } else {
          const grounded = f.on;
          f.inv = 15;
          f.vx = f.f * 13.5;
          f.vy = grounded ? -5.2 : -2.0;
          f.airborneTime = 0;
          txt(f.x + 21, f.y - 18, '牧者跃步', 'skill');
          burst(f.x + 21 - f.f * 8, f.y + 52, 12, '#c7ad71', 3.2);
          const delay = 7;
          setTimeout(() => {
            if (!S.run || !f) return;
            const box = hb(
              f.f > 0 ? f.x + 26 : f.x - 94,
              f.y - 10,
              94,
              94
            );
            if (e && ov(box, hb(e.x, e.y, e.w, e.h))) {
              hit(f, e, 20 * f.pw, 19, 14, '牧者跃步');
            }
          }, delay * 16);
        }
        return;
      }

      if (which === 1) baseSkill1(f);
      else baseSkill2(f);
    };

    const tickSkill = (f) => {
      const c = f.skillCtx;
      if (!c || !S.run || S.paused) return;
      c.timer -= 1;
      if (c.timer <= 0) {
        if (c.phase === 'startup') {
          c.phase = 'active';
          c.timer = c.data.active;
          f.stall = c.timer;
          if (!c.fired) {
            c.fired = true;
            fireSkill(f, c.which);
          }
        } else if (c.phase === 'active') {
          c.phase = 'recovery';
          c.timer = c.data.recovery;
        } else {
          clearSkill(f);
        }
      }
    };

    window.skill1 = (f) => {
      if (beginSkill(f, 1)) return;
      if (f && f.id !== 'david' && !f.skillBusy && (!f.attackCtx || (f.attackCtx.phase === 'recovery' && f.attackCtx.timer <= 7))) {
        baseSkill1(f);
      }
    };

    window.skill2 = (f) => {
      if (beginSkill(f, 2)) return;
      if (f && f.id !== 'david' && !f.skillBusy && (!f.attackCtx || (f.attackCtx.phase === 'recovery' && f.attackCtx.timer <= 7))) {
        baseSkill2(f);
      }
    };

    const strategicSub = (f) => {
      if (!S.run || !f || f.sub <= 0 || f.subLock > 0) return false;
      // Substitution is now an escape mechanic, not a free neutral teleport.
      const valid = f.st > 0 || (!f.on && f.airborneTime > 5);
      if (!valid) return false;
      const oldX = f.x;
      f.sub -= 1;
      f.subLock = 54;
      f.inv = 42;
      f.st = 0;
      f.attackCtx = null;
      f.skillCtx = null;
      f.skillBusy = 0;
      f.juggleCount = 0;
      f.juggleGrace = 22;
      const escape = f.on ? 132 : 112;
      f.x = cl(f.x - f.f * escape, 40, W - f.w - 40);
      f.vx = -f.f * 5;
      f.vy = -2.8;
      burst(oldX + 21, f.y + 34, 20, '#ded0b7', 4.2);
      ring(f.x + 21, f.y + 34, 34, '#e6d7b5');
      txt(f.x + 21, f.y - 18, '替身脱离', 'support');
      say('SUBSTITUTION');
      return true;
    };

    window.sub = strategicSub;

    // Capture the original key dispatcher so the strategic substitution wins over the old neutral teleport.
    document.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k !== 'i' && k !== '4') return;
      const f = k === 'i' ? A : B;
      if (!f) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      strategicSub(f);
    }, true);

    document.addEventListener('pointerdown', (e) => {
      const button = e.target.closest('[data-action]');
      if (!button) return;
      const parts = button.dataset.action.split('-');
      const action = parts[1];
      if (action !== 'sub') return;
      const f = parts[0] === 'p1' ? A : B;
      if (!f) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      strategicSub(f);
    }, true);

    window.hit = (f, e, d, st, kn, label) => {
      if (!e || e.juggleGrace > 0) return;
      const wasAir = !e.on && e.y + e.h < G - 1;
      const before = e.hp;
      baseHit(f, e, d, st, kn, label);
      if (e.hp >= before) return;

      e.juggleGrace = 2;
      if (wasAir) {
        e.juggleCount = (e.juggleCount || 0) + 1;
        e.airborneTime = Math.max(e.airborneTime || 0, 1);
      }

      // Escalating juggle protection. Long air strings automatically drop the victim.
      if (e.juggleCount >= 6) {
        e.juggleCount = 0;
        e.st = 0;
        e.vy = Math.max(1.6, e.vy * 0.15);
        e.vx *= 0.35;
        e.protect = 18;
        e.inv = Math.max(e.inv || 0, 10);
        ring(e.x + 21, e.y + 32, 40, '#b8c9de');
        txt(e.x + 21, e.y - 28, '浮空保护', 'support');
        burst(e.x + 21, e.y + 34, 16, '#b8c9de', 3.3);
      }
    };

    window.update = (f, dt) => {
      baseUpdate(f, dt);
      if (!f) return;
      f.subLock = Math.max(0, (f.subLock || 0) - dt);
      f.juggleGrace = Math.max(0, (f.juggleGrace || 0) - dt);
      f.protect = Math.max(0, (f.protect || 0) - dt);
      if (!f.on) f.airborneTime = (f.airborneTime || 0) + dt;
      else {
        f.airborneTime = 0;
        if (f.juggleCount && f.st <= 0) f.juggleCount = 0;
      }
      if (f.skillCtx) tickSkill(f);
      if (f.skillCtx && f.st > 0) clearSkill(f);
    };

    // Make the existing projectile loop understand David's upward stone path.
    const oldShots = window.shots;
    if (typeof oldShots === 'function') {
      window.shots = (dt) => {
        oldShots(dt);
        for (const q of S.shots) {
          if (q.k !== 'davidStone' || !q.l) continue;
          q.vy += 0.12 * dt;
        }
      };
    }

    const originalDrawFx = window.drawFx;
    window.drawFx = () => {
      originalDrawFx();
      // Air-state readability + David slingshot accent.
      const drawAir = (f) => {
        if (!f || f.on || f.airborneTime < 1) return;
        X.save();
        X.globalAlpha = 0.22;
        X.strokeStyle = f.id === 'david' ? '#e3c078' : '#b7c2cf';
        X.setLineDash([3, 5]);
        X.beginPath();
        X.arc(f.x + 21, f.y + 34, 27, 0, Math.PI * 2);
        X.stroke();
        X.setLineDash([]);
        X.restore();
      };
      drawAir(A);
      drawAir(B);
    };

    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'f4') {
        e.preventDefault();
        const a = A && A.id === 'david';
        const b = B && B.id === 'david';
        if (a || b) say('DAVID · SHEPHERD COMBAT');
      }
    });

    const oldRoundInit = window.roundInit;
    if (oldRoundInit) {
      window.roundInit = () => {
        oldRoundInit();
        resetFighter(A);
        resetFighter(B);
      };
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
