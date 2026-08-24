(() => {
  'use strict';

  const boot = () => {
    if (!window.attack || !window.skill1 || !window.skill2 || !window.update) return;

    const baseAttack = window.attack;
    const baseSkill1 = window.skill1;
    const baseSkill2 = window.skill2;
    const baseUpdate = window.update;
    const baseDrawFx = window.drawFx;

    S.david = S.david || { aim: 0, charge: 0, shotFlash: 0, finisher: 0 };

    const isDavid = (f) => f && f.id === 'david';
    const heldUp = (f) => !!Q[f.slot === 'p1' ? 'w' : 'arrowup'];

    // David gets a distinct aerial normal: a downward shepherd strike that bounces
    // an opponent slightly, enabling a controlled follow-up instead of infinite loops.
    const davidAirAttack = (f) => {
      if (!S.run || !isDavid(f) || f.st > 0) return false;
      if (f.attackCtx) { f.bufferedAttack = 1; return true; }
      const data = { startup: 5, active: 5, recovery: 10, range: 62, damage: 7, knock: 6 };
      f.step = 1;
      f.attackCtx = { step: 1, phase: 'startup', timer: data.startup, data, didHit: false, air: true };
      f.lock = data.startup + data.active + data.recovery;
      f.atk = 16;
      f.vy += 0.4;
      S.david.finisher = 0;
      f.airAtk = true;
      return true;
    };

    const baseAttackFrames = {
      1:{startup:5,active:4,recovery:8,range:55,damage:6,knock:7,launch:-1.6},
      2:{startup:5,active:4,recovery:8,range:58,damage:7,knock:7,launch:-1.7},
      3:{startup:6,active:4,recovery:9,range:62,damage:9,knock:8,launch:-1.9},
      4:{startup:7,active:4,recovery:10,range:70,damage:11,knock:10,launch:-2.2},
      5:{startup:8,active:5,recovery:15,range:82,damage:14,knock:16,launch:-4.2}
    };

    // Wrapper keeps the global frame combat while giving David a distinct grounded kit.
    window.attack = (f) => {
      if (isDavid(f) && f.y + f.h < G - 2) return davidAirAttack(f);
      baseAttack(f);
      if (isDavid(f) && f.step === 5) S.david.finisher = 1;
    };

    // David's slingshot is manually timed: charge -> fire -> recovery.
    window.skill1 = (f) => {
      if (!isDavid(f)) return baseSkill1(f);
      if (!S.run || f.st > 0 || f.cdS > 0 || f.skillCtx) return;
      const up = heldUp(f);
      f.cdS = 34;
      f.skillCtx = { which:1, phase:'startup', timer:7, data:{startup:7,active:3,recovery:16}, fired:false, up };
      f.skillBusy = 1;
      f.lock = 26;
      f.vx *= 0.28;
      S.david.charge = 10;
      txt(f.x + 21, f.y - 18, up ? '抬手瞄准' : '投石索', 'skill');
      return;
    };

    // David's second skill is the signature shepherd leap: invulnerable startup,
    // aerial chase, and a distinct wall-bounce style knockback.
    window.skill2 = (f) => {
      if (!isDavid(f)) return baseSkill2(f);
      if (!S.run || f.st > 0 || f.cd2 > 0 || f.skillCtx) return;
      f.cd2 = 58;
      f.skillCtx = { which:2, phase:'startup', timer:6, data:{startup:6,active:5,recovery:18}, fired:false };
      f.skillBusy = 1;
      f.lock = 29;
      f.inv = 12;
      txt(f.x + 21, f.y - 18, '牧者跃步', 'skill');
      burst(f.x + 21 - f.f * 10, f.y + 48, 10, '#c7ad71', 3);
    };

    const fireDavid = (f, which) => {
      const e = opp(f);
      if (which === 1) {
        const up = !!f.skillCtx?.up;
        S.shots.push({
          o:f,
          x:f.x+21+f.f*20,
          y:f.y+(up?8:25),
          v:f.f*(up?15.5:18),
          vy:up?-3.1:0,
          l:60,
          k:'davidStone',
          d:up?28:25
        });
        S.david.shotFlash = 5;
        S.david.aim = up ? -1 : 0;
        burst(f.x+21+f.f*18,f.y+25,12,'#e8c87c',2.4);
        ring(f.x+f.f*36+21,f.y+25,22,'#d9bb73');
      } else {
        f.vx = f.f * 13.5;
        f.vy = f.on ? -5.6 : -2.2;
        f.inv = Math.max(f.inv, 18);
        f.airborneTime = 0;
        S.david.finisher = 0;
        burst(f.x+21-f.f*8,f.y+52,16,'#c7ad71',3.6);
      }
    };

    const tickDavidSkill = (f) => {
      const c = f.skillCtx;
      if (!c || !isDavid(f) || !S.run || S.paused) return;
      c.timer -= 1;
      if (c.timer <= 0) {
        if (c.phase === 'startup') {
          c.phase = 'active';
          c.timer = c.data.active;
          if (!c.fired) {
            c.fired = true;
            fireDavid(f, c.which);
          }
        } else if (c.phase === 'active') {
          c.phase = 'recovery';
          c.timer = c.data.recovery;
        } else {
          f.skillCtx = null;
          f.skillBusy = 0;
          f.lock = 0;
          f.inv = Math.min(f.inv || 0, 2);
        }
      }
    };

    window.update = (f, dt) => {
      baseUpdate(f, dt);
      if (!f) return;
      if (isDavid(f) && f.skillCtx) tickDavidSkill(f);
      if (f.airAtk && f.attackCtx && f.attackCtx.phase === 'active') {
        const e = opp(f);
        const b = hb(f.f>0?f.x+f.w-2:f.x-62+2, f.y+12, 62, 58);
        if (e && !e.inv && ov(b, hb(e.x,e.y,e.w,e.h)) && !f.attackCtx.didHit) {
          f.attackCtx.didHit = true;
          hit(f, e, 8*f.pw, 12, 7, '空中牧者击');
          e.vy = -3.0;
          e.juggleGrace = 2;
        }
      }
      if (f.attackCtx && f.airAtk && f.attackCtx.phase === 'recovery' && f.attackCtx.timer <= 0) {
        f.airAtk = false;
      }
    };

    const baseClean = window.clean;
    window.clean = () => {
      baseClean();
      S.david = { aim:0, charge:0, shotFlash:0, finisher:0 };
    };

    window.drawFx = () => {
      baseDrawFx();
      if (S.david.charge > 0) {
        const f = (A && A.id === 'david') ? A : (B && B.id === 'david' ? B : null);
        if (f) {
          X.save();
          X.globalAlpha = 0.75;
          X.strokeStyle = '#e7c77f';
          X.lineWidth = 2;
          const cx = f.x + 21 + f.f * 18;
          const cy = f.y + 25;
          X.beginPath();
          X.moveTo(cx - f.f * 12, cy);
          X.lineTo(cx + f.f * 16, cy - (heldUp(f) ? 8 : 0));
          X.stroke();
          X.restore();
          S.david.charge = Math.max(0, S.david.charge - 1);
        }
      }
      if (S.david.shotFlash > 0) {
        const f = (A && A.id === 'david') ? A : (B && B.id === 'david' ? B : null);
        if (f) {
          X.save();
          X.globalAlpha = S.david.shotFlash / 5;
          X.fillStyle = '#fff0b0';
          X.fillRect(f.x + (f.f > 0 ? f.w : -12), f.y + 22, 12, 4);
          X.restore();
        }
        S.david.shotFlash -= 1;
      }
    };
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
