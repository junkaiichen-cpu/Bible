(() => {
  'use strict';

  const boot = () => {
    if (!window.S || !window.A || !window.B || typeof window.hit !== 'function') return;
    const canvas = document.querySelector('#game');
    if (!canvas) return;
    const X = canvas.getContext('2d');
    if (!X) return;
    X.imageSmoothingEnabled = false;

    const model = window.BIBLE_FIGHTER_DAVID_MODEL = window.BIBLE_FIGHTER_DAVID_MODEL || {};
    model.syncVersion = '1.4.1';
    model.lastHit = model.lastHit || '';
    model.hitFlash = 0;
    model.skillFlash = 0;
    model.trackedShots = model.trackedShots || new Set();

    const david = (f) => f?.id === 'david';
    const baseHit = window.hit;

    window.hit = (attacker, defender, damage, stun, knock, label) => {
      const before = defender?.hp ?? 0;
      baseHit(attacker, defender, damage, stun, knock, label);
      const dealt = defender && defender.hp < before;
      if (!dealt || !david(attacker)) return;

      const text = String(label || '命中');
      model.lastHit = text;
      model.hitFlash = 7;
      model.skillFlash = text.includes('投石索') || text.includes('疾奔') ? 12 : 6;
      model.action = text.includes('投石索') ? 'sling-hit' : text.includes('疾奔') ? 'dash-hit' : (Number(attacker.step || 0) >= 5 ? 'heavy-hit' : 'hit');
      model.actionTimer = Math.max(model.actionTimer || 0, 16);
    };

    const drawTrackedShots = () => {
      const shots = Array.isArray(window.S?.shots) ? window.S.shots : [];
      const next = new Set();
      for (const shot of shots) {
        if (!shot?.o || !david(shot.o)) continue;
        const key = shot;
        next.add(key);
        const dir = shot.o.f || 1;
        const gold = '#d5b46b';
        X.globalAlpha = 0.35;
        X.fillStyle = gold;
        X.fillRect(Math.round(shot.x - dir * 18), Math.round(shot.y - 2), 20, 4);
        X.globalAlpha = 1;
        X.fillStyle = '#e9d6a5';
        X.fillRect(Math.round(shot.x - 3), Math.round(shot.y - 3), 7, 7);
        X.fillStyle = '#7d6847';
        X.fillRect(Math.round(shot.x - 1), Math.round(shot.y - 2), 4, 4);
      }
      model.trackedShots = next;
    };

    const drawHitFeedback = () => {
      if ((model.hitFlash || 0) <= 0) return;
      const f = window.A;
      const e = window.B;
      if (!f || !e) return;
      const x = (e.x || 0) + 21;
      const y = (e.y || 0) + 30;
      X.globalAlpha = Math.min(0.75, model.hitFlash / 7);
      X.strokeStyle = model.action === 'heavy-hit' ? '#fff1c7' : '#d5b46b';
      X.lineWidth = model.action === 'heavy-hit' ? 3 : 2;
      X.beginPath();
      X.arc(x, y, model.action === 'heavy-hit' ? 22 : 14, 0, Math.PI * 2);
      X.stroke();
      X.fillStyle = '#fff4d1';
      X.fillRect(Math.round(x - 2), Math.round(y - 2), 4, 4);
      X.globalAlpha = 1;
      model.hitFlash -= 1;
    };

    const drawSkillFlash = () => {
      if ((model.skillFlash || 0) <= 0) return;
      const f = david(window.A) ? window.A : window.B;
      if (!f) return;
      const alpha = Math.min(0.35, model.skillFlash / 24);
      X.globalAlpha = alpha;
      X.fillStyle = '#d8b766';
      X.fillRect(0, 0, window.W, window.H);
      X.globalAlpha = 1;
      model.skillFlash -= 1;
    };

    window.BIBLE_FIGHTER_DAVID_INTERACTION_READY = true;
    window.BIBLE_FIGHTER_DAVID_INTERACTION_API = {
      snapshot: () => ({
        version: model.syncVersion,
        lastHit: model.lastHit,
        action: model.action || 'idle',
        activeShots: model.trackedShots?.size || 0,
        hitFlash: model.hitFlash || 0,
        skillFlash: model.skillFlash || 0
      })
    };

    const loop = () => {
      drawTrackedShots();
      drawHitFeedback();
      drawSkillFlash();
      requestAnimationFrame(loop);
    };
    loop();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
