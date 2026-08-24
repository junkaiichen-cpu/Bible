(() => {
  'use strict';

  const boot = () => {
    if (!window.attack || !window.ult || !window.update || !window.drawFx) return;

    const baseAttack = window.attack;
    const baseUlt = window.ult;
    const baseUpdate = window.update;
    const baseDrawFx = window.drawFx;

    S.davidCinematic = S.davidCinematic || null;

    const david = (f) => f && f.id === 'david';

    const stageFor = (f) => {
      if (!f || !f.attackCtx) return 0;
      return f.attackCtx.step || f.step || 0;
    };

    // Grounded David normals get a tiny identity layer on top of the common frame system:
    // 1 shepherd jab, 2 backhand, 3 low sweep, 4 sling feint, 5 committed finisher.
    window.attack = (f) => {
      if (!david(f) || !S.run || f.st > 0) return baseAttack(f);
      if (f.y + f.h < G - 2) return baseAttack(f);
      baseAttack(f);
      const n = f.step;
      if (n === 4) {
        f.vx += f.f * 1.8;
        txt(f.x + 21, f.y - 28, '牧者变步', 'skill');
      }
      if (n === 5) {
        f.vx += f.f * 2.8;
        f.inv = Math.max(f.inv, 3);
        txt(f.x + 21, f.y - 28, '终段·重击', 'skill');
      }
    };

    const startDavidUlt = (f) => {
      if (!david(f) || !S.run || f.st > 0 || f.u < 100 || S.davidCinematic) return false;
      f.u = 0;
      f.skillCtx = null;
      f.skillBusy = 0;
      f.attackCtx = null;
      f.bufferedAttack = 0;
      f.lock = 999;
      f.inv = 999;
      f.st = 0;
      S.davidCinematic = { owner: f, phase: 0, timer: 34, target: opp(f), done: false };
      say('歌利亚之战');
      S.shake = 0;
      return true;
    };

    window.ult = (f) => {
      if (startDavidUlt(f)) return;
      baseUlt(f);
    };

    window.update = (f, dt) => {
      if (S.davidCinematic) {
        if (S.davidCinematic.owner === f) return;
        const c = S.davidCinematic;
        c.timer -= dt;
        if (c.phase === 0 && c.timer <= 0) {
          c.phase = 1;
          c.timer = 18;
          c.owner.f = c.owner.x < c.target.x ? 1 : -1;
          say('五块石头');
        } else if (c.phase === 1 && c.timer <= 0) {
          c.phase = 2;
          c.timer = 14;
          burst(c.owner.x + 21, c.owner.y + 30, 22, '#e9c879', 4.5);
          S.shake = 10;
          if (c.target) {
            hit(c.owner, c.target, 60, 28, 26, '歌利亚之战');
            c.target.vy = -4.2;
          }
        } else if (c.phase === 2 && c.timer <= 0) {
          c.phase = 3;
          c.timer = 20;
          say('得胜');
        } else if (c.phase === 3 && c.timer <= 0) {
          c.owner.lock = 0;
          c.owner.inv = 0;
          c.done = true;
          S.davidCinematic = null;
        }
        return;
      }
      baseUpdate(f, dt);
    };

    window.drawFx = () => {
      baseDrawFx();

      if (S.davidCinematic) {
        const c = S.davidCinematic;
        const f = c.owner;
        X.save();
        X.fillStyle = '#0b0907cc';
        X.fillRect(0, 0, W, H);
        X.globalAlpha = 0.94;
        X.textAlign = 'center';
        X.font = '900 28px Georgia, serif';
        X.fillStyle = '#f2d38c';
        const title = c.phase === 0 ? '大卫' : c.phase === 1 ? '歌利亚' : c.phase === 2 ? '五块石头' : '耶和华赐下得胜';
        X.fillText(title, W / 2, 120);
        X.font = 'bold 12px sans-serif';
        X.fillStyle = '#d8c6a3';
        X.fillText('撒母耳记上 17 章 · 游戏化演出', W / 2, 146);
        X.textAlign = 'left';

        if (c.phase === 0) {
          X.fillStyle = '#c9a86d';
          X.fillRect(W/2 - 110, 220, 220, 5);
          X.fillRect(W/2 - 16, 186, 32, 70);
        } else if (c.phase === 1) {
          X.fillStyle = '#6e5139';
          X.fillRect(W/2 + 72, 182, 56, 118);
          X.fillStyle = '#b89462';
          X.fillRect(W/2 + 84, 155, 32, 28);
          X.fillStyle = '#c9a86d';
          X.fillRect(W/2 - 110, 224, 40, 4);
        } else if (c.phase === 2) {
          X.fillStyle = '#e7c879';
          for (let i = 0; i < 5; i++) {
            const a = i * 0.8 + 0.35;
            const rr = 62 + i * 8;
            X.beginPath(); X.arc(W/2 + Math.cos(a)*rr, 238 + Math.sin(a)*rr*0.45, 6, 0, Math.PI*2); X.fill();
          }
          X.strokeStyle = '#ffe4a8'; X.lineWidth = 3;
          X.beginPath(); X.moveTo(W/2 - 42, 238); X.lineTo(W/2 + 112, 208); X.stroke();
        } else {
          X.fillStyle = '#ecd89e';
          X.fillRect(W/2 - 160, 224, 320, 3);
        }
        X.globalAlpha = 1;
        X.restore();
      }

      if (A && A.id === 'david' && A.attackCtx) {
        const n = stageFor(A);
        if (n === 1 || n === 2) {
          X.save(); X.globalAlpha = 0.5; X.strokeStyle = '#e8c77c'; X.lineWidth = 2;
          X.beginPath(); X.moveTo(A.x + 21, A.y + 24); X.lineTo(A.x + 21 + A.f * 28, A.y + 16); X.stroke(); X.restore();
        }
      }
      if (B && B.id === 'david' && B.attackCtx) {
        const n = stageFor(B);
        if (n === 1 || n === 2) {
          X.save(); X.globalAlpha = 0.5; X.strokeStyle = '#e8c77c'; X.lineWidth = 2;
          X.beginPath(); X.moveTo(B.x + 21, B.y + 24); X.lineTo(B.x + 21 + B.f * 28, B.y + 16); X.stroke(); X.restore();
        }
      }
    };
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
