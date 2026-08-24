(() => {
  'use strict';

  const boot = () => {
    if (!window.hit || !window.update || !window.sub || !window.drawFx) return;

    const baseHit = window.hit;
    const baseUpdate = window.update;
    const baseSub = window.sub;
    const baseDrawFx = window.drawFx;

    S.stageFeel = S.stageFeel || { cornerFlash: 0, landing: 0, punish: 0 };

    const fighterState = (f) => {
      if (!f) return 'none';
      if (f.protect > 0) return 'protected';
      if (!f.on) return f.st > 0 ? 'air_hit' : 'air';
      if (f.st > 0) return 'ground_hit';
      if (f.skillBusy > 0) return 'skill';
      return 'neutral';
    };

    window.hit = (f, e, d, st, kn, label) => {
      if (!e) return;
      const wasAir = !e.on && e.y + e.h < G - 1;
      const wasWall = e.x < 65 || e.x > W - e.w - 65;
      const beforeHp = e.hp;
      baseHit(f, e, d, st, kn, label);
      if (e.hp >= beforeHp) return;

      // Layered hit reaction. Heavy hits pin slightly longer near the wall.
      if (wasWall && Math.abs(kn) > 8) {
        e.vx *= 0.35;
        e.wallStun = Math.max(e.wallStun || 0, label === '重击' ? 11 : 7);
        S.stageFeel.cornerFlash = Math.max(S.stageFeel.cornerFlash, 6);
        txt(e.x + 21, e.y - 35, '墙角压制', 'support');
      }

      if (wasAir) {
        e.airHitCount = (e.airHitCount || 0) + 1;
        // Distinguish first/second/finisher air hits visually.
        if (e.airHitCount <= 2) {
          e.vy = Math.min(e.vy, -3.1);
        } else if (e.airHitCount >= 4) {
          e.vy = Math.max(e.vy, 2.4);
          e.juggleGrace = Math.max(e.juggleGrace || 0, 5);
          txt(e.x + 21, e.y - 25, '落地保护即将恢复', 'support');
        }
      }

      // David gets a clearer confirm feedback on the slingshot.
      if (f.id === 'david' && /投石索|davidStone/.test(label || '')) {
        S.stageFeel.punish = 8;
        ring(e.x + 21, e.y + 30, 30, '#e7c77f');
        txt(e.x + 21, e.y - 18, '命中确认', 'skill');
      }
    };

    window.sub = (f) => {
      const before = f && f.sub;
      const ok = baseSub(f);
      if (f && before !== f.sub && f.inv > 20) {
        S.stageFeel.punish = 4;
        txt(f.x + 21, f.y - 24, '脱离成功', 'support');
      }
      return ok;
    };

    window.update = (f, dt) => {
      const prevOn = !!f.on;
      baseUpdate(f, dt);
      if (!f) return;

      f.wallStun = Math.max(0, (f.wallStun || 0) - dt);
      f.airHitCount = Math.max(0, (f.airHitCount || 0));

      // Landing recovery: brief protection after a real landing from an air string.
      if (!prevOn && f.on) {
        const hadAirString = (f.airborneTime || 0) > 5 || (f.airHitCount || 0) > 0;
        if (hadAirString) {
          f.protect = Math.max(f.protect || 0, 12);
          f.st = Math.min(f.st || 0, 2);
          ring(f.x + 21, G - 28, 28, '#b8c9de');
          txt(f.x + 21, G - 88, '落地保护', 'support');
          S.stageFeel.landing = 8;
        }
        f.airHitCount = 0;
      }

      // Wall friction keeps corner pressure readable without turning the arena into
      // an infinite pinball loop.
      if (f.x < 48 || f.x > W - f.w - 48) f.vx *= 0.76;
    };

    window.drawFx = () => {
      baseDrawFx();
      const fade = (value) => Math.max(0, Math.min(1, value / 10));
      if (S.stageFeel.cornerFlash > 0) {
        X.save();
        X.globalAlpha = 0.14 * fade(S.stageFeel.cornerFlash);
        X.fillStyle = '#f6d78e';
        X.fillRect(0, 0, 48, H);
        X.fillRect(W - 48, 0, 48, H);
        X.restore();
        S.stageFeel.cornerFlash -= 1;
      }
      if (S.stageFeel.landing > 0) S.stageFeel.landing -= 1;
      if (S.stageFeel.punish > 0) S.stageFeel.punish -= 1;
    };

    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'f5') {
        e.preventDefault();
        say('STAGE FEEL · CORNER / LANDING / PUNISH');
      }
    });

    const oldClean = window.clean;
    if (oldClean) {
      window.clean = () => {
        oldClean();
        S.stageFeel = { cornerFlash: 0, landing: 0, punish: 0 };
      };
    }

    void fighterState;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
