(() => {
  'use strict';
  const boot = () => {
    const canvas = document.querySelector('#game');
    if (!canvas || !window.S || !window.act) return false;
    const state = window.BIBLE_FIGHTER_COMBAT_CORE = window.BIBLE_FIGHTER_COMBAT_CORE || {version:'1.4.7',ready:true,actions:0,moves:0,jumps:0,guards:0,reversals:0,hits:0,airHits:0,lockOn:true,lastAction:''};
    const key = Object.create(null);
    const map = {p1:{left:'a',right:'d',up:'w',down:'s',attack:'j',skill1:'k',skill2:'l',sub:'i',ult:'o',scroll:'6',helper:'7'},p2:{left:'arrowleft',right:'arrowright',up:'arrowup',down:'arrowdown',attack:'1',skill1:'2',skill2:'3',sub:'4',ult:'5',scroll:'8',helper:'9'}};
    const action = {attack:'a',skill1:'s1',skill2:'s2',sub:'r',ult:'u',scroll:'c',helper:'h'};
    const fighter = s => s==='p1'?window.A:window.B;
    const enemy = f => f?.slot==='p1'?window.B:window.A;
    const norm = e => String(e.key||'').toLowerCase();
    const combat = k => Object.values(map).some(m => Object.values(m).includes(k));
    const isGrounded = f => !!f && (f.y||0) >= (window.G||438)-f.h-2;
    const isBlocking = f => !!f && isGrounded(f) && !!key[map[f.slot].down] && !(f.atk>0 || f.skillBusy>0);

    const invoke = (slot,name) => {
      const f = fighter(slot); if(!f || !window.S.run || window.S.over) return false;
      const code = action[name];
      if (!code) return false;
      state.actions++; state.lastAction = `${slot}:${name}`;
      window.act(slot, code);
      return true;
    };

    const kd = e => {
      const k = norm(e); if(!combat(k)) return;
      e.preventDefault();
      if(e.repeat) return;
      key[k]=true;
      if(!window.S?.run) return;
      for(const slot of ['p1','p2']){
        const m=map[slot];
        if(k===m.attack) invoke(slot,'attack');
        else if(k===m.skill1) invoke(slot,'skill1');
        else if(k===m.skill2) invoke(slot,'skill2');
        else if(k===m.sub) invoke(slot,'sub');
        else if(k===m.ult) invoke(slot,'ult');
        else if(k===m.scroll) invoke(slot,'scroll');
        else if(k===m.helper) invoke(slot,'helper');
      }
    };
    const ku = e => { const k=norm(e); if(combat(k)){e.preventDefault();key[k]=false;} };
    window.addEventListener('keydown',kd,{capture:true}); window.addEventListener('keyup',ku,{capture:true});

    const originalHit = window.hit;
    window.hit = (attacker, defender, damage, stun, knock, label) => {
      if(defender && isBlocking(defender)){
        state.guards++; defender.st=Math.min(defender.st||0,4); defender.vx=(defender.vx||0)*0.35; defender.armor=Math.max(defender.armor||0,6); window.txt?.(defender.x+21,defender.y-14,'格挡','guard'); window.burst?.(defender.x+21,defender.y+28,8,'#d8c9a6',2.4); return;
      }
      const before = defender?.hp ?? 0;
      originalHit(attacker,defender,damage,stun,knock,label);
      if(defender && defender.hp < before){ state.hits++; if((defender.y||0)<(window.G||438)-defender.h-4)state.airHits++; }
    };

    const originalUpdate = window.update;
    window.update = (f,dt) => {
      originalUpdate(f,dt);
      if(!f || !window.S.run) return;
      const m=map[f.slot];
      const left=!!key[m.left], right=!!key[m.right], up=!!key[m.up];
      const grounded=isGrounded(f);
      const axis=(right?1:0)-(left?1:0);
      if(f.st<=0 && f.lock<=0 && f.skillBusy<=0){
        if(axis){
          const accel=f.sp*0.48;
          f.x += axis*accel;
          f.f = axis>0?1:-1;
          f.face=f.f;
          state.moves++;
        }
        if(up && grounded && f._coreJump!==true){ f.vy=-f.jp; f._coreJump=true; state.jumps++; }
        if(!up)f._coreJump=false;
      }
      if(f.x<24)f.x=24; if(f.x>window.W-f.w-24)f.x=window.W-f.w-24;
      const e=enemy(f);
      if(e && state.lockOn && f.st<=0 && f.lock<=0 && Math.abs((e.x||0)-(f.x||0))<190){ f.f=((e.x||0)>f.x)?1:-1; f.face=f.f; }
      f._coreGuard=isBlocking(f);
    };

    const reset = () => { state.actions=0;state.moves=0;state.jumps=0;state.guards=0;state.reversals=0;state.hits=0;state.airHits=0;state.lastAction=''; Object.keys(key).forEach(k=>key[k]=false); };
    const s0=window.start,r0=window.rematch,b0=window.back;
    window.start=(...a)=>{reset();return s0?.(...a);}; window.rematch=(...a)=>{reset();return r0?.(...a);}; window.back=(...a)=>{reset();return b0?.(...a);};

    window.BIBLE_FIGHTER_COMBAT_CORE_READY=true;
    window.BIBLE_FIGHTER_COMBAT_CORE_API={snapshot:()=>({version:state.version,actions:state.actions,moves:state.moves,jumps:state.jumps,guards:state.guards,reversals:state.reversals,hits:state.hits,airHits:state.airHits,lastAction:state.lastAction,p1:window.A?{x:window.A.x,y:window.A.y,hp:window.A.hp,f:window.A.f,blocking:!!window.A._coreGuard}:null,p2:window.B?{x:window.B.x,y:window.B.y,hp:window.B.hp,f:window.B.f,blocking:!!window.B._coreGuard}:null})};
    return true;
  };
  if(!boot()){let tries=0;const timer=setInterval(()=>{tries++;if(boot()||tries>=120)clearInterval(timer);},50);}
})();
