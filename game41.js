(() => {
  'use strict';

  const boot = () => {
    if (!window.S || !window.A || !window.B || !window.X || typeof window.act !== 'function') return;
    const X = window.X;
    const model = window.BIBLE_FIGHTER_DAVID_MODEL = window.BIBLE_FIGHTER_DAVID_MODEL || {
      version: '1.4.0',
      ready: true,
      action: 'idle',
      actionTimer: 0,
      fx: [],
      stoneTrail: [],
      ultimate: 0
    };

    const david = () => window.A?.id === 'david' ? window.A : (window.B?.id === 'david' ? window.B : null);
    const color = { skin:'#b98762', cloth:'#7b6147', cloth2:'#51402f', hair:'#241f1a', sling:'#b58a55', gold:'#d5b46b', white:'#ead9b4', shadow:'#1a1511' };
    const px = (x,y,w,h,c) => { X.fillStyle=c; X.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };

    function burst(x,y,n,c){ for(let i=0;i<n;i++) model.fx.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-1.2)*4,l:12+Math.random()*18,c}); }
    function trail(x,y){ model.stoneTrail.push({x,y,l:14}); }

    function drawDavid(f){
      const x=Math.round(f.x), y=Math.round(f.y), dir=f.f||1, step=f.step||0;
      // cover the generic fighter body with a compact pixel silhouette
      px(x-2,y-2,46,72,color.shadow);
      const lean = f.atk>0 ? dir*4 : 0;
      // shepherd robe and belt
      px(x+8+lean,y+26,27,32,color.cloth);
      px(x+7+lean,y+47,29,10,color.cloth2);
      px(x+4,y+54,13,12,color.shadow); px(x+27,y+54,13,12,color.shadow);
      // head / hair
      px(x+12+lean,y+7,18,18,color.skin);
      px(x+11+lean,y+5,20,8,color.hair);
      px(x+8+lean,y+11,5,7,color.hair);
      // eyes
      px(x+18+lean+(dir>0?3:0),y+15,3,3,color.white);
      // scarf / shoulder
      px(x+8+lean,y+25,29,6,color.gold);
      px(x+5+lean,y+26,8,5,color.white);
      // arm and hand direction
      const armY=y+31;
      px(dir>0?x+32+lean:x+2+lean,armY,10,6,color.skin);
      px(dir>0?x+38+lean:x-3+lean,armY+1,6,6,color.skin);
      // legs with running / attack pose
      if(step===5 || model.action==='dash'){
        px(x+10,y+57,11,7,color.cloth); px(x+29,y+53,13,7,color.cloth);
        px(x+3,y+63,13,4,color.shadow); px(x+35,y+60,12,4,color.shadow);
      } else if(f.y < window.G-f.h-5){
        px(x+8,y+58,12,7,color.cloth); px(x+28,y+58,12,7,color.cloth);
      } else {
        px(x+10,y+58,10,8,color.cloth); px(x+27,y+58,10,8,color.cloth);
        px(x+5,y+65,15,3,color.shadow); px(x+27,y+65,15,3,color.shadow);
      }

      // sling: visible at idle, stretched on skill 1
      const handX=dir>0?x+41:x+1, handY=y+33;
      X.strokeStyle=color.sling; X.lineWidth=2;
      X.beginPath();
      if(f.skillBusy>0 || f.atk>0){ X.moveTo(handX,handY); X.lineTo(handX+dir*15,handY-9); X.lineTo(handX+dir*28,handY); }
      else { X.moveTo(handX,handY); X.lineTo(handX+dir*9,handY+10); X.lineTo(handX+dir*18,handY+4); }
      X.stroke();

      if(step>0 && f.atk>0){
        const reach=20+step*7;
        px(dir>0?x+39:x-reach+3,y+18,reach,3,color.gold);
      }
    }

    function drawStoneFx(){
      model.stoneTrail.forEach(p=>{ X.globalAlpha=Math.max(0,p.l/14); px(p.x-2,p.y-2,5,5,color.gold); });
      X.globalAlpha=1;
      model.stoneTrail = model.stoneTrail.filter(p=>--p.l>0);
      model.fx.forEach(p=>{ X.globalAlpha=Math.max(0,p.l/20); px(p.x,p.y,3,3,p.c); p.x+=p.vx; p.y+=p.vy; p.vy+=.16; p.l--; });
      X.globalAlpha=1;
      model.fx=model.fx.filter(p=>p.l>0);
    }

    const baseAct=window.act;
    window.act=(slot,a)=>{
      const f=slot==='p1'?window.A:window.B;
      baseAct(slot,a);
      if(f?.id!=='david') return;
      if(a==='a'){model.action='attack';model.actionTimer=18;burst(f.x+21+(f.f||1)*42,f.y+30,(f.step||1)>=5?10:4,color.gold);}
      if(a==='s1'){model.action='sling';model.actionTimer=32;burst(f.x+21+(f.f||1)*18,f.y+30,4,color.white);setTimeout(()=>{ if(window.S?.run) trail(f.x+(f.f||1)*80,f.y+28); },30);}
      if(a==='s2'){model.action='dash';model.actionTimer=42;burst(f.x+21,f.y+62,9,color.cloth2);}
      if(a==='u'){model.action='ultimate';model.actionTimer=110;model.ultimate=110;burst(f.x+21,f.y+25,26,color.gold);}
    };

    function loop(){
      const f=david();
      if(f){
        if(model.actionTimer>0) model.actionTimer--; else model.action='idle';
        if(model.ultimate>0) model.ultimate--;
        drawDavid(f);
        if(model.action==='sling' && f.skillBusy>0){ X.strokeStyle=color.gold; X.lineWidth=2; X.beginPath(); X.arc(f.x+21+(f.f||1)*22,f.y+28,9,0,Math.PI*2); X.stroke(); }
        if(model.action==='ultimate'){
          X.globalAlpha=.28; X.fillStyle='#d7b96f'; X.fillRect(0,0,window.W,window.H); X.globalAlpha=1;
          X.strokeStyle=color.white; X.lineWidth=3; X.beginPath(); X.arc(f.x+21,f.y+28,38+((110-model.ultimate)%18),0,Math.PI*2); X.stroke();
          X.fillStyle=color.gold; X.font='700 18px sans-serif'; X.fillText('歌利亚之战',f.x-20,f.y-20);
        }
      }
      drawStoneFx();
      requestAnimationFrame(loop);
    }

    window.BIBLE_FIGHTER_DAVID_MODEL_READY=true;
    window.BIBLE_FIGHTER_DAVID_MODEL_API={snapshot:()=>({...model,fx:model.fx.length,stoneTrail:model.stoneTrail.length})};
    loop();
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
