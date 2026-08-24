(() => {
  'use strict';

  const boot = () => {
    if (!window.draw || !window.X || !window.G || !window.S) return;
    const baseDraw = window.draw;
    const baseDrawFx = window.drawFx;
    const is = (f, id) => f && f.id === id;
    const pixel = (x, y, w, h, c) => { X.fillStyle = c; X.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

    const drawDavid = (f) => {
      const cx = Math.round(f.x + 21), base = Math.round(f.y + 68), flip = f.f || 1;
      const moving = Math.abs(f.vx || 0) > 2;
      const attack = f.attackCtx?.phase === 'active' || f.atk > 0;
      const airborne = f.y + f.h < G - 3;
      const skin = '#d9b38b', hair = '#3b2b23', tunic = '#8c6948', cloak = '#b08958', sash = '#d8bc7a', dark = '#211915';
      X.save(); X.translate(cx, base); X.scale(flip, 1);
      X.globalAlpha = .18; X.fillStyle = '#0e0b09'; X.beginPath(); X.ellipse(0, 3, 24 + (moving ? 6 : 0), 5, 0, 0, Math.PI*2); X.fill();
      pixel(-10, -24, 8, 22, dark); pixel(2, -24, 8, 22, dark); pixel(-13, -4, 12, 4, '#3a2a20'); pixel(0, -4, 13, 4, '#3a2a20');
      pixel(-15, -60, 30, 38, tunic); pixel(-12, -68, 24, 10, cloak); pixel(-18, -59, 7, 27, cloak); pixel(-13, -45, 26, 4, sash); pixel(4, -41, 5, 18, sash);
      pixel(-11, -88, 22, 22, skin); pixel(-14, -92, 28, 8, hair); pixel(-12, -85, 5, 7, hair); pixel(7, -85, 6, 7, hair); pixel(-12, -84, 24, 3, '#5c4330'); pixel(flip > 0 ? 6 : -10, -79, 4, 3, dark);
      pixel(flip*(attack ? 7 : 10), -56, 22, 5, skin); pixel(flip*(-12), -53, 8, 18, skin); pixel(flip*(attack ? 10 : -12), -57, 10, 7, tunic); pixel(flip*24, -55, 18, 2, '#c7a15f');
      if (f.skillCtx?.which === 1) { X.strokeStyle = '#e7cb7e'; X.lineWidth = 2; X.beginPath(); X.arc(flip*38, -31, 16, -1.05, .75); X.stroke(); pixel(flip*50, -33, 5, 5, '#f0d88f'); }
      if (f.attackCtx?.step === 5) { X.strokeStyle = '#f0d58c'; X.globalAlpha = .72; X.lineWidth = 2; X.beginPath(); X.arc(flip*34, -41, 18, -.8, .8); X.stroke(); }
      if (airborne) { pixel(-17, 2, 9, 3, '#d9bc76'); pixel(7, 6, 11, 3, '#d9bc76'); }
      X.restore();
    };

    const drawMoses = (f) => {
      const cx = Math.round(f.x + 21), base = Math.round(f.y + 68), flip = f.f || -1;
      const attack = f.attackCtx?.phase === 'active' || f.atk > 0;
      const moving = Math.abs(f.vx || 0) > 2;
      const airborne = f.y + f.h < G - 3;
      const skin = '#c99872', robe = '#6b7480', mantle = '#a49780', belt = '#493f31', dark = '#1d1a17', staff = '#c7a06a';
      X.save(); X.translate(cx, base); X.scale(flip, 1);
      X.globalAlpha = .18; X.fillStyle = '#0e0b09'; X.beginPath(); X.ellipse(0, 3, 26 + (moving ? 4 : 0), 5, 0, 0, Math.PI*2); X.fill();
      pixel(-15, -58, 30, 39, robe); pixel(-18, -40, 36, 16, mantle); pixel(-13, -46, 26, 4, belt);
      pixel(-12, -22, 9, 21, dark); pixel(3, -22, 9, 21, dark); pixel(-15, -4, 13, 4, '#322b25'); pixel(2, -4, 13, 4, '#322b25');
      pixel(-11, -88, 22, 23, skin); pixel(-13, -91, 26, 7, '#322a24'); pixel(-12, -76, 7, 12, '#5a493b'); pixel(5, -77, 8, 14, '#5a493b'); pixel(flip > 0 ? 6 : -10, -80, 4, 3, dark);
      pixel(flip*(attack ? 7 : 10), -54, 20, 6, skin); pixel(flip*(-13), -53, 8, 18, skin); pixel(flip*13, -57, 8, 6, robe);
      pixel(flip*22, -78, 3, 79, staff); pixel(flip*18, -80, 9, 3, staff); pixel(flip*20, -83, 5, 5, staff);
      if (f.skillCtx?.which === 2) { X.strokeStyle = '#8cb4c6'; X.globalAlpha = .78; X.lineWidth = 3; X.beginPath(); X.moveTo(flip*32, -65); X.lineTo(flip*54, -10); X.stroke(); X.beginPath(); X.moveTo(flip*42, -62); X.lineTo(flip*58, -20); X.stroke(); }
      if (f.attackCtx?.step === 5 || f.skillCtx?.which === 2) { X.strokeStyle = '#b7dce8'; X.globalAlpha = .58; X.lineWidth = 2; X.beginPath(); X.arc(flip*28, -43, 20, -.95, .95); X.stroke(); }
      if (airborne) { pixel(-16, 2, 9, 3, '#b1b7ba'); pixel(7, 6, 10, 3, '#b1b7ba'); }
      if (f.inv > 0) { X.strokeStyle = '#d7f0f8'; X.globalAlpha = .45; X.lineWidth = 2; X.strokeRect(-22,-95,44,99); }
      X.restore();
    };

    window.draw = (f) => { if (is(f,'david')) drawDavid(f); else if (is(f,'moses')) drawMoses(f); else baseDraw(f); };

    window.drawFx = () => {
      baseDrawFx?.();
      for (const f of [window.A, window.B]) {
        if (!f) continue;
        if (is(f,'david') && f.attackCtx?.step === 5) { X.save(); X.globalAlpha=.18; X.fillStyle='#f0d58c'; X.fillRect(0,0,W,H); X.restore(); }
        if (is(f,'moses') && f.skillCtx?.which === 2) { X.save(); X.globalAlpha=.14; X.fillStyle='#7db4c5'; X.fillRect(0,0,W,H); X.restore(); }
      }
      const drawState = (f, label) => {
        if (!f) return;
        const x = Math.round(f.x + 21), y = Math.round(f.y - 13), hp = Math.max(0, Math.min(1, f.hp / Math.max(1, f.max)));
        const action = f.st > 0 ? '受击' : f.inv > 0 ? '无敌' : f.attackCtx?.phase === 'active' ? '攻击' : f.skillCtx ? '技能' : Math.abs(f.vx || 0) > 2 ? '移动' : '待机';
        X.save(); X.imageSmoothingEnabled = false; X.globalAlpha = .92;
        X.fillStyle = label === 'P1' ? '#dbc27e' : '#b8ced6'; X.fillRect(x - 20, y - 2, 40, 8);
        X.fillStyle = '#17110d'; X.fillRect(x - 18, y, 36, 4); X.fillStyle = hp > .35 ? '#8fb86d' : '#bd6f63'; X.fillRect(x - 18, y, 36 * hp, 4);
        X.font = 'bold 9px monospace'; X.textAlign = 'center'; X.fillStyle = '#f3e7cd'; X.fillText(`${label} · ${f.id === 'david' ? '大卫' : f.id === 'moses' ? '摩西' : f.id}`, x, y - 5);
        X.font = '8px monospace'; X.fillStyle = '#d8c3a1'; X.fillText(action, x, y + 17);
        X.globalAlpha = .55; X.strokeStyle = f.f > 0 ? '#e0c98d' : '#b5d0d8'; X.lineWidth = 1; X.beginPath(); X.moveTo(x + (f.f > 0 ? 12 : -12), y + 4); X.lineTo(x + (f.f > 0 ? 18 : -18), y + 4); X.stroke();
        X.restore();
      };
      drawState(window.A,'P1'); drawState(window.B,'P2');
      if (window.A && window.B && Math.abs((window.A.x + 21) - (window.B.x + 21)) < 150) {
        X.save(); X.globalAlpha=.18; X.strokeStyle='#d6c08d'; X.setLineDash([4,4]); X.beginPath(); X.moveTo(window.A.x+21,G-17); X.lineTo(window.B.x+21,G-17); X.stroke(); X.setLineDash([]); X.restore();
      }
    };

    window.BIBLE_FIGHTER_CORE_CHARACTERS_READY = true;
    window.BIBLE_FIGHTER_CORE_CHARACTERS = { version:'1.1', roster:['david','moses'], local2p:true, readability:true };
    window.BIBLE_FIGHTER_READABILITY_READY = true;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
