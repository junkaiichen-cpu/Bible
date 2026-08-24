(() => {
  'use strict';

  // Build 11 combat-feel layer.
  // This file deliberately sits on top of the original Build 10 engine so the
  // character/gameplay data stays reusable while presentation + hit response
  // can iterate quickly.
  const boot = () => {
    const baseUpdate = window.update;
    const baseHit = window.hit;
    const baseClean = window.clean;
    const baseDrawFx = window.drawFx;
    const baseArena = window.arena;
    const $ = window.$;
    if (!baseUpdate || !baseHit || !baseClean || !baseDrawFx || !baseArena) return;

    S.hitstop = 0;
    S.flash = 0;
    S.impact = [];
    S.after = [];
    S.time = 0;
    S.cameraPulse = 0;

    const wrap = document.querySelector('.game-wrap');
    if (wrap && !document.querySelector('.combat-flash')) {
      const flash = document.createElement('div');
      flash.className = 'combat-flash';
      flash.setAttribute('aria-hidden', 'true');
      wrap.appendChild(flash);
    }

    const pushImpact = (x, y, power, tint) => {
      S.impact.push({ x, y, power, tint, life: 10 + power * 2 });
    };

    window.clean = function () {
      baseClean();
      S.impact.length = 0;
      S.after.length = 0;
      S.hitstop = 0;
      S.flash = 0;
      S.cameraPulse = 0;
    };

    window.hit = function (f, e, d, st, kn, label) {
      const before = e.hp;
      baseHit(f, e, d, st, kn, label);
      if (e.hp < before) {
        const heavy = d >= 25 || /奥义|歌利亚|红海|迦密|推柱/.test(label || '');
        S.hitstop = Math.max(S.hitstop, heavy ? 7 : 4);
        S.flash = Math.max(S.flash, heavy ? 0.34 : 0.16);
        S.cameraPulse = Math.max(S.cameraPulse, heavy ? 10 : 5);
        pushImpact(e.x + e.w / 2, e.y + e.h * 0.48, heavy ? 4 : 2.2, heavy ? '#f8d58b' : f.color);
        if (Math.abs(kn) >= 18) {
          for (let i = 0; i < 3; i++) S.after.push({
            id: e.id, x: e.x - f.f * (i + 1) * 5, y: e.y,
            f: e.f || e.face || 1, color: e.color || e.c,
            life: 7 - i * 2, alpha: 0.16 - i * 0.035
          });
        }
      }
    };

    window.update = function (f, dt) {
      if (S.hitstop > 0) {
        if (f.slot === 'p1') S.hitstop--;
        return;
      }
      baseUpdate(f, dt);
      S.time += (f.slot === 'p1' ? dt : 0);
      if (f.vx && Math.abs(f.vx) > 8 && S.run) {
        S.after.push({ id: f.id, x: f.x, y: f.y, f: f.f, color: f.color, life: 5, alpha: 0.12 });
      }
    };

    const pixelFighter = (f, alpha = 1, ghost = false) => {
      const x = f.x + 21;
      const y = f.y + 68;
      const face = f.f || 1;
      const moving = Math.min(1, Math.abs(f.vx || 0) / 10);
      const airborne = f.y + f.h < G - 1;
      const attackFrame = f.atk > 0;
      const recoil = f.st > 0 ? Math.min(7, f.st * 0.22) : 0;
      const stride = Math.round(Math.sin(S.time * 0.35) * 3 * moving);
      const skin = '#d7b08b';
      const dark = '#17130f';
      const cloth = f.color || f.c || '#b89a6a';
      const light = '#f1d6a2';

      X.save();
      X.globalAlpha = alpha;
      X.translate(x, y);
      X.scale(face, 1);

      if (!ghost) {
        X.fillStyle = '#0008';
        X.beginPath();
        X.ellipse(0, 2, 25 + moving * 7, 6, 0, 0, Math.PI * 2);
        X.fill();
      }

      // Legs / body silhouette.
      X.fillStyle = dark;
      X.fillRect(-9 - stride, -22 + recoil, 8, 22);
      X.fillRect(2 + stride, -22 - recoil, 8, 22);
      X.fillStyle = cloth;
      X.fillRect(-15, -57, 30, 35);
      X.fillStyle = '#0003';
      X.fillRect(-15, -40, 30, 18);

      // Torso pixel highlights.
      X.fillStyle = light;
      X.fillRect(-11, -52, 7, 3);
      X.fillStyle = '#ffffff22';
      X.fillRect(-12, -48, 10, 2);

      // Head.
      X.fillStyle = skin;
      X.fillRect(-12, -79, 24, 22);
      X.fillRect(-9, -84, 18, 5);
      X.fillStyle = dark;
      X.fillRect(-15, -86, 30, 8);
      X.fillRect(face > 0 ? 6 : -11, -77, 4, 3);

      // Character silhouettes.
      if (f.id === 'david') {
        X.fillStyle = '#40372e';
        X.fillRect(-17, -66, 5, 21);
        X.fillStyle = '#c8a362';
        X.fillRect(face * 14, -53, 22, 2);
        if (attackFrame) {
          X.strokeStyle = '#e8c16f'; X.lineWidth = 2;
          X.beginPath(); X.arc(21, -49, 18, -0.8, 0.8); X.stroke();
        }
      } else if (f.id === 'moses') {
        X.fillStyle = '#8d7250'; X.fillRect(-18, -64, 6, 42);
        X.fillStyle = '#f2e4bf'; X.fillRect(4, -67, 5, 3);
      } else if (f.id === 'samson') {
        X.fillStyle = '#2b211b';
        X.fillRect(-22, -87, 44, 7);
        X.fillRect(-19, -80, 6, 18); X.fillRect(13, -80, 6, 18);
        X.fillStyle = '#a78254'; X.fillRect(face * 12, -46, 27, 7);
      } else if (f.id === 'daniel') {
        X.fillStyle = '#1c2831'; X.fillRect(-16, -73, 7, 20);
        X.fillStyle = '#d9d0bb'; X.fillRect(-4, -64, 8, 18);
      } else if (f.id === 'elijah') {
        X.fillStyle = '#5a3429'; X.fillRect(-15, -70, 30, 8);
        X.fillStyle = '#f5b56a'; X.fillRect(face * 12, -48, 14, 4);
        X.fillStyle = '#f5d37f'; X.fillRect(face * 16, -53, 6, 2);
      } else if (f.id === 'paul') {
        X.fillStyle = '#2c3b2b'; X.fillRect(-15, -67, 30, 5);
        X.fillStyle = '#ddcfad'; X.fillRect(face * 16, -53, 18, 3);
      }

      // Stronger stance / attack extension.
      if (attackFrame) {
        X.fillStyle = light;
        const arm = 18 + Math.min(25, f.step * 4);
        X.fillRect(face * 10, -49, face * arm, 4);
        if (f.step >= 4) {
          X.strokeStyle = '#f4db9c'; X.lineWidth = 2;
          X.beginPath(); X.arc(face * 24, -45, 15 + f.step, -0.75, 0.75); X.stroke();
        }
      }
      if (airborne) {
        X.fillStyle = '#d9be8d55';
        X.fillRect(-15, 4, 8, 3); X.fillRect(7, 8, 10, 3);
      }
      X.restore();
    };

    window.draw = function (f) {
      if (!f) return;
      if (f.inv > 0 && Math.floor(f.inv / 2) % 2 === 0) return;
      const speed = Math.abs(f.vx || 0);
      if (speed > 8) {
        for (let i = 3; i >= 1; i--) pixelFighter(f, 0.07 + (3 - i) * 0.025, true);
      }
      pixelFighter(f, 1, false);
      if (f.armor > 0) {
        X.save();
        X.globalAlpha = 0.72 + Math.sin(S.time * 0.7) * 0.18;
        X.strokeStyle = '#fff0b0'; X.lineWidth = 2;
        X.beginPath(); X.arc(f.x + 21, f.y + 31, 42, 0, Math.PI * 2); X.stroke();
        X.restore();
      }
    };

    window.arena = function () {
      baseArena();
      // Layered pixel stage dressing, keeping the original palette and floor.
      const p = (S.time * 0.08) % 160;
      X.save();
      X.globalAlpha = 0.22;
      X.fillStyle = '#d9c58e';
      for (let i = -1; i < 9; i++) {
        X.fillRect(i * 150 - p, G - 78 - (i % 3) * 7, 70, 3);
        X.fillRect(i * 150 + 28 - p, G - 54 - (i % 2) * 11, 42, 2);
      }
      X.globalAlpha = 1;
      X.fillStyle = '#2a2118';
      X.fillRect(66, G - 33, 3, 27); X.fillRect(W - 69, G - 33, 3, 27);
      X.fillStyle = '#c9ad73';
      X.fillRect(61, G - 37, 13, 4); X.fillRect(W - 74, G - 37, 13, 4);
      X.restore();
    };

    window.drawFx = function () {
      baseDrawFx();
      X.save();
      // Projectile trails and stronger impact geometry.
      for (const q of S.shots) {
        const len = Math.max(10, Math.min(32, Math.abs(q.v || 0) * 2.2));
        const hot = q.k === 'fire' || q.k === 'scrollFire' || q.k === 'helperFire' || q.k === 'fire1' || q.k === 'fire2';
        X.globalAlpha = 0.5;
        X.strokeStyle = hot ? '#f0a75d' : '#e8d3a5';
        X.lineWidth = hot ? 3 : 2;
        X.beginPath(); X.moveTo(q.x - Math.sign(q.v || 1) * len, q.y); X.lineTo(q.x, q.y); X.stroke();
        X.globalAlpha = 1;
        X.fillStyle = hot ? '#ffd27a' : '#f2dfbd';
        X.fillRect(q.x - 4, q.y - 2, 8, 4);
      }
      for (const a of S.after) {
        pixelFighter({ ...A, id: a.id, x: a.x, y: a.y, f: a.f, color: a.color, c: a.color, atk: 0, st: 0, armor: 0 }, a.alpha, true);
        a.life -= 1;
      }
      S.after = S.after.filter(a => a.life > 0);

      for (const i of S.impact) {
        const t = Math.max(0, i.life / (10 + i.power * 2));
        X.globalAlpha = t;
        X.strokeStyle = i.tint;
        X.lineWidth = 2;
        X.beginPath(); X.arc(i.x, i.y, 8 + (1 - t) * i.power * 9, 0, Math.PI * 2); X.stroke();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI * 2 * k) / 6 + i.life * 0.08;
          X.beginPath();
          X.moveTo(i.x + Math.cos(a) * 4, i.y + Math.sin(a) * 4);
          X.lineTo(i.x + Math.cos(a) * (13 + i.power * 2), i.y + Math.sin(a) * (13 + i.power * 2));
          X.stroke();
        }
        i.life -= 1;
      }
      S.impact = S.impact.filter(i => i.life > 0);
      X.restore();

      const flash = document.querySelector('.combat-flash');
      if (flash) {
        const alpha = Math.max(0, S.flash || 0);
        flash.style.opacity = alpha.toFixed(3);
        if (S.flash > 0) S.flash = Math.max(0, S.flash - 0.035);
      }
    };
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
