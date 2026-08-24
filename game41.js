(() => {
  'use strict';

  const boot = () => {
    if (!window.S || !window.A || !window.B || typeof window.act !== 'function') return false;
    const canvas = document.querySelector('#game');
    if (!canvas) return false;
    const X = canvas.getContext('2d');
    if (!X) return false;
    X.imageSmoothingEnabled = false;

    const model = window.BIBLE_FIGHTER_DAVID_MODEL = window.BIBLE_FIGHTER_DAVID_MODEL || {};
    Object.assign(model, {
      version: '1.4.4', ready: true, qualityReady: true,
      action: model.action || 'idle', actionTimer: 0, attackFrame: 0,
      skillPhase: '', skillTimer: 0, ultimate: 0, hitFlash: 0,
      fx: [], stones: [], dust: [],
      lastSkill: '', lastHit: model.lastHit || ''
    });

    const david = () => window.A?.id === 'david' ? window.A : (window.B?.id === 'david' ? window.B : null);
    const P = {
      skin:'#b9825d', skinHi:'#d09a71', tunic:'#73593e', tunicHi:'#92704b', tunicDark:'#4a3828',
      sash:'#c7a160', sashHi:'#e4c783', hair:'#211c18', hairHi:'#30271f', eyes:'#f4e6c5',
      sling:'#a77745', leather:'#6b472b', gold:'#d8b66a', goldHi:'#f0d99c', dust:'#8b755d',
      shadow:'#17120e', red:'#8a3f32'
    };
    const px=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const rect=(x,y,w,h,c)=>px(x,y,w,h,c);
    const burst=(x,y,n,c,spread=4)=>{for(let i=0;i<n;i++)model.fx.push({x,y,vx:(Math.random()-.5)*spread,vy:(Math.random()-1.15)*spread,l:10+Math.random()*16,c});};
    const dust=(x,y,n=7)=>{for(let i=0;i<n;i++)model.dust.push({x:x+(Math.random()-.5)*18,y:y-2,vx:(Math.random()-.5)*2,vy:-Math.random()*1.8,l:12+Math.random()*10});};

    function drawSling(x,y,dir,charged){
      X.strokeStyle=P.sling; X.lineWidth=2; X.beginPath();
      const hand=x+dir*2, mid=x+dir*(charged?23:14), low=y+(charged?-7:6);
      X.moveTo(hand,y); X.lineTo(mid,low); X.lineTo(x+dir*(charged?37:27),y+3); X.stroke();
      if(charged){ X.fillStyle=P.goldHi; X.fillRect(Math.round(mid-2),Math.round(low-2),5,5); }
    }

    function drawDavid(f){
      const x=Math.round(f.x), y=Math.round(f.y), dir=f.f||1;
      const airborne = Number(f.y||0) < Number(window.G||438) - Number(f.h||70) - 4;
      const t = performance.now()/110;
      const bob = model.action==='idle' ? Math.round(Math.sin(t)*1) : 0;
      const lean = model.action==='dash' ? dir*6 : model.action==='attack' ? dir*3 : 0;
      const step = Number(f.step||0);
      const run = !!window.K?.['d'] || !!window.K?.['arrowright'] || !!window.K?.['a'] || !!window.K?.['arrowleft'];
      const runSwing = run ? Math.sin(t*1.8) : 0;

      // ground shadow / silhouette
      if(!airborne) rect(x+5,y+66,33,5,P.shadow);

      // cloak / tunic silhouette
      rect(x+9+lean,y+25+bob,25,30,P.tunicDark);
      rect(x+11+lean,y+24+bob,23,27,P.tunic);
      rect(x+13+lean,y+27+bob,18,20,P.tunicHi);
      rect(x+8+lean,y+24+bob,7,7,P.tunicDark); // shoulder fold
      rect(x+30+lean,y+25+bob,6,14,P.tunicDark);

      // legs / sandals with action-specific pose
      if(model.action==='dash' || run){
        const s = Math.max(-1,Math.min(1,runSwing));
        rect(x+9+Math.round(s*5),y+50,9,15,P.tunicDark);
        rect(x+25-Math.round(s*5),y+51,9,14,P.tunic);
        rect(x+3+Math.round(s*7),y+64,13,3,P.shadow);
        rect(x+31-Math.round(s*7),y+64,13,3,P.shadow);
      } else if(airborne){
        rect(x+8,y+49,10,10,P.tunicHi); rect(x+28,y+47,10,11,P.tunic);
        rect(x+3,y+57,13,4,P.shadow); rect(x+31,y+56,13,4,P.shadow);
      } else if(step>=4){
        rect(x+7,y+49,12,13,P.tunic); rect(x+27,y+45,12,14,P.tunicHi);
        rect(x+2,y+61,14,4,P.shadow); rect(x+31,y+59,14,4,P.shadow);
      } else {
        rect(x+9,y+50,11,14,P.tunic); rect(x+27,y+50,11,14,P.tunic);
        rect(x+5,y+64,15,3,P.shadow); rect(x+26,y+64,15,3,P.shadow);
      }

      // sash + shoulder drape
      rect(x+8+lean,y+28+bob,29,5,P.sash);
      rect(x+10+lean,y+30+bob,25,2,P.sashHi);
      rect(x+31+lean,y+22+bob,6,23,P.tunicHi);
      rect(x+34+lean,y+23+bob,4,12,P.sash);

      // head + hair + youthful face
      rect(x+12+lean,y+7+bob,19,18,P.skin);
      rect(x+10+lean,y+5+bob,23,9,P.hair);
      rect(x+11+lean,y+10+bob,4,8,P.hair);
      rect(x+27+lean,y+9+bob,6,5,P.hairHi);
      rect(x+16+lean,y+14+bob,4,3,P.skinHi);
      rect(x+24+lean,y+14+bob,3,2,P.skinHi);
      const eyeX=x+24+lean+(dir>0?2:-2); rect(eyeX,y+13+bob,2,2,P.eyes);
      rect(x+20+lean,y+20+bob,8,2,P.skinHi);

      // neck + arms: distinct poses
      rect(x+19+lean,y+24+bob,7,5,P.skin);
      const forwardX=dir>0?x+32+lean:x+2+lean;
      if(model.action==='sling'){
        rect(forwardX,y+29+bob,10,6,P.skinHi); rect(forwardX+dir*7,y+24+bob,7,6,P.skin);
        rect(x+2+lean,y+31+bob,9,6,P.skin); drawSling(x+3+dir*4+lean,y+31+bob,dir,model.skillPhase==='charge');
      } else if(model.action==='attack'){
        const reach = Math.min(18,5+step*3);
        rect(forwardX,y+29+bob,10+reach,6,P.skin);
        rect(x+3+lean,y+34+bob,9,6,P.skin);
      } else if(model.action==='dash'){
        rect(forwardX,y+30+bob,9,6,P.skin); rect(x+2+lean,y+29+bob,9,6,P.skin);
      } else {
        rect(forwardX,y+31+bob,9,6,P.skin); rect(x+3+lean,y+34+bob,9,6,P.skin);
        drawSling(x+35+lean,y+34+bob,dir,false);
      }

      // pixel attack arcs
      if(model.action==='attack' && model.actionTimer>0){
        const reach=22+step*8;
        X.globalAlpha=.8;
        X.strokeStyle=step>=5?P.goldHi:P.gold; X.lineWidth=3;
        X.beginPath(); X.moveTo(x+37,y+21); X.lineTo(x+37+dir*reach,y+17+(step%2)*8); X.stroke();
        X.globalAlpha=1;
      }
      if(model.action==='sling' && model.skillPhase==='charge'){
        X.globalAlpha=.75; X.strokeStyle=P.gold; X.lineWidth=2;
        X.beginPath(); X.arc(x+21+dir*20,y+30,10,0,Math.PI*2); X.stroke(); X.globalAlpha=1;
      }
    }

    function drawFx(){
      for(const p of model.fx){X.globalAlpha=Math.max(0,p.l/22);rect(p.x,p.y,3,3,p.c);p.x+=p.vx;p.y+=p.vy;p.vy+=.14;p.l--;}
      model.fx=model.fx.filter(p=>p.l>0);
      for(const p of model.dust){X.globalAlpha=Math.max(0,p.l/20);rect(p.x,p.y,5,3,P.dust);p.x+=p.vx;p.y+=p.vy;p.l--;}
      model.dust=model.dust.filter(p=>p.l>0);
      for(const s of model.stones){X.globalAlpha=Math.max(0,s.l/18);rect(s.x-s.dir*10,s.y-2,18,4,P.gold);rect(s.x-3,s.y-3,7,7,P.goldHi);X.globalAlpha=1;s.x+=s.vx;s.y+=s.vy;s.vy+=.11;s.l--;}
      model.stones=model.stones.filter(s=>s.l>0);
      X.globalAlpha=1;
    }

    function skillStart(slot,a){
      const f=slot==='p1'?window.A:window.B;
      if(f?.id!=='david') return;
      if(a==='a'){ model.action='attack'; model.attackFrame=0; model.actionTimer=20; model.lastSkill='5A'; burst(f.x+21+(f.f||1)*30,f.y+29,Number(f.step||0)>=5?12:5,P.gold); }
      if(a==='s1'){ model.action='sling'; model.skillPhase='charge'; model.skillTimer=22; model.actionTimer=38; model.lastSkill='投石索'; burst(f.x+21+(f.f||1)*20,f.y+26,5,P.goldHi); }
      if(a==='s2'){ model.action='dash'; model.skillPhase='dash'; model.skillTimer=26; model.actionTimer=45; model.lastSkill='牧者跃步'; dust(f.x+21,f.y+66,10); burst(f.x+21,f.y+48,7,P.dust); }
      if(a==='u'){ model.action='ultimate'; model.skillPhase='ultimate'; model.ultimate=120; model.actionTimer=120; model.lastSkill='歌利亚之战'; burst(f.x+21,f.y+25,30,P.goldHi,6); }
    }

    const baseAct=window.act;
    window.act=(slot,a)=>{baseAct(slot,a);skillStart(slot,a);};

    const stepSkills=()=>{
      const f=david(); if(!f)return;
      if(model.skillTimer>0){
        model.skillTimer--;
        if(model.action==='sling' && model.skillTimer===8){
          model.skillPhase='release';
          model.stones.push({x:f.x+(f.f||1)*55,y:f.y+24,vx:(f.f||1)*8,vy:-1.4,dir:f.f||1,l:28});
          burst(f.x+(f.f||1)*45,f.y+26,8,P.goldHi,5);
        }
        if(model.action==='sling' && model.skillTimer===0)model.skillPhase='';
        if(model.action==='dash' && model.skillTimer===0){model.skillPhase='landing';dust(f.x+21,f.y+65,12);}
      }
      if(model.actionTimer>0)model.actionTimer--; else if(model.ultimate<=0)model.action='idle';
      if(model.ultimate>0){
        model.ultimate--;
        if(model.ultimate===72)burst(f.x+21,f.y+15,18,P.goldHi,7);
        if(model.ultimate===18)burst(f.x+21,f.y+25,30,P.goldHi,8);
      }
    };

    const loop=()=>{
      const f=david();
      if(f) stepSkills();
      if(f){drawDavid(f); if(model.action==='ultimate'){
        X.globalAlpha=.24;X.fillStyle=P.gold;X.fillRect(0,0,window.W,window.H);X.globalAlpha=1;
        X.strokeStyle=P.goldHi;X.lineWidth=3;X.beginPath();X.arc(f.x+21,f.y+28,34+((120-model.ultimate)%22),0,Math.PI*2);X.stroke();
        X.fillStyle=P.goldHi;X.font='700 18px sans-serif';X.fillText('歌利亚之战',f.x-22,f.y-18);
      }}
      drawFx(); requestAnimationFrame(loop);
    };

    window.BIBLE_FIGHTER_DAVID_MODEL_READY=true;
    window.BIBLE_FIGHTER_DAVID_MODEL_QUALITY_READY=true;
    window.BIBLE_FIGHTER_DAVID_MODEL_API={snapshot:()=>({version:model.version,qualityReady:true,action:model.action,skillPhase:model.skillPhase,skillTimer:model.skillTimer,lastSkill:model.lastSkill,ultimate:model.ultimate,fx:model.fx.length,stones:model.stones.length,dust:model.dust.length})};
    loop();
    return true;
  };

  const start=()=>{if(boot())return;let tries=0;const timer=setInterval(()=>{tries++;if(boot()||tries>=90)clearInterval(timer)},50);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
