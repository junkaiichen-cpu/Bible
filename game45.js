(() => {
  'use strict';
  const boot = () => {
    const canvas = document.querySelector('#game');
    if (!canvas) return false;
    const keys = Object.create(null);
    const held = Object.create(null);
    const state = window.BIBLE_FIGHTER_REAL_COMBAT = window.BIBLE_FIGHTER_REAL_COMBAT || {
      version:'1.4.6', ready:true, active:false, ticks:0, attacks:0, skills:0, hits:0, jumps:0, moves:0, blocked:0
    };
    const isBattle = () => !!window.S?.run && !!window.A && !!window.B;
    const slotFor = (code) => code === 'p1' ? window.A : window.B;
    const map = {
      p1:{left:'a',right:'d',up:'w',down:'s',attack:'j',skill1:'k',skill2:'l',sub:'i',ult:'o',scroll:'6',helper:'7'},
      p2:{left:'arrowleft',right:'arrowright',up:'arrowup',down:'arrowdown',attack:'1',skill1:'2',skill2:'3',sub:'4',ult:'5',scroll:'8',helper:'9'}
    };
    const normalize = (k) => String(k || '').toLowerCase();
    const setHeld = (k, value) => { held[normalize(k)] = value; };
    const callAction = (slot, action) => {
      const f = slotFor(slot); if (!f || !isBattle()) return false;
      const act = window.act;
      const fn = action==='attack' ? window.attack : action==='skill1' ? window.skill1 : action==='skill2' ? window.skill2 : action==='sub' ? window.sub : action==='ult' ? window.ult : action==='scroll' ? window.scroll : action==='helper' ? window.helper : null;
      try {
        if (typeof act === 'function') act(slot, ({attack:'a',skill1:'s1',skill2:'s2',sub:'r',ult:'u',scroll:'c',helper:'h'})[action]);
        else if (typeof fn === 'function') fn(f);
        else return false;
        if (action==='attack') state.attacks++;
        if (['skill1','skill2','sub','ult','scroll','helper'].includes(action)) state.skills++;
        return true;
      } catch (error) { state.lastError = String(error); return false; }
    };
    const actionEdge = (slot, action, key) => {
      const k = map[slot][key];
      if (held[k]) return;
      held[k] = true;
      if (callAction(slot, action)) keys[slot+':'+action] = performance.now();
    };
    const onKeyDown = (event) => {
      const k = normalize(event.key);
      if (['w','a','s','d','j','k','l','i','o','6','7','arrowup','arrowdown','arrowleft','arrowright','1','2','3','4','5','8','9',' '].includes(k)) {
        if (isBattle()) event.preventDefault();
      }
      setHeld(k, true);
      if (!isBattle()) return;
      for (const slot of ['p1','p2']) {
        const m = map[slot];
        if (k===m.attack) callAction(slot,'attack');
        if (k===m.skill1) callAction(slot,'skill1');
        if (k===m.skill2) callAction(slot,'skill2');
        if (k===m.sub) callAction(slot,'sub');
        if (k===m.ult) callAction(slot,'ult');
        if (k===m.scroll) callAction(slot,'scroll');
        if (k===m.helper) callAction(slot,'helper');
      }
    };
    const onKeyUp = (event) => setHeld(event.key, false);
    window.addEventListener('keydown', onKeyDown, {capture:true});
    window.addEventListener('keyup', onKeyUp, {capture:true});
    const updateFighter = (f, slot, dt) => {
      if (!f || !isBattle()) return;
      const m = map[slot];
      if (held[m.left]) { f.x -= f.sp * dt / 16.67; f.face = -1; state.moves++; }
      if (held[m.right]) { f.x += f.sp * dt / 16.67; f.face = 1; state.moves++; }
      if (held[m.up] && (f.y >= (window.G || 438)-f.h-3)) { f.vy = -f.jp; f.air = 1; state.jumps++; }
      if (held[m.down] && f.y < (window.G || 438)-f.h-3) f.vy += 0.6;
      const maxX = (window.W || 960) - f.w - 20;
      f.x = Math.max(20, Math.min(maxX, f.x));
      if (typeof f.vy === 'number') {
        f.y += f.vy;
        f.vy += 0.58;
        const ground = (window.G || 438) - f.h;
        if (f.y >= ground) { f.y=ground; f.vy=0; f.air=0; }
      }
    };
    const fallbackHitProbe = () => {
      if (!isBattle()) return;
      for (const attacker of [window.A,window.B]) {
        const defender = attacker === window.A ? window.B : window.A;
        if (!attacker || !defender || attacker.hp<=0 || defender.hp<=0) continue;
        const active = Number(attacker.atk||0)>0 && Number(attacker.st||0)<=0;
        if (!active || attacker._realCombatHitFrame === attacker.atk) continue;
        attacker._realCombatHitFrame = attacker.atk;
        const distance = Math.abs((attacker.x||0)-(defender.x||0));
        if (distance < 76 && typeof window.hit==='function') {
          const before = defender.hp;
          window.hit(attacker, defender, 4*(attacker.pw||1), 7, 6, '实时普攻');
          if (defender.hp < before) state.hits++;
        }
      }
    };
    let last=performance.now();
    const loop = (now) => {
      const dt=Math.min(40,now-last); last=now; state.active=isBattle(); state.ticks++;
      if (state.active) { updateFighter(window.A,'p1',dt); updateFighter(window.B,'p2',dt); fallbackHitProbe(); }
      requestAnimationFrame(loop);
    };
    window.BIBLE_FIGHTER_REAL_COMBAT_READY = true;
    window.BIBLE_FIGHTER_REAL_COMBAT_API = {
      snapshot: () => ({...state, p1:window.A?{x:window.A.x,y:window.A.y,hp:window.A.hp,lock:window.A.lock,atk:window.A.atk}:null, p2:window.B?{x:window.B.x,y:window.B.y,hp:window.B.hp,lock:window.B.lock,atk:window.B.atk}:null}),
      action: (slot,action) => callAction(slot,action)
    };
    requestAnimationFrame(loop);
    return true;
  };
  if (!boot()) { let tries=0; const timer=setInterval(()=>{ tries++; if (boot() || tries>=120) clearInterval(timer); },50); }
})();
