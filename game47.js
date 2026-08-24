(() => {
  'use strict';
  const boot = () => {
    const C = document.querySelector('#game');
    if (!C || !window.S || !window.A || !window.B) return false;
    const X = C.getContext('2d');
    X.imageSmoothingEnabled = false;
    const state = window.BIBLE_FIGHTER_VERTICAL_SLICE = window.BIBLE_FIGHTER_VERTICAL_SLICE || {
      version:'1.5.0', ready:true, stage:'', frame:0, flash:0, dust:[], skillFx:[]
    };
    const rr=(x,y,w,h)=>{X.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const px=(x,y,w,h,c)=>{X.fillStyle=c;rr(x,y,w,h);};
    const line=(x1,y1,x2,y2,c,w=2)=>{X.strokeStyle=c;X.lineWidth=w;X.beginPath();X.moveTo(x1,y1);X.lineTo(x2,y2);X.stroke();};
    const circle=(x,y,r,c,fill=false)=>{X.beginPath();X.arc(x,y,r,0,Math.PI*2);if(fill){X.fillStyle=c;X.fill()}else{X.strokeStyle=c;X.stroke()}};
    const david=(f)=>f?.id==='david', moses=(f)=>f?.id==='moses';
    const drawValley=()=>{
      state.stage='以拉谷';
      X.save();
      const g=X.createLinearGradient(0,0,0,540);g.addColorStop(0,'#18202b');g.addColorStop(.54,'#4d5860');g.addColorStop(1,'#242018');X.fillStyle=g;X.fillRect(0,0,960,540);
      px(0,330,960,108,'#3c3a31');
      for(let i=0;i<12;i++){ const hx=i*100+((i%2)*18); px(hx,286-(i%3)*12,70,46+(i%3)*14,'#273027'); px(hx+18,262-(i%3)*12,36,28,'#324033'); }
      px(0,438,960,102,'#171713');
      px(0,420,960,18,'#796347');
      px(330,405,300,16,'#8e7652');px(348,392,264,13,'#6f5a3e');
      for(let i=0;i<7;i++)px(116+i*112,445-(i%2)*5,5,12,'#92805a');
      X.globalAlpha=.3;circle(790,90,54,'#d9c58b',true);X.globalAlpha=1;
      X.restore();
    };
    const drawSea=()=>{
      state.stage='红海·旷野边界';
      X.save();
      const g=X.createLinearGradient(0,0,0,540);g.addColorStop(0,'#0b1a22');g.addColorStop(.56,'#1e3a45');g.addColorStop(1,'#16130e');X.fillStyle=g;X.fillRect(0,0,960,540);
      px(0,324,330,114,'#244b58');px(630,324,330,114,'#244b58');
      for(let i=0;i<6;i++){px(32+i*50,170+i*18,6,126-i*12,'#395f68');px(900-i*48,172+i*17,6,124-i*12,'#395f68');}
      px(360,420,240,16,'#8d7049');px(405,402,150,18,'#b08d58');
      X.globalAlpha=.4; for(let i=0;i<8;i++){line(16+i*120,355,94+i*120,344,'#a7d2d2',2)}X.globalAlpha=1;
      X.restore();
    };
    const drawDavid=(f)=>{
      const x=f.x+21,y=f.y,dir=f.f||f.face||1,air=y<365;
      const bob = Math.sin(state.frame*.22)*1.4;
      X.save();X.translate(Math.round(x),Math.round(y+bob));X.scale(dir,1);
      // shadow
      X.globalAlpha=.3;X.fillStyle='#050504';X.beginPath();X.ellipse(0,68,19,4,0,0,Math.PI*2);X.fill();X.globalAlpha=1;
      // legs
      px(-12,42,8,24,'#423529');px(4,42,8,24,'#423529');px(-16,62,12,6,'#201a16');px(2,62,13,6,'#201a16');
      // tunic
      px(-17,17,34,28,'#7b6445');px(-13,22,26,25,'#a48558');px(-16,37,32,9,'#59462f');
      // belt
      px(-18,34,36,5,'#2f2920');px(-4,34,9,5,'#d4b96c');
      // shoulders / arms
      px(-22,18,8,21,'#9b7d53');px(14,18,8,21,'#9b7d53');
      const reaching = f.skillCtx || f.skillBusy>0 || f.atk>0;
      px(reaching?12:-18,24,22,6,reaching?'#bf9a62':'#8d704a');
      // sling
      if(state.frame%50<26 || f.last==='投石索' || (f.skillCtx&&f.skillCtx.kind==='sling')){
        line(14,22,28,34,'#d2b66f',2);line(28,34,14,42,'#d2b66f',2);circle(28,34,4,'#e6d18b',false);
      }
      // neck/head
      px(-6,8,12,9,'#a97855');px(-12,-9,24,18,'#b57c59');
      // hair
      px(-14,-13,28,9,'#2a241d');px(-9,-17,18,7,'#302920');px(-16,-8,7,12,'#302920');px(9,-8,7,12,'#302920');
      // face
      px(2,-4,3,3,'#2a201b');
      X.restore();
      if(f.atk>0){X.save();X.globalAlpha=.55;line(x+dir*18,y+26,x+dir*68,y+8,'#e5cd91',3);X.restore();}
    };
    const drawMoses=(f)=>{
      const x=f.x+21,y=f.y,dir=f.f||f.face||-1,raising=f.skillBusy>0||f.atk>0;
      X.save();X.translate(Math.round(x),Math.round(y));X.scale(dir,1);
      X.globalAlpha=.3;X.fillStyle='#050504';X.beginPath();X.ellipse(0,68,20,4,0,0,Math.PI*2);X.fill();X.globalAlpha=1;
      px(-13,40,10,27,'#393538');px(3,40,10,27,'#393538');px(-16,63,13,6,'#1d1918');px(2,63,13,6,'#1d1918');
      px(-19,15,38,29,'#41515a');px(-15,20,30,26,'#67747a');px(-20,36,40,8,'#2e363b');
      px(-22,18,8,22,'#6d7472');px(14,16,8,25,'#6d7472');
      px(-9,7,18,9,'#8e6c51');px(-14,-9,28,18,'#946f54');px(-15,-12,30,8,'#e1d3ba');px(-10,-16,20,7,'#e7dac2');
      if(raising){line(12,32,8,-18,'#6c4e32',4);px(5,-21,7,5,'#8f6b43');}
      else line(14,32,18,68,'#6c4e32',4);
      X.restore();
      if(f.skillBusy>0){X.save();X.globalAlpha=.35;for(let i=0;i<5;i++)line(x+dir*20,y+18+i*13,x+dir*(60+i*8),y+18+i*13,'#9dc8d2',3);X.restore();}
    };
    const drawSkillFx=()=>{
      if(!window.S?.shots)return;
      for(const p of S.shots){
        if(!p)continue; const x=p.x||0,y=p.y||0;
        X.save();
        if(String(p.k||'').includes('david')){circle(x,y,8,'#d6b468',false);circle(x,y,3,'#f1e1a5',true);line(x-(p.v||0)*1.4,y,x-(p.v||0)*3,y,'#f3d58f',2);}
        else if(String(p.k||'').includes('fire')){circle(x,y,10,'#d57c43',false);circle(x,y,5,'#f0ba63',true);}
        else if(String(p.k||'').includes('water')||String(p.k||'').includes('moses')){circle(x,y,12,'#9bcbd1',false);}
        X.restore();
      }
      if(window.S?.shake>0){state.flash=Math.max(state.flash,window.S.shake>12?6:2)}
    };
    const drawOverlay=()=>{
      X.save();
      X.globalAlpha=.85;px(14,14,220,40,'#0a0806');X.globalAlpha=1;
      X.fillStyle='#d8c18b';X.font='bold 13px monospace';X.fillText(state.stage,28,39);
      if(david(A)){X.fillStyle='#d6bf84';X.fillText('DAVID',28,76);}
      if(moses(B)){X.fillStyle='#a8c4c9';X.fillText('MOSES',830,76);}
      X.restore();
      if(state.flash>0){X.save();X.globalAlpha=Math.min(.28,state.flash/20);X.fillStyle='#fff4d0';X.fillRect(0,0,960,540);X.restore();state.flash--;}
    };
    const originalArena=window.arena;
    window.arena=()=>{ originalArena?.(); const ids=[A?.id,B?.id]; if(ids.includes('moses'))drawSea(); else drawValley(); };
    const originalDrawFx=window.drawFx;
    window.drawFx=()=>{ originalDrawFx?.(); drawSkillFx(); if(david(A))drawDavid(A); if(david(B))drawDavid(B); if(moses(A))drawMoses(A); if(moses(B))drawMoses(B); drawOverlay(); };
    const tick=()=>{state.frame++;requestAnimationFrame(tick)}; tick();
    window.BIBLE_FIGHTER_VERTICAL_SLICE_READY=true;
    window.BIBLE_FIGHTER_VERTICAL_SLICE_API={snapshot:()=>({version:state.version,stage:state.stage,frame:state.frame,ready:true,david:!!(david(A)||david(B)),moses:!!(moses(A)||moses(B)),shots:Array.isArray(S.shots)?S.shots.length:0})};
    return true;
  };
  if(!boot()){let tries=0;const timer=setInterval(()=>{tries++;if(boot()||tries>=120)clearInterval(timer);},50)}
})();
