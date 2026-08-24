(() => {
  'use strict';
  const boot = () => {
    if (!window.X || !window.S || !window.A || !window.B) { setTimeout(boot, 50); return; }
    const drawState = (f, label) => {
      if (!f) return;
      const x = Math.round(f.x + 21);
      const y = Math.round(f.y - 13);
      const hp = Math.max(0, Math.min(1, f.hp / Math.max(1, f.max)));
      const action = f.st > 0 ? '受击' : f.inv > 0 ? '无敌' : f.attackCtx?.phase === 'active' ? '攻击' : f.skillCtx ? '技能' : Math.abs(f.vx || 0) > 2 ? '移动' : '待机';
      X.save(); X.imageSmoothingEnabled = false;
      X.globalAlpha = .92;
      X.fillStyle = label === 'P1' ? '#dbc27e' : '#b8ced6';
      X.fillRect(x - 20, y - 2, 40, 8);
      X.fillStyle = '#17110d'; X.fillRect(x - 18, y, 36, 4);
      X.fillStyle = hp > .35 ? '#8fb86d' : '#bd6f63'; X.fillRect(x - 18, y, 36 * hp, 4);
      X.font = 'bold 9px monospace'; X.textAlign = 'center'; X.fillStyle = '#f3e7cd'; X.fillText(`${label} · ${f.id === 'david' ? '大卫' : f.id === 'moses' ? '摩西' : f.id}`, x, y - 5);
      X.font = '8px monospace'; X.fillStyle = '#d8c3a1'; X.fillText(action, x, y + 17);
      X.globalAlpha = .55;
      X.strokeStyle = f.f > 0 ? '#e0c98d' : '#b5d0d8'; X.lineWidth = 1;
      X.beginPath(); X.moveTo(x + (f.f > 0 ? 12 : -12), y + 4); X.lineTo(x + (f.f > 0 ? 18 : -18), y + 4); X.stroke();
      X.restore();
    };
    const baseFx = window.drawFx;
    window.drawFx = () => {
      baseFx?.();
      drawState(window.A, 'P1');
      drawState(window.B, 'P2');
      if (window.A && window.B) {
        const gap = Math.abs((window.A.x + 21) - (window.B.x + 21));
        if (gap < 150) {
          X.save(); X.globalAlpha = .18; X.strokeStyle = '#d6c08d'; X.setLineDash([4,4]);
          X.beginPath(); X.moveTo(window.A.x + 21, G - 17); X.lineTo(window.B.x + 21, G - 17); X.stroke(); X.setLineDash([]); X.restore();
        }
      }
    };
    window.BIBLE_FIGHTER_READABILITY_READY = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
