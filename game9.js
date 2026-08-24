(() => {
  'use strict';

  const boot = () => {
    if (!window.attack || !window.hit) return;

    S.attackFrame = 0;
    S.attackDebug = false;
    S.comboScale = true;

    const baseHit = window.hit;

    const attackFrames = {
      1: { startup: 5, active: 4, recovery: 8, range: 55, damage: 6, knock: 7, launch: -2.0 },
      2: { startup: 5, active: 4, recovery: 8, range: 58, damage: 7, knock: 7, launch: -2.0 },
      3: { startup: 6, active: 4, recovery: 9, range: 62, damage: 9, knock: 8, launch: -2.2 },
      4: { startup: 7, active: 4, recovery: 10, range: 70, damage: 11, knock: 10, launch: -2.5 },
      5: { startup: 8, active: 5, recovery: 15, range: 82, damage: 14, knock: 16, launch: -4.2 }
    };

    const attackBox = (f, data) => {
      const x = f.f > 0 ? f.x + f.w - 2 : f.x - data.range + 2;
      return hb(x, f.y + (f.on ? 4 : 8), data.range, f.on ? 62 : 58);
    };

    const finishAttack = (f) => {
      f.attackCtx = null;
      f.atk = 0;
      f.lock = 0;
      if (f.bufferedAttack) {
        f.bufferedAttack = 0;
        window.attack(f);
      }
    };

    const tickAttack = (f) => {
      const a = f.attackCtx;
      if (!a || S.paused || !S.run) return;
      a.timer -= 1;
      const data = a.data;

      if (a.timer <= 0) {
        if (a.phase === 'startup') {
          a.phase = 'active';
          a.timer = data.active;
          a.didHit = false;
          f.atk = 12;
        } else if (a.phase === 'active') {
          a.phase = 'recovery';
          a.timer = data.recovery;
          f.atk = 8;
        } else {
          finishAttack(f);
          return;
        }
      }

      f.vx *= 0.82;
      if (a.phase === 'active' && !a.didHit) {
        const e = opp(f);
        const b = attackBox(f, data);
        if (e && ov(b, hb(e.x, e.y, e.w, e.h))) {
          a.didHit = true;
          const scaled = S.comboScale && f.combo > 4
            ? data.damage * f.pw * Math.max(0.58, 1 - (f.combo - 4) * 0.035)
            : data.damage * f.pw;
          baseHit(f, e, scaled, a.step === 5 ? 16 : 8, data.knock, a.step === 5 ? '重击' : '普攻');
          e.vy = data.launch;
        }
      }
    };

    window.attack = function (f) {
      if (!S.run || !f || f.st > 0) return;
      if (f.attackCtx) {
        f.bufferedAttack = 1;
        return;
      }
      const now = performance.now();
      if (now - (f.last || 0) > 560) f.step = 0;
      f.last = now;
      f.step = (f.step || 0) % 5 + 1;
      const data = attackFrames[f.step];
      f.lock = data.startup + data.active + data.recovery;
      f.atk = 16;
      f.attackCtx = { step: f.step, phase: 'startup', timer: data.startup, data, didHit: false };
      f.bufferedAttack = 0;
      f.vx *= 0.25;
    };

    // The original Build 10 input dispatcher closes over its own attack() function.
    // Capture attack inputs before that dispatcher so the frame-based attack system is authoritative.
    document.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      const map = {
        j: 'p1',
        '1': 'p2'
      };
      if (map[k]) {
        const f = map[k] === 'p1' ? A : B;
        if (f) {
          e.preventDefault();
          e.stopImmediatePropagation();
          window.attack(f);
        }
      }
    }, true);

    document.addEventListener('pointerdown', (e) => {
      const button = e.target.closest('[data-action]');
      if (!button) return;
      const [slot, action] = button.dataset.action.split('-');
      if (action !== 'attack') return;
      const f = slot === 'p1' ? A : B;
      if (f) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.attack(f);
      }
    }, true);

    const frameLoop = () => {
      if (!S.paused && S.run && A && B) {
        S.attackFrame += 1;
        tickAttack(A);
        tickAttack(B);
      }
      requestAnimationFrame(frameLoop);
    };

    const originalDrawFx = window.drawFx;
    window.drawFx = function () {
      originalDrawFx();
      if (!S.attackDebug || !A || !B) return;
      X.save();
      X.globalAlpha = 0.55;
      const drawBox = (f) => {
        if (!f.attackCtx || f.attackCtx.phase !== 'active') return;
        const b = attackBox(f, f.attackCtx.data);
        X.strokeStyle = '#ff5757';
        X.lineWidth = 2;
        X.strokeRect(b.x, b.y, b.w, b.h);
        X.fillStyle = '#ff575722';
        X.fillRect(b.x, b.y, b.w, b.h);
      };
      drawBox(A);
      drawBox(B);
      X.fillStyle = '#fff0b0';
      X.font = '10px monospace';
      if (A.attackCtx) X.fillText(`P1 A${A.attackCtx.step} ${A.attackCtx.phase} ${A.attackCtx.timer}`, 18, 500);
      X.textAlign = 'right';
      if (B.attackCtx) X.fillText(`P2 A${B.attackCtx.step} ${B.attackCtx.phase} ${B.attackCtx.timer}`, W - 18, 500);
      X.textAlign = 'left';
      X.restore();
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'F3') {
        e.preventDefault();
        S.attackDebug = !S.attackDebug;
      }
      if (e.key === 'Escape' && S.run) {
        e.preventDefault();
        S.paused = !S.paused;
        const m = document.querySelector('#centerMessage');
        if (m) {
          m.textContent = S.paused ? 'PAUSED · ESC 继续' : 'RESUME';
          m.classList.remove('show');
          void m.offsetWidth;
          m.classList.add('show');
        }
      }
    });

    frameLoop();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
