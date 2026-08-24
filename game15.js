(() => {
  'use strict';

  const boot = () => {
    if (!window.attack || !window.skill1 || !window.skill2 || !window.ult || !window.update || !window.drawFx) return;

    const baseAttack = window.attack;
    const baseSkill1 = window.skill1;
    const baseSkill2 = window.skill2;
    const baseUlt = window.ult;
    const baseUpdate = window.update;
    const baseDrawFx = window.drawFx;

    S.moses = S.moses || { flash: 0, water: null, staff: 0 };
    const isMoses = (f) => f && f.id === 'moses';

    // Moses is deliberately slower and heavier than David: a controller that wins neutral
    // with staff reach and then turns space into a temporary Red Sea hazard.
    window.attack = (f) => {
      if (!isMoses(f) || !S.run || f.st > 0) return baseAttack(f);
      if (f.y + f.h < G - 2) return baseAttack(f);
      baseAttack(f);
      const n = f.step;
      if (n === 2) f.vx += f.f * 0.8;
      if (n === 3) f.vx -= f.f * 0.5;
      if (n === 4) {
        f.vx += f.f * 1.1;
        txt(f.x + 21, f.y - 26, '杖势', 'skill');
      }
      if (n === 5) {
        f.vx += f.f * 2.0;
        f.inv = Math.max(f.inv, 2);
        txt(f.x + 21, f.y - 26, '杖击·终段', 'skill');
      }
    };

    window.skill1 = (f) => {
      if (!isMoses(f)) return baseSkill1(f);
      if (!S.run || f.st > 0 || f.cd1 > 0 || f.skillCtx) return;
      f.cd1 = 30;
      f.skillBusy = 1;
      f.skillCtx = { which: 1, phase: 'startup', timer: 8, data: { startup: 8, active: 4, recovery: 14 }, fired: false };
      f.lock = 26;
      f.vx *= 0.18;
      S.moses.staff = 9;
      txt(f.x + 21, f.y - 18, '杖击', 'skill');
    };

    window.skill2 = (f) => {
      if (!isMoses(f)) return baseSkill2(f);
      if (!S.run || f.st > 0 || f.cd2 > 0 || f.skillCtx) return;
      f.cd2 = 58;
      f.skillBusy = 1;
      f.skillCtx = { which: 2, phase: 'startup', timer: 10, data: { startup: 10, active: 4, recovery: 20 }, fired: false };
      f.lock = 34;
      f.vx *= 0.08;
      S.moses.water = { owner: f, timer: 0, life: 42, side: f.f, radius: 112, hit: false };
      txt(f.x + 21, f.y - 18, '分海', 'skill');
    };

    const fireSkill = (f, which) => {
      const e = opp(f);
      if (which === 1) {
        const r = 92;
        const b = hb(f.f > 0 ? f.x + 20 : f.x - r, f.y - 4, r, 82);
        if (e && ov(b, hb(e.x, e.y, e.w, e.h))) {
          hit(f, e, 17 * f.pw, 15, 13, '杖击');
        }
        burst(f.x + 21 + f.f * 42, f.y + 30, 14, '#9eb2ba', 3.0);
        ring(f.x + 21 + f.f * 55, f.y + 30, 32, '#c7d7dc');
      } else {
        const w = 122;
        const x = f.f > 0 ? f.x + 21 : f.x - w + 21;
        const b = hb(x, f.y - 24, w, 118);
        if (e && ov(b, hb(e.x, e.y, e.w, e.h))) {
          hit(f, e, 20 * f.pw, 18, 16, '分海');
          e.vx += -f.f * 3;
        }
        if (S.moses.water) S.moses.water.timer = 1;
        burst(f.x + 21 + f.f * 58, f.y + 25, 26, '#9ebcc8', 4.5);
      }
    };

    const tickMosesSkill = (f) => {
      const c = f.skillCtx;
      if (!c || !isMoses(f) || !S.run || S.paused) return;
      c.timer -= 1;
      if (c.timer <= 0) {
        if (c.phase === 'startup') {
          c.phase = 'active';
          c.timer = c.data.active;
          if (!c.fired) {
            c.fired = true;
            fireSkill(f, c.which);
          }
        } else if (c.phase === 'active') {
          c.phase = 'recovery';
          c.timer = c.data.recovery;
        } else {
          f.skillCtx = null;
          f.skillBusy = 0;
          f.lock = 0;
        }
      }
    };

    const startMosesUlt = (f) => {
      if (!isMoses(f) || !S.run || f.st > 0 || f.u < 100 || S.mosesCinematic) return false;
      const target = opp(f);
      f.u = 0;
      f.attackCtx = null;
      f.skillCtx = null;
      f.skillBusy = 0;
      f.lock = 999;
      f.inv = 999;
      S.mosesCinematic = { owner: f, target, phase: 0, timer: 28 };
      say('红海');
      return true;
    };

    window.ult = (f) => {
      if (startMosesUlt(f)) return;
      baseUlt(f);
    };

    window.update = (f, dt) => {
      if (S.mosesCinematic) {
        if (S.mosesCinematic.owner === f) return;
        const c = S.mosesCinematic;
        c.timer -= dt;
        if (c.phase === 0 && c.timer <= 0) {
          c.phase = 1;
          c.timer = 18;
          say('摩西举杖');
          S.shake = 4;
        } else if (c.phase === 1 && c.timer <= 0) {
          c.phase = 2;
          c.timer = 20;
          say('水分开了');
          S.shake = 12;
          if (c.target && !c.target.inv) {
            hit(c.owner, c.target, 62 * c.owner.pw, 28, 24, '红海');
            c.target.vy = -4.6;
          }
        } else if (c.phase === 2 && c.timer <= 0) {
          c.phase = 3;
          c.timer = 18;
          say('走过干地');
        } else if (c.phase === 3 && c.timer <= 0) {
          c.owner.lock = 0;
          c.owner.inv = 0;
          S.mosesCinematic = null;
        }
        return;
      }

      baseUpdate(f, dt);
      if (isMoses(f) && f.skillCtx) tickMosesSkill(f);
      if (isMoses(f) && S.moses.water && S.moses.water.owner === f) {
        const w = S.moses.water;
        w.life = Math.max(0, w.life - dt);
        if (w.life <= 0) S.moses.water = null;
      }
    };

    const oldClean = window.clean;
    if (oldClean) {
      window.clean = () => {
        oldClean();
        S.moses = { flash: 0, water: null, staff: 0 };
        S.mosesCinematic = null;
      };
    }

    window.drawFx = () => {
      baseDrawFx();

      if (S.moses.staff > 0) {
        const f = (A && A.id === 'moses') ? A : (B && B.id === 'moses' ? B : null);
        if (f) {
          X.save();
          X.globalAlpha = S.moses.staff / 9;
          X.strokeStyle = '#cedcdf';
          X.lineWidth = 4;
          X.beginPath();
          X.moveTo(f.x + 21, f.y + 12);
          X.lineTo(f.x + 21 + f.f * 48, f.y + 42);
          X.stroke();
          X.restore();
        }
        S.moses.staff -= 1;
      }

      if (S.moses.water) {
        const w = S.moses.water;
        const f = w.owner;
        X.save();
        X.globalAlpha = 0.42;
        const cx = f.x + 21 + f.f * 62;
        X.fillStyle = '#6f9dad';
        X.fillRect(cx - 78, 126, 54, G - 150);
        X.fillRect(cx + 24, 126, 54, G - 150);
        X.globalAlpha = 0.78;
        X.fillStyle = '#b7d7df';
        for (let i = 0; i < 9; i++) {
          const yy = 144 + i * 31;
          X.fillRect(cx - 68, yy, 32, 3);
          X.fillRect(cx + 34, yy + 9, 32, 3);
        }
        X.restore();
      }

      if (S.mosesCinematic) {
        const c = S.mosesCinematic;
        X.save();
        X.fillStyle = '#071014d9';
        X.fillRect(0, 0, W, H);
        X.textAlign = 'center';
        X.fillStyle = '#c4dfe6';
        X.font = '900 28px Georgia, serif';
        const title = c.phase === 0 ? '摩西' : c.phase === 1 ? '举杖' : c.phase === 2 ? '红海分开' : '走过干地';
        X.fillText(title, W / 2, 120);
        X.font = 'bold 12px sans-serif';
        X.fillStyle = '#b5c9ce';
        X.fillText('出埃及记 14 章 · 游戏化演出', W / 2, 146);
        X.fillStyle = '#6b99a7';
        X.fillRect(W / 2 - 220, 220, 130, 120);
        X.fillRect(W / 2 + 90, 220, 130, 120);
        if (c.phase >= 2) {
          X.fillStyle = '#c5a770';
          X.fillRect(W / 2 - 70, 250, 140, 60);
        }
        X.restore();
      }
    };

    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'f6' && ((A && A.id === 'moses') || (B && B.id === 'moses'))) {
        e.preventDefault();
        say('MOSES · CONTROLLER COMBAT');
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
