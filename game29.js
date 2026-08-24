(() => {
  'use strict';
  const boot = () => {
    if (!window.arena || !window.X || !window.W || !window.H || !window.G || !window.S) return;
    const oldArena = window.arena;
    const stage = window.BIBLE_FIGHTER_STAGE = window.BIBLE_FIGHTER_STAGE || { version:'2.2', time:0, depthLayers:5, dynamic:true };
    stage.time = stage.time || 0;

    const pixel = (x,y,w,h,c,a=1) => { X.save(); X.globalAlpha=a; X.fillStyle=c; X.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); X.restore(); };
    const shape = (pts,c,a=1) => { X.save(); X.globalAlpha=a; X.fillStyle=c; X.beginPath(); X.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) X.lineTo(pts[i][0],pts[i][1]); X.closePath(); X.fill(); X.restore(); };
    const cloud = (x,y,s=1) => { pixel(x,y+7*s,42*s,7*s,'#e0dccf',.7); pixel(x+8*s,y,21*s,12*s,'#eeeadd',.78); pixel(x+25*s,y+4*s,17*s,9*s,'#e6e1d3',.72); };
    const rock = (x,y,s=1,c='#6b5841') => { pixel(x,y,18*s,7*s,c); pixel(x+4*s,y-4*s,11*s,5*s,'#806a4e'); pixel(x+2*s,y+7*s,15*s,3*s,'#45372a',.9); };
    const grass = (x,y,flip=1,c='#7e874d') => { pixel(x,y-8,2,8,c); pixel(x+flip*3,y-11,2,11,'#9ba25d'); pixel(x+flip*6,y-6,2,6,'#6c7640'); };

    const drawElah = () => {
      const t = stage.time;
      pixel(0,0,W,112,'#7f96a9'); pixel(0,112,W,80,'#96a5aa'); pixel(0,192,W,90,'#a89072'); pixel(0,282,W,120,'#755d47');
      pixel(768,42,34,34,'#efd084',.9); pixel(758,51,54,16,'#efd084',.28);
      cloud((90+(t*.42)%1100)-120,54,1.05); cloud((460+(t*.21)%1050)-90,96,.78);
      shape([[0,282],[108,202],[210,258],[326,180],[470,270],[596,202],[730,266],[850,192],[960,248],[960,G],[0,G]],'#45443f');
      shape([[0,330],[122,268],[226,314],[340,246],[468,318],[580,258],[702,314],[826,248],[960,300],[960,G],[0,G]],'#5d4b39');
      shape([[0,372],[125,332],[260,356],[390,324],[520,360],[665,328],[810,358],[960,330],[960,G],[0,G]],'#72583f');
      pixel(0,G,W,H-G,'#483627'); pixel(0,G,W,7,'#90714b'); pixel(0,G+7,W,2,'#5c442f');
      for(let i=0;i<24;i++){ const x=(i*91+Math.floor(t*.25))%W; const y=G+17+((i*17)%28); pixel(x,y,10+(i%3)*3,2,i%2?'#6b5238':'#7b5f40',.72); }
      rock(46,G-2,1.05); rock(96,G-2,.72); rock(862,G-1,.9); rock(904,G-2,.66); rock(502,G-1,.72);
      [[42,1],[142,-1],[236,1],[324,-1],[640,1],[748,-1],[858,1],[926,-1]].forEach(([x,f])=>grass(x,G+2,f));
      pixel(112,G-42,4,42,'#4a3423'); pixel(116,G-39,18,9,'#8c6c46'); pixel(842,G-42,4,42,'#4a3423'); pixel(824,G-39,18,9,'#8c6c46');
      X.save(); X.globalAlpha=.24; X.strokeStyle='#c7aa70'; X.lineWidth=1; X.beginPath(); X.moveTo(84,G-20); X.lineTo(290,G-35); X.lineTo(670,G-35); X.lineTo(876,G-20); X.stroke(); X.beginPath(); X.moveTo(218,G-8); X.lineTo(742,G-8); X.stroke(); X.restore();
      X.save(); X.globalAlpha=.22; X.fillStyle='#e2c88e'; for(let i=0;i<14;i++){ const x=(i*83+t*.36)%W; const y=G-96-(i%5)*11; X.fillRect(Math.round(x),Math.round(y),1,1); } X.restore();
      stage.name = '以拉谷·旷野战线';
    };

    const drawRedSea = () => {
      const t = stage.time;
      pixel(0,0,W,110,'#7798a8'); pixel(0,110,W,88,'#95a5a7'); pixel(0,198,W,84,'#9f896c');
      shape([[0,292],[90,208],[178,252],[248,184],[310,274],[360,220],[430,285],[430,G],[0,G]],'#514a42');
      shape([[W,292],[W-90,208],[W-178,252],[W-248,184],[W-310,274],[W-360,220],[W-430,285],[W-430,G],[W,G]],'#514a42');
      pixel(0,G-82,210,82,'#4e7783'); pixel(W-210,G-82,210,82,'#4e7783');
      pixel(210,G-63,W-420,63,'#ad946b'); pixel(210,G-9,W-420,9,'#6e5b43');
      X.save(); X.globalAlpha=.48; X.strokeStyle='#c9d9d7'; X.lineWidth=2; X.beginPath(); X.moveTo(0,G-76); X.quadraticCurveTo(92,G-96,190,G-76); X.stroke(); X.beginPath(); X.moveTo(W,G-76); X.quadraticCurveTo(W-92,G-96,W-190,G-76); X.stroke(); X.restore();
      rock(26,G-5,1.0,'#6f6757'); rock(W-44,G-5,1.0,'#6f6757');
      grass(214,G+2,1,'#7a8554'); grass(W-214,G+2,-1,'#7a8554');
      X.save(); X.globalAlpha=.2; X.fillStyle='#d8e9ea'; for(let i=0;i<18;i++){ const x=(i*71+t*.22)%200; X.fillRect(x, G-66-(i%4)*4, 3, 2); X.fillRect(W-x-3,G-62-(i%4)*5,3,2); } X.restore();
      stage.name = '红海·旷野通道';
    };

    window.arena = () => {
      stage.time += .35;
      oldArena();
      const p1 = window.S?.pick?.p1 || window.A?.id;
      const p2 = window.S?.pick?.p2 || window.B?.id;
      const isMoses = p1 === 'moses' || p2 === 'moses';
      X.save(); X.imageSmoothingEnabled = false;
      if (isMoses) drawRedSea(); else drawElah();
      X.restore();
    };

    const previousDrawFx = window.drawFx;
    window.drawFx = () => {
      previousDrawFx?.();
      X.save(); X.imageSmoothingEnabled=false;
      for (const f of [window.A,window.B]) if (f) {
        const airborne = f.y + f.h < G - 3;
        const scale = airborne ? .68 : 1;
        X.globalAlpha = airborne ? .12 : .28; X.fillStyle='#17100b';
        X.beginPath(); X.ellipse(f.x+21,G+2,25*scale,5*scale,0,0,Math.PI*2); X.fill();
      }
      X.globalAlpha=.42; for(let i=0;i<34;i++){ const x=(i*53+stage.time*.13)%W; const h=5+(i%3)*2; X.fillStyle='#372b20'; X.fillRect(Math.round(x),G-h,2,h); X.fillRect(Math.round(x+3),G-h+2,2,h-2); }
      X.restore();
    };

    window.BIBLE_FIGHTER_STAGE_READY = true;
    window.BIBLE_FIGHTER_STAGE = {
      version:'2.2-2d-stage',
      modes:{david:'以拉谷·旷野战线',moses:'红海·旷野通道'},
      current(){ const p1=window.S?.pick?.p1, p2=window.S?.pick?.p2; return (p1==='moses'||p2==='moses')?'red-sea':'elah-valley'; }
    };
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
