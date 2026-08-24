(() => {
  'use strict';

  const boot = () => {
    if (!window.drawFx || !window.update || !window.hit) return;

    const baseDrawFx = window.drawFx;
    const baseUpdate = window.update;
    const baseHit = window.hit;

    S.davidImpact = S.davidImpact || {
      timer: 0,
      shake: 0,
      flash: 0,
      hitBursts: [],
      lowHpPulse: 0,
      valleyEcho: 0
    };

    const isDavid = (f) => f?.id === 'david';
    const impact = () => S.davidImpact;

    const spawnBurst = (x, y, strength = 1) => {
      for (let i = 0; i < 10 + Math.round(8 * strength); i++) {
        impact().hitBursts.push({
          x,
          y,
          vx: (Math.random() - .5) * 4.8 * strength,
          vy: (Math.random() - .75) * 4.2 * strength,
          life: 14 + Math.random() * 10,
          size: 1 + Math.random() * 3
        });
      }
    };

    window.hit = (attacker, defender, damage, stun, knock, label) => {
      const wasDavid = isDavid(attacker);
      const oldHp = defender?.hp ?? 0;
      baseHit(attacker, defender, damage, stun, knock, label);
      if (!wasDavid || !defender) return;

      const dealt = Math.max(0, oldHp - (defender.hp ?? oldHp));
      const heavy = /歌利亚|重击|石/.test(String(label || '')) || dealt >= 12;
      impact().timer = heavy ? 12 : 7;
      impact().shake = heavy ? 8 : 4;
      impact().flash = heavy ? 6 : 3;
      impact().valleyEcho = heavy ? 24 : 10;
      spawnBurst((defender.x || 0) + (defender.w || 42) * .5, (defender.y || 0) + (defender.h || 72) * .42, heavy ? 1.5 : 1);
      if (typeof S.shake === 'number') S.shake = Math.max(S.shake, heavy ? 8 : 4);
    };

    window.update = (f, dt) => {
      baseUpdate(f, dt);
      const fx = impact();
      if (f?.slot === 'p1') {
        fx.timer = Math.max(0, fx.timer - 1);
        fx.shake = Math.max(0, fx.shake - 1);
        fx.flash = Math.max(0, fx.flash - 1);
        fx.valleyEcho = Math.max(0, fx.valleyEcho - 1);
      }
      if (f && isDavid(f) && typeof f.hp === 'number' && typeof f.maxHp === 'number') {
        fx.lowHpPulse = Math.max(0, fx.lowHpPulse - 1);
        if (f.hp / Math.max(1, f.maxHp) <= .25 && fx.lowHpPulse === 0) {
          fx.lowHpPulse = 12;
          if (typeof txt === 'function') txt(f.x + 21, f.y - 22, '守住阵线', 'skill');
        }
      }
    };

    window.drawFx = () => {
      baseDrawFx();
      const fx = impact();
      if ((fx.flash || fx.timer || fx.hitBursts.length) <= 0) return;

      X.save();

      if (fx.flash > 0) {
        X.globalAlpha = fx.flash / 6 * .12;
        X.fillStyle = '#f7df9b';
        X.fillRect(0, 0, W, H);
      }

      if (fx.timer > 0) {
        X.globalAlpha = Math.min(.8, fx.timer / 12);
        X.strokeStyle = '#eed18c';
        X.lineWidth = 3;
        const cx = W * .5;
        const cy = G - 95;
        X.beginPath();
        X.arc(cx, cy, 22 + (12 - fx.timer) * 3.5, -Math.PI, 0);
        X.stroke();
      }

      for (const p of fx.hitBursts) {
        X.globalAlpha = Math.max(0, p.life / 24);
        X.fillStyle = p.size > 2.4 ? '#f2cf7f' : '#d3b06d';
        X.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.size), Math.ceil(p.size));
        p.x += p.vx;
        p.y += p.vy;
        p.vy += .12;
        p.life -= 1;
      }
      fx.hitBursts = fx.hitBursts.filter((p) => p.life > 0);

      if (fx.valleyEcho > 0) {
        X.globalAlpha = fx.valleyEcho / 24 * .28;
        X.fillStyle = '#ccb27a';
        X.fillRect(24, G - 30, W - 48, 2);
      }

      X.restore();
    };

    window.BIBLE_FIGHTER_DAVID_IMPACT_READY = true;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
