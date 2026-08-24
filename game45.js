(() => {
  'use strict';
  const boot = () => {
    const canvas = document.querySelector('#game');
    if (!canvas) return false;
    const held = Object.create(null);
    const state = window.BIBLE_FIGHTER_REAL_COMBAT = window.BIBLE_FIGHTER_REAL_COMBAT || {version:'1.4.6',ready:true,active:false,ticks:0,attacks:0,skills:0,hits:0,jumps:0,moves:0,blocked:0,lastAction:''};
    const isBattle=()=>!!window.S?.run&&!!window.A&&!!window.B;
    const fighter=slot=>slot==='p1'?window.A:window.B;
    const map={p1:{left:'a',right:'d',up:'w',down:'s',attack:'j',skill1:'k',skill2:'l',sub:'i',ult:'o',scroll:'6',helper:'7'},p2:{left:'arrowleft',right:'arrowright',up:'arrowup',down:'arrowdown',attack:'1',skill1:'2',skill2:'3',sub:'4',ult:'5',scroll:'8',helper:'9'}};
    const combatKeys=new Set(Object.values(map).flatMap(Object.values));
    const norm=k=>String(k||'').toLowerCase();
    const actionCode={attack:'a',skill1:'s1',skill2:'s2',sub:'r',ult:'u',scroll:'c',helper:'h'};
    const invoke=(slot,action)=>{
      const f=fighter(slot);if(!f||!isBattle())return false;
      try{
        if(typeof window.act==='function') window.act(slot,actionCode[action]);
        else return false;
        state.lastAction=`${slot}:${action}`; if(action==='attack')state.attacks++;else state.skills++;return true;
      }catch(e){state.lastError=String(e);return false;}
    };
    const onDown=e=>{const k=norm(e.key);if(!combatKeys.has(k))return;e.preventDefault();if(e.repeat)return;held[k]=true;if(!isBattle())return;for(const slot of ['p1','p2']){const m=map[slot];if(k===m.attack)invoke(slot,'attack');else if(k===m.skill1)invoke(slot,'skill1');else if(k===m.skill2)invoke(slot,'skill2');else if(k===m.sub)invoke(slot,'sub');else if(k===m.ult)invoke(slot,'ult');else if(k===m.scroll)invoke(slot,'scroll');else if(k===m.helper)invoke(slot,'helper');}};
    const onUp=e=>{const k=norm(e.key);if(combatKeys.has(k)){e.preventDefault();held[k]=false;}};
    window.addEventListener('keydown',onDown,{capture:true});window.addEventListener('keyup',onUp,{capture:true});
    const update=(f,slot,dt)=>{if(!f||!isBattle())return;const m=map[slot];const speed=f.sp*Math.min(1.5,Math.max(.5,dt/16.67));const left=!!held[m.left],right=!!held[m.right],up=!!held[m.up];const axis=(right?1:0)-(left?1:0);const ground=(window.G||438)-f.h;if(axis&&f.lock<=0&&f.st<=0&&f.skillBusy<=0){f.x+=axis*speed;f.f=axis>0?1:-1;f.face=f.f;state.moves++;}if(up&&f.y>=ground-3&&f._jumpLatch!==true){f.vy=-f.jp;f._jumpLatch=true;state.jumps++;}if(!up)f._jumpLatch=false;f.x=Math.max(20,Math.min((window.W||960)-f.w-20,f.x));};
    const hitProbe=()=>{if(!isBattle())return;for(const attacker of [window.A,window.B]){const defender=attacker===window.A?window.B:window.A;if(!attacker||!defender||attacker.hp<=0||defender.hp<=0)continue;const active=Number(attacker.atk||0)>0&&Number(attacker.st||0)<=0;if(!active||attacker._realCombatHitFrame===attacker.atk)continue;attacker._realCombatHitFrame=attacker.atk;const distance=Math.abs((attacker.x||0)-(defender.x||0));if(distance<76&&typeof window.hit==='function'){const before=defender.hp;window.hit(attacker,defender,4*(attacker.pw||1),7,6,'实时普攻');if(defender.hp<before)state.hits++;}}};
    let last=performance.now();const loop=now=>{const dt=Math.min(40,now-last);last=now;state.active=isBattle();state.ticks++;if(state.active){update(window.A,'p1',dt);update(window.B,'p2',dt);hitProbe();}requestAnimationFrame(loop);};
    window.BIBLE_FIGHTER_REAL_COMBAT_READY=true;
    window.BIBLE_FIGHTER_REAL_COMBAT_API={snapshot:()=>({...state,p1:window.A?{x:window.A.x,y:window.A.y,hp:window.A.hp,lock:window.A.lock,atk:window.A.atk,f:window.A.f}:null,p2:window.B?{x:window.B.x,y:window.B.y,hp:window.B.hp,lock:window.B.lock,atk:window.B.atk,f:window.B.f}:null}),action:(slot,action)=>invoke(slot,action)};
    if(!document.querySelector('script[src="game46.js"]')){const script=document.createElement('script');script.src='game46.js';script.dataset.bibleCombatCore='1';document.body.appendChild(script);}return true;
  };
  if(!boot()){let tries=0;const timer=setInterval(()=>{tries++;if(boot()||tries>=120)clearInterval(timer);},50);}
})();
