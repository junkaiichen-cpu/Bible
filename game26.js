(() => {
  'use strict';

  const boot = () => {
    if (!window.draw || !window.drawFx || !window.arena || !window.update) return;

    const baseDraw = window.draw;
    const baseDrawFx = window.drawFx;
    const baseArena = window.arena;
    const baseUpdate = window.update;

    S.davidFx = S.davidFx || {
      dust: [], stones: [], sparks: [], slings: [], valleyTime: 0,
      heavyFlash: 0, lastStep: 0
    };

    const isDavid = (f) => f?.id === 'david';
    const hasDavid = () => isDavid(A) || isDavid(B);
    const df = () => S.davidFx;

    const addDust = (x, y, count = 6, power = 2.4) => {
      for (let i = 0; i < count; i++) df().dust.push({
        x, y, vx:(Math.random()-.5)*power, vy:-Math.random()*power*.9,
        life:16 + Math.random()*12, size:2 + Math.random()*3
      });
    };

    const addSparks = (x, y, count = 8, power = 3.2) => {
      for (let i = 0; i < count; i++) df().sparks.push({
        x, y, vx:(Math.random()-.5)*power, vy:(Math.random()-.75)*power,
        life:10 + Math.random()*12, size:1 + Math.random()*2
      });
    };

    const slingArc = (f, alpha = 1) => {
      if (!isDavid(f) || !f.skillCtx || f.skillCtx.which !== 1) return;
      const cx = f.x + 21 + f.f * 17;
      const cy = f.y + 26;
      X.save();
      X.globalAlpha = alpha;
      X.strokeStyle = '#d9ba72';
      X.lineWidth = 2;
      X.beginPath();
      X.arc(cx, cy, 16, f.f > 0 ? -1.0 : 2.1, f.f > 0 ? 0.65 : 4.0);
      X.stroke();
      X.fillStyle = '#f1d68b';
      X.fillRect(cx + f.f*14 - 2, cy - 2, 5, 5);
      X.restore();
    };

    const davidDraw = (f) => {
      if (!f) return;
      if (f.inv > 0 && Math.floor(f.inv / 2) % 2 === 0) return;
      const x = Math.round(f.x + 21);
      const y = Math.round(f.y + 68);
      const face = f.f || 1;
      const moving = Math.min(1, Math.abs(f.vx || 0) / 10);
      const airborne = f.y + f.h < G - 1;
      const step = Math.round(Math.sin((df().valleyTime + f.x) * .14) * 2 * moving);
      const skin = '#d7ae84';
      const hair = '#3f2d25';
      const tunic = '#8e6b48';
      const sash = '#d2b675';
      const dark = '#211a16';

      X.save();
      X.translate(x, y);
      X.scale(face, 1);

      // Shadow and dust anchor.
      X.fillStyle = '#16100c99';
      X.beginPath(); X.ellipse(0, 4, 27 + moving*7, 6, 0, 0, Math.PI*2); X.fill();

      // Legs.
      X.fillStyle = dark;
      X.fillRect(-9-step, -22, 7, 22);
      X.fillRect(2+step, -22, 7, 22);
      X.fillStyle = '#3a2a20';
      X.fillRect(-11-step, -3, 11, 4);
      X.fillRect(1+step, -3, 12, 4);

      // Tunic / shepherd cloak.
      X.fillStyle = tunic;
      X.fillRect(-15, -59, 30, 38);
      X.fillRect(-12, -66, 24, 10);
      X.fillStyle = '#6f5035';
      X.fillRect(-15, -31, 30, 8);
      X.fillStyle = sash;
      X.fillRect(-13, -45, 26, 4);
      X.fillRect(4, -41, 5, 19);

      // Shoulder wrap.
      X.fillStyle = '#b28a58';
      X.fillRect(-17, -61, 8, 27);
      X.fillStyle = '#d1aa70';
      X.fillRect(-18, -57, 5, 19);

      // Head + hair silhouette.
      X.fillStyle = skin;
      X.fillRect(-11, -87, 22, 22);
      X.fillRect(-8, -91, 16, 5);
      X.fillStyle = hair;
      X.fillRect(-14, -91, 28, 8);
      X.fillRect(-12, -84, 5, 8);
      X.fillRect(7, -85, 6, 8);
      X.fillStyle = dark;
      X.fillRect(face > 0 ? 6 : -10, -78, 4, 3);
      // Headband / shepherd strip.
      X.fillStyle = '#5c4330';
      X.fillRect(-12, -84, 24, 3);

      // Arms and sling pose.
      X.fillStyle = skin;
      const attack = f.atk > 0 || f.attackCtx?.phase === 'active';
      X.fillRect(face*(attack ? 7 : 9), -55, 21, 5);
      X.fillRect(face*(-12), -53, 8, 19);
      X.fillStyle = tunic;
      X.fillRect(face*(attack ? 11 : -12), -56, 10, 6);
      X.fillStyle = '#c7a15f';
      X.fillRect(face*24, -55, 18, 2);

      // Sling specific animation.
      slingArc(f, 0.95);

      if (f.step === 5 || /重击/.test(String(f.lastLabel||''))) {
        X.strokeStyle = '#e7c77d'; X.lineWidth = 2; X.globalAlpha = .65;
        X.beginPath(); X.arc(face*26, -44, 17, -0.9, 0.9); X.stroke();
      }

      if (airborne) {
        X.fillStyle = '#d9bc7655';
        X.fillRect(-17, 3, 9, 3); X.fillRect(8, 7, 11, 3);
      }

      if (f.armor > 0) {
        X.strokeStyle = '#f3dda1'; X.lineWidth = 2; X.globalAlpha = .7;
        X.strokeRect(-22, -96, 44, 102);
      }
      X.restore();
    };

    window.draw = (f) => {
      if (isDavid(f)) davidDraw(f); else baseDraw(f);
    };

    window.update = (f, dt) => {
      baseUpdate(f, dt);
      df().valleyTime += f?.slot === 'p1' ? dt : 0;
      if (!f) return;
      if (isDavid(f)) {
        const moving = Math.abs(f.vx || 0) > 8;
        if (moving && df().lastStep <= 0 && f.y + f.h >= G - 2) {
          addDust(f.x + 21, G - 8, 5, 2.1);
          df().lastStep = 5;
        }
        df().lastStep = Math.max(0, df().lastStep - (f.slot === 'p1' ? 1 : 0));
        if (f.attackCtx?.step === 5 && f.attackCtx.phase === 'active') df().heavyFlash = 4;
        if (f.skillCtx?.which === 2 && f.skillCtx.phase === 'active') addDust(f.x + 21 - f.f*12, f.y + 50, 2, 1.4);
      }
    };

    window.arena = () => {
      baseArena();
      if (!hasDavid()) return;
      const t = df().valleyTime;
      X.save();
      // Valley of Elah backdrop: distant ridges, dry grass, battlefield markers.
      X.globalAlpha = .9;
      X.fillStyle = '#2f271f';
      X.beginPath(); X.moveTo(0, G-112); X.lineTo(120, G-170); X.lineTo(248, G-126); X.lineTo(378, G-185); X.lineTo(540, G-132); X.lineTo(698, G-178); X.lineTo(824, G-124); X.lineTo(960, G-168); X.lineTo(960,G); X.lineTo(0,G); X.closePath(); X.fill();
      X.fillStyle = '#4b3a29';
      X.beginPath(); X.moveTo(0, G-76); X.lineTo(170, G-112); X.lineTo(330, G-86); X.lineTo(510, G-132); X.lineTo(700, G-88); X.lineTo(860,G-118); X.lineTo(960,G-90); X.lineTo(960,G); X.lineTo(0,G); X.closePath(); X.fill();
      // Moving heat haze and dry grass lines.
      X.globalAlpha = .35;
      X.strokeStyle = '#d4b77d'; X.lineWidth = 1;
      for (let i=0;i<18;i++) {
        const xx = (i*61 + t*0.6) % 960;
        const yy = G-16 - (i%3)*4;
        X.beginPath(); X.moveTo(xx,yy); X.lineTo(xx+4,yy-8-(i%2)*3); X.stroke();
      }
      X.globalAlpha = .5;
      X.fillStyle = '#c9a86b';
      X.fillRect(478, G-54, 3, 18); X.fillRect(488, G-51, 3, 15);
      X.fillStyle = '#8c6d44'; X.fillRect(474,G-58,18,4);
      X.restore();
    };

    window.drawFx = () => {
      baseDrawFx();
      if (!hasDavid()) return;
      const fx = df();
      X.save();

      // Sling tension + release rings.
      for (const f of [A,B]) if (isDavid(f)) slingArc(f, .7);

      // Stone trails derived from the real projectile list.
      for (const q of S.shots || []) {
        if (q.k !== 'davidStone') continue;
        const speed = Math.abs(q.v || 1);
        X.globalAlpha = .75;
        X.strokeStyle = '#f2d38a'; X.lineWidth = 2;
        X.beginPath(); X.moveTo(q.x - Math.sign(q.v||1)*Math.min(30,speed*1.8), q.y); X.lineTo(q.x,q.y); X.stroke();
        X.fillStyle = '#b89a6a'; X.fillRect(q.x-4,q.y-3,8,6);
        X.fillStyle = '#efe0b8'; X.fillRect(q.x-2,q.y-2,4,3);
      }

      // Dust particles.
      for (const p of fx.dust) {
        X.globalAlpha = Math.max(0,p.life/28)*.55;
        X.fillStyle = '#b69b73'; X.fillRect(p.x,p.y,p.size,p.size);
        p.x += p.vx; p.y += p.vy; p.vy += .08; p.life -= 1;
      }
      fx.dust = fx.dust.filter(p => p.life > 0);

      // Gold hit sparks for David's decisive blows.
      for (const p of fx.sparks) {
        X.globalAlpha = Math.max(0,p.life/20);
        X.fillStyle = '#f4d889'; X.fillRect(p.x,p.y,p.size,p.size);
        p.x += p.vx; p.y += p.vy; p.life -= 1;
      }
      fx.sparks = fx.sparks.filter(p => p.life > 0);

      if (fx.heavyFlash > 0) {
        X.globalAlpha = fx.heavyFlash/4*.18;
        X.fillStyle = '#f0d18b'; X.fillRect(0,0,W,H);
        fx.heavyFlash -= 1;
      }

      // Valley lane markers — subtle, not UI-like.
      X.globalAlpha = .25;
      X.strokeStyle = '#cdb47b'; X.lineWidth = 1;
      X.beginPath(); X.moveTo(95,G-22); X.lineTo(320,G-22); X.stroke();
      X.beginPath(); X.moveTo(W-320,G-22); X.lineTo(W-95,G-22); X.stroke();
      X.restore();
    };

    window.BIBLE_FIGHTER_DAVID_ART_READY = true;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
