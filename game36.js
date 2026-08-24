(() => {
  'use strict';

  const boot = () => {
    if (!window.drawFx || !window.update || !window.hit) return;

    const baseDrawFx = window.drawFx;
    const baseUpdate = window.update;
    const baseHit = window.hit;

    const state = window.BIBLE_FIGHTER_DAVID_SHOWCASE = window.BIBLE_FIGHTER_DAVID_SHOWCASE || {
      version: '1.0',
      combo: 0,
      comboTimer: 0,
      route: '',
      routeTimer: 0,
      slingPulse: 0,
      leapPulse: 0,
      finisherPulse: 0,
      lastHit: 0
    };

    const david = (f) => f?.id === 'david';
    const getDavid = () => david(window.A) ? window.A : (david(window.B) ? window.B : null);
    const popText = (text, kind='skill') => {
      if (typeof window.txt !== 'function') return;
      const f = getDavid();
      if (f) window.txt(f.x + 21, f.y - 26, text, kind);
    };

    const routeFor = (attacker, label) => {
      if (!david(attacker)) return;
      const clean = String(label || '');
      if (clean.includes('普攻')) {
        state.combo = Math.min(99, Number(attacker.combo || 0));
        state.route = attacker.combo >= 4 ? '牧者连段' : '基础五击';
      } else if (clean.includes('投石索')) {
        state.route = '远程确认';
        state.slingPulse = 8;
      } else if (clean.includes('牧者跃步')) {
        state.route = '突进追击';
        state.leapPulse = 10;
      } else if (clean.includes('歌利亚')) {
        state.route = '终结演出';
        state.finisherPulse = 16;
      }
      state.routeTimer = 48;
      state.lastHit = performance.now();
    };

    window.hit = (attacker, defender, damage, stun, knock, label) => {
      baseHit(attacker, defender, damage, stun, knock, label);
      routeFor(attacker, label);
    };

    window.update = (f, dt) => {
      baseUpdate(f, dt);
      if (f?.slot !== 'p1') return;
      state.comboTimer = Math.max(0, state.comboTimer - 1);
      state.routeTimer = Math.max(0, state.routeTimer - 1);
      state.slingPulse = Math.max(0, state.slingPulse - 1);
      state.leapPulse = Math.max(0, state.leapPulse - 1);
      state.finisherPulse = Math.max(0, state.finisherPulse - 1);

      const d = getDavid();
      if (!d) return;
      if (d.skillCtx?.which === 1) state.slingPulse = Math.max(state.slingPulse, 4);
      if (d.skillCtx?.which === 2 && d.skillCtx?.phase === 'active') state.leapPulse = Math.max(state.leapPulse, 5);
      if (d.attackCtx?.step === 5 && d.attackCtx?.phase === 'active') state.finisherPulse = Math.max(state.finisherPulse, 4);

      if (state.routeTimer === 1 && typeof window.txt === 'function') {
        window.txt(d.x + 21, d.y - 22, '牧者之战', 'skill');
      }
    };

    window.drawFx = () => {
      baseDrawFx();
      const d = getDavid();
      if (!d) return;

      X.save();
      X.imageSmoothingEnabled = false;

      // Persistent but subtle route ribbon keeps the player's current David game-plan readable.
      if (state.route && state.routeTimer > 0) {
        const a = Math.min(.9, state.routeTimer / 18);
        X.globalAlpha = a;
        X.fillStyle = '#120e09cc';
        X.fillRect(18, 56, 132, 18);
        X.strokeStyle = '#c5a765';
        X.strokeRect(18, 56, 132, 18);
        X.fillStyle = '#ead8a7';
        X.font = '10px monospace';
        X.fillText(`DAVID · ${state.route}`, 26, 69);
      }

      // Sling telegraph: concentric pixel rings + a short aim line.
      if (state.slingPulse > 0 || d.skillCtx?.which === 1) {
        const cx = d.x + 21 + d.f * 24;
        const cy = d.y + (d.skillCtx?.up ? 9 : 26);
        const pulse = 18 + (1 - state.slingPulse / 10) * 9;
        X.globalAlpha = .2 + Math.min(.55, state.slingPulse / 14);
        X.strokeStyle = '#e6ca84';
        X.lineWidth = 1;
        X.beginPath(); X.arc(cx, cy, pulse, 0, Math.PI * 2); X.stroke();
        X.beginPath(); X.moveTo(cx, cy); X.lineTo(cx + d.f * 38, cy + (d.skillCtx?.up ? -11 : 0)); X.stroke();
      }

      // Leap landing telegraph: tiny ground chevrons beneath David.
      if (state.leapPulse > 0 || d.skillCtx?.which === 2) {
        const gx = d.x + 21;
        const gy = G - 12;
        X.globalAlpha = .55;
        X.strokeStyle = '#d6ba73';
        X.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const spread = 9 + i * 8;
          X.beginPath(); X.moveTo(gx - spread, gy); X.lineTo(gx, gy - 4); X.lineTo(gx + spread, gy); X.stroke();
        }
      }

      // Heavy fifth hit and finisher use a short directional burst, not a generic flash.
      if (state.finisherPulse > 0 || d.attackCtx?.step === 5) {
        X.globalAlpha = .15 + Math.min(.3, state.finisherPulse / 32);
        X.fillStyle = '#f0d28b';
        X.fillRect(0, 0, W, H);
        X.globalAlpha = .65;
        X.strokeStyle = '#f4db99';
        X.lineWidth = 2;
        const cx = d.x + 21 + d.f * 36;
        const cy = d.y + 34;
        X.beginPath(); X.moveTo(cx - d.f * 30, cy); X.lineTo(cx + d.f * 26, cy); X.stroke();
        X.beginPath(); X.moveTo(cx - d.f * 20, cy - 8); X.lineTo(cx + d.f * 20, cy + 5); X.stroke();
      }

      X.restore();
    };

    window.BIBLE_FIGHTER_DAVID_SHOWCASE_READY = true;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
