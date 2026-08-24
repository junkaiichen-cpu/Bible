(() => {
  'use strict';
  const boot = () => {
    if (!window.S || !window.A || !window.B || typeof window.act !== 'function') return false;
    const state = window.BIBLE_FIGHTER_COOLDOWNS = window.BIBLE_FIGHTER_COOLDOWNS || {version:'1.4.5',ready:true,clock:performance.now(),slots:{}};
    const now = () => performance.now();
    const durations = { s1: 900, s2: 1200, r: 10000, c: 7000 };
    const key = (slot, action) => `${slot}:${action}`;
    const remaining = (slot, action) => Math.max(0, (state.slots[key(slot, action)] || 0) - now());
    const arm = (slot, action, ms) => { state.slots[key(slot, action)] = now() + ms; };
    const fighter = slot => slot === 'p1' ? window.A : window.B;
    const baseAct = window.act;
    window.act = (slot, action) => {
      const f = fighter(slot);
      if (!f) return;
      const cd = remaining(slot, action);
      if (cd > 0 && ['s1','s2','r','c'].includes(action)) {
        f._cooldownRejected = action;
        f._cooldownRejectedAt = now();
        return;
      }
      const before = {
        cd1: f.cd1 || 0,
        cd2: f.cd2 || 0,
        subCd: f.subCd || 0,
        scrollCd: f.scrollCd || 0,
        sub: f.sub || 0
      };
      baseAct(slot, action);
      if (action === 's1' && (f.cd1 || 0) > before.cd1) arm(slot, action, durations.s1);
      if (action === 's2' && (f.cd2 || 0) > before.cd2) arm(slot, action, durations.s2);
      if (action === 'r' && (f.subCd || 0) > before.subCd) arm(slot, action, durations.r);
      if (action === 'c' && (f.scrollCd || 0) > before.scrollCd) arm(slot, action, durations.c);
    };
    const reset = () => { state.slots = {}; state.clock = now(); };
    const baseStart = window.start;
    const baseRematch = window.rematch;
    const baseBack = window.back;
    window.start = (...args) => { reset(); return baseStart?.(...args); };
    window.rematch = (...args) => { reset(); return baseRematch?.(...args); };
    window.back = (...args) => { reset(); return baseBack?.(...args); };
    const format = ms => ms <= 0 ? 'READY' : `${(ms/1000).toFixed(1)}s`;
    const ensurePanel = () => {
      if (document.querySelector('.cooldown-panel')) return;
      const wrap = document.querySelector('.game-wrap'); if (!wrap) return;
      const panel = document.createElement('aside');
      panel.className='cooldown-panel';
      panel.innerHTML='<div class="cooldown-title">战斗时间 / CD</div><div class="cooldown-grid"><div id="cdS1">技能1</div><div id="cdS2">技能2</div><div id="cdSub">替身</div><div id="cdScroll">密卷</div></div>';
      wrap.appendChild(panel);
    };
    const refreshUi = () => {
      ensurePanel();
      const f = window.A; if (!f) return;
      const set = (id, label, ms, hot) => { const el=document.getElementById(id); if(!el)return; el.textContent=`${label} ${format(ms)}`; el.classList.toggle('ready',ms<=0); el.classList.toggle('cooling',ms>0); };
      set('cdS1','技能1',remaining('p1','s1')); set('cdS2','技能2',remaining('p1','s2')); set('cdSub','替身',remaining('p1','r')); set('cdScroll','密卷',remaining('p1','c'));
      const skills = [['skill1','s1'],['skill2','s2'],['skillSub','r'],['skillScroll','c']];
      for (const [id,a] of skills) { const el=document.getElementById(id); if(!el)continue; const ms=remaining('p1',a); el.classList.toggle('on-cd',ms>0); el.dataset.cooldown=(ms/1000).toFixed(1); }
      f._cdSnapshot = { skill1:remaining('p1','s1'), skill2:remaining('p1','s2'), substitute:remaining('p1','r'), scroll:remaining('p1','c') };
    };
    window.BIBLE_FIGHTER_COOLDOWN_READY = true;
    window.BIBLE_FIGHTER_COOLDOWN_API = { snapshot: () => ({version:state.version, now:now(), p1:{s1:remaining('p1','s1'),s2:remaining('p1','s2'),r:remaining('p1','r'),c:remaining('p1','c')}}) };
    const loop = () => { refreshUi(); requestAnimationFrame(loop); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});
    loop();
    return true;
  };
  const start = () => boot();
  if (!start()) { let tries=0; const timer=setInterval(()=>{tries++; if(start()||tries>=120) clearInterval(timer);},50); }
})();
