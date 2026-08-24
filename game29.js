(() => {
  'use strict';
  const boot = () => {
    if (!window.arena || !window.drawFx || !window.update || !window.A || !window.B) {
      setTimeout(boot, 50); return;
    }
    const baseArena = window.arena;
    const baseDrawFx = window.drawFx;
    const baseUpdate = window.update;
    if (!window.S.stage) window.S.stage = { time: 0, name: '以拉谷' };

    const stone = (x,y,w,h,c) => { X.fillStyle=c; X.fillRect(Math.round(x),Math.round(y),w,h); };
    const ridge = (pts, c) => { X.fillStyle=c; X.beginPath(); X.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) X.lineTo(pts[i][0],pts[i][1]); X.lineTo(W,H); X.lineTo(0,H); X.closePath(); X.fill(); };

    window.arena = () => {
      const t = S.stage.time;
      baseArena();
      X.save();
      X.imageSmoothingEnabled = false;
      // Depth band 1: distant Judean hills.
      ridge([[0,G-142],[92,G-178],[188,G-152],[286,G-198],[408,G-151],[538,G-189],[684,G-148],[808,G-182],[960,G-150]], '#33271f');
      ridge([[0,G-102],[116,G-132],[246,G-108],[392,G-158],[526,G-114],[674,G-147],[814,G-108],[960,G-134]], '#4a3828');
      // Dry valley floor.
      X.fillStyle = '#6e5235'; X.fillRect(0,G-34,W,34);
      X.fillStyle = '#806341';
      for(let i=0;i<32;i++){
        const x=(i*37 + t*0.28)%W;
        const y=G-10-(i%4)*4;
        X.fillRect(x,y,2,7); X.fillRect(x+3,y+3,3,4);
      }
      // Distant olive shrubs / thorn silhouettes.
      X.fillStyle='#2f3827';
      for(let i=0;i<9;i++){
        const x=38+i*112+(i%2)*17;
        X.fillRect(x,G-74,3,42); X.fillRect(x-13,G-68,29,4); X.fillRect(x-9,G-78,23,4);
      }
      // Side rocks create framing and depth.
      stone(18,G-52,58,18,'#514034'); stone(34,G-64,36,14,'#62503b');
      stone(W-76,G-49,58,18,'#514034'); stone(W-60,G-65,34,16,'#62503b');
      // Central battlefield lane: subtly convergent lines.
      X.strokeStyle='#b49460'; X.globalAlpha=.22; X.lineWidth=1;
      X.beginPath(); X.moveTo(96,G-22); X.lineTo(300,G-35); X.lineTo(660,G-35); X.lineTo(864,G-22); X.stroke();
      X.beginPath(); X.moveTo(220,G-10); X.lineTo(740,G-10); X.stroke();
      // Warm late-afternoon sky wash.
      X.globalAlpha=.08; X.fillStyle='#e6c98b'; X.fillRect(0,0,W,G-170);
      // Tiny airborne dust motes give depth without overwhelming combat.
      X.globalAlpha=.24;
      X.fillStyle='#d9c08b';
      for(let i=0;i<14;i++){
        const x=(i*83+t*0.42)%W;
        const y=G-95-(i%5)*11;
        X.fillRect(x,y,1,1);
      }
      X.restore();
    };

    window.update = (f,dt) => {
      baseUpdate(f,dt);
      if (f?.slot === 'p1') S.stage.time += dt;
    };

    window.drawFx = () => {
      baseDrawFx();
      X.save();
      // Ground contact shadows make fighters sit in the scene.
      for (const f of [A,B]) if (f) {
        const yy = G - 3;
        const scale = Math.max(.55, Math.min(1.2, 1 - Math.max(0, G-(f.y+f.h))/180));
        X.globalAlpha=.26;
        X.fillStyle='#17100b';
        X.beginPath(); X.ellipse(f.x+21,yy,26*scale,5*scale,0,0,Math.PI*2); X.fill();
        if (f.y+f.h < G-4) {
          X.globalAlpha=.12;
          X.strokeStyle='#e5c989'; X.beginPath(); X.ellipse(f.x+21,yy,34*scale,7*scale,0,0,Math.PI*2); X.stroke();
        }
      }
      // Foreground grass silhouettes, drawn after fighters for cheap 2.5D depth.
      X.globalAlpha=.45; X.fillStyle='#3b3022';
      for(let i=0;i<40;i++){
        const x=(i*47 + S.stage.time*.18)%W;
        const h=5+(i%4)*2;
        X.fillRect(x,G-h,2,h); X.fillRect(x+3,G-h+2,2,h-2);
      }
      X.restore();
    };
    window.BIBLE_FIGHTER_STAGE_READY = true;
    window.BIBLE_FIGHTER_STAGE = { version:'1.0', name:'以拉谷', depthLayers:4, dynamic:true };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
