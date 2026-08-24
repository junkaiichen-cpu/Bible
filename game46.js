(() => {
  'use strict';
  const boot = () => {
    const canvas=document.querySelector('#game');
    if(!canvas||!window.S||!window.act)return false;
    const keys=window.BIBLE_FIGHTER_REAL_KEYS||Object.create(null);
    const state=window.BIBLE_FIGHTER_COMBAT_CORE=window.BIBLE_FIGHTER_COMBAT_CORE||{version:'1.4.7',ready:true,actions:0,moves:0,jumps:0,guards:0,reversals:0,hits:0,airHits:0,lockOn:true,lastAction:''};
    const fighter=s=>s==='p1'?window.A:window.B;const enemy=f=>f?.slot==='p1'?window.B:window.A;
    const map={p1:{left:'a',right:'d',up:'w',down:'s'},p2:{left:'arrowleft',right:'arrowright',up:'arrowup',down:'arrowdown'}};
    const grounded=f=>!!f&&(f.y||0)>=(window.G||438)-f.h-2;
    const guarding=f=>!!f&&grounded(f)&&!!keys[map[f.slot].down]&&!(f.atk>0||f.skillBusy>0);
    const originalHit=window.hit;
    window.hit=(attacker,defender,damage,stun,knock,label)=>{
      if(defender&&guarding(defender)){
        state.guards++;defender.st=Math.min(defender.st||0,4);defender.vx=(defender.vx||0)*0.35;defender.armor=Math.max(defender.armor||0,6);window.txt?.(defender.x+21,defender.y-14,'格挡','guard');window.burst?.(defender.x+21,defender.y+28,8,'#d8c9a6',2.4);return;
      }
      const before=defender?.hp??0;originalHit(attacker,defender,damage,stun,knock,label);if(defender&&defender.hp<before){state.hits++;if((defender.y||0)<(window.G||438)-defender.h-4)state.airHits++;}
    };
    const originalUpdate=window.update;
    window.update=(f,dt)=>{originalUpdate(f,dt);if(!f||!window.S.run)return;const e=enemy(f);if(e&&state.lockOn&&f.st<=0&&f.lock<=0&&Math.abs((e.x||0)-(f.x||0))<210){f.f=((e.x||0)>f.x)?1:-1;f.face=f.f;}f._coreGuard=guarding(f);if(f._coreGuard)state.guards=Math.max(state.guards,0);f._combatRange=e?Math.abs((e.x||0)-(f.x||0)):Infinity;};
    const reset=()=>{state.actions=0;state.moves=0;state.jumps=0;state.guards=0;state.reversals=0;state.hits=0;state.airHits=0;state.lastAction='';};
    const s0=window.start,r0=window.rematch,b0=window.back;window.start=(...a)=>{reset();return s0?.(...a)};window.rematch=(...a)=>{reset();return r0?.(...a)};window.back=(...a)=>{reset();return b0?.(...a)};
    window.BIBLE_FIGHTER_COMBAT_CORE_READY=true;window.BIBLE_FIGHTER_COMBAT_CORE_API={snapshot:()=>({version:state.version,actions:state.actions,moves:window.BIBLE_FIGHTER_REAL_COMBAT?.moves||0,jumps:window.BIBLE_FIGHTER_REAL_COMBAT?.jumps||0,guards:state.guards,reversals:state.reversals,hits:state.hits,airHits:state.airHits,lastAction:window.BIBLE_FIGHTER_REAL_COMBAT?.lastAction||state.lastAction,p1:window.A?{x:window.A.x,y:window.A.y,hp:window.A.hp,f:window.A.f,blocking:!!window.A._coreGuard}:null,p2:window.B?{x:window.B.x,y:window.B.y,hp:window.B.hp,f:window.B.f,blocking:!!window.B._coreGuard}:null})};
    return true;
  };
  if(!boot()){let tries=0;const timer=setInterval(()=>{tries++;if(boot()||tries>=120)clearInterval(timer);},50);}
})();
