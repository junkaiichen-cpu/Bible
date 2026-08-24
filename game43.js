(() => {
  'use strict';

  const boot = () => {
    if (!window.S || !window.A || !window.B || typeof window.hit !== 'function') return;
    const canvas = document.querySelector('#game');
    if (!canvas) return;
    const X = canvas.getContext('2d');
    if (!X) return;

    const polish = window.BIBLE_FIGHTER_DAVID_POLISH = window.BIBLE_FIGHTER_DAVID_POLISH || {
      version: '1.4.2', ready: true, cameraKick: 0, flash: 0, lastEvent: '', ko: false, hitCount: 0
    };

    const david = (f) => f?.id === 'david';
    const baseHit = window.hit;

    window.hit = (attacker, defender, damage, stun, knock, label) => {
      const before = defender?.hp ?? 0;
      baseHit(attacker, defender, damage, stun, knock, label);
      if (!david(attacker) || !defender || !(defender.hp < before)) return;
      const text = String(label || '命中');
      polish.lastEvent = text;
      polish.hitCount += 1;
      polish.cameraKick = Math.max(polish.cameraKick, text.includes('重') || Number(attacker.step || 0) >= 5 ? 8 : 4);
      polish.flash = Math.max(polish.flash, text.includes('投石索') ? 8 : 5);
      if (defender.hp <= 0) polish.ko = true;
    };

    const syncLifecycle = () => {
      if ((window.A?.hp ?? 1) > 0 && (window.B?.hp ?? 1) > 0 && polish.ko) polish.ko = false;
      if (!window.S?.run) { canvas.style.transform = ''; return; }
      if (polish.cameraKick <= 0) { canvas.style.transform = ''; return; }
      const amp = Math.min(4, Math.ceil(polish.cameraKick / 2));
      const x = (polish.cameraKick % 2 ? amp : -amp);
      const y = (polish.cameraKick % 3) - 1;
      canvas.style.transform = `translate(${x}px, ${y}px)`;
      polish.cameraKick--;
    };

    const drawOverlay = () => {
      if (polish.flash > 0) {
        X.save();
        X.globalAlpha = Math.min(0.18, polish.flash / 45);
        X.fillStyle = '#f3dfad';
        X.fillRect(0, 0, canvas.width, canvas.height);
        X.restore();
        polish.flash--;
      }
      if (polish.ko) {
        X.save();
        X.globalAlpha = 0.82;
        X.fillStyle = '#d8b766';
        X.fillRect(0, canvas.height * 0.38, canvas.width, canvas.height * 0.20);
        X.globalAlpha = 1;
        X.fillStyle = '#120d08';
        X.textAlign = 'center';
        X.font = '900 30px sans-serif';
        X.fillText('歌利亚之战 · 终结', canvas.width / 2, canvas.height * 0.50);
        X.font = '700 12px sans-serif';
        X.fillText('大卫的胜利来自信靠，而非力量本身', canvas.width / 2, canvas.height * 0.55);
        X.restore();
      }
    };

    window.BIBLE_FIGHTER_DAVID_POLISH_READY = true;
    window.BIBLE_FIGHTER_DAVID_POLISH_API = {
      snapshot: () => ({version: polish.version, cameraKick: polish.cameraKick, flash: polish.flash, lastEvent: polish.lastEvent, hitCount: polish.hitCount, ko: polish.ko})
    };

    const loop = () => { syncLifecycle(); drawOverlay(); requestAnimationFrame(loop); };
    loop();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
