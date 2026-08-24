(() => {
  'use strict';
  if (window.BIBLE_FIGHTER_COOLDOWN_READY) return;
  const boot = () => {
    if (window.BIBLE_FIGHTER_COOLDOWN_READY) return true;
    if (!window.S || !window.A || !window.B || typeof window.act !== 'function') return false;
    const state = window.BIBLE_FIGHTER_COOLDOWNS = window.BIBLE_FIGHTER_COOLDOWNS || {version:'1.4.5',ready:true,clock:performance.now(),slots:{}};
    const now=()=>performance.now();
    const durations={s1:900,s2:1200,r:10000,c:7000};
    const key=(slot,action)=>`${slot}:${action}`;
    const remaining=(slot,action)=>Math.max(0,(state.slots[key(slot,action)]||0)-now());
    const arm=(slot,action,ms)=>{state.slots[key(slot,action)]=now()+ms;};
    const fighter=slot=>slot==='p1'?window.A:window.B;
    const baseAct=window.act;
    window.act=(slot,action)=>{
      const f=fighter(slot); if(!f)return;
      const cd=remaining(slot,action);
      if(cd>0&&['s1','s2','r','c'].includes(action)){f._cooldownRejected=action;f._cooldownRejectedAt=now();return;}
      const before={cd1:f.cd1||0,cd2:f.cd2||0,subCd:f.subCd||0,scrollCd:f.scrollCd||0};
      baseAct(slot,action);
      if(action==='s1'&&(f.cd1||0)>before.cd1)arm(slot,action,durations.s1);
      if(action==='s2'&&(f.cd2||0)>before.cd2)arm(slot,action,durations.s2);
      if(action==='r'&&(f.subCd||0)>before.subCd)arm(slot,action,durations.r);
      if(action==='c'&&(f.scrollCd||0)>before.scrollCd)arm(slot,action,durations.c);
    };
    const reset=()=>{state.slots={};state.clock=now();};
    const baseStart=window.start,baseRematch=window.rematch,baseBack=window.back;
    window.start=(...args)=>{reset();return baseStart?.(...args);};
    window.rematch=(...args)=>{reset();return baseRematch?.(...args);};
    window.back=(...args)=>{reset();return baseBack?.(...args);};
    const ensureStyle=()=>{
      if(document.getElementById('bibleCooldownStyle'))return;
      const style=document.createElement('style');style.id='bibleCooldownStyle';
      style.textContent=`.cooldown-panel{position:absolute;right:14px;bottom:118px;z-index:9;width:250px;padding:8px 10px;background:rgba(9,7,5,.88);border:1px solid #3f3020;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.28);font-family:inherit;pointer-events:none}.cooldown-title{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#b9a27c;margin-bottom:7px}.cooldown-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}.cooldown-grid>div{padding:6px 7px;border:1px solid #2f251a;border-radius:5px;background:#120d08;color:#8f8067;font-size:9px;font-weight:700}.cooldown-grid>div.ready{color:#dfc88d;border-color:#695238}.cooldown-grid>div.cooling{color:#88745a}.skill-slot.on-cd{filter:saturate(.45);opacity:.72}.skill-slot.on-cd::after{content:attr(data-cooldown) 's';position:absolute;inset:auto 6px 5px auto;padding:1px 3px;background:rgba(8,6,4,.88);border-radius:3px;color:#e4c98b;font-size:9px;font-weight:800}`;
      document.head.appendChild(style);
    };
    const format=ms=>ms<=0?'READY':`${(ms/1000).toFixed(1)}s`;
    const ensurePanel=()=>{ensureStyle();if(document.querySelector('.cooldown-panel'))return;const wrap=document.querySelector('.game-wrap');if(!wrap)return;const panel=document.createElement('aside');panel.className='cooldown-panel';panel.innerHTML='<div class="cooldown-title">战斗时间 / CD</div><div class="cooldown-grid"><div id="cdS1">技能1 READY</div><div id="cdS2">技能2 READY</div><div id="cdSub">替身 READY</div><div id="cdScroll">密卷 READY</div></div>';wrap.appendChild(panel);};
    const refreshUi=()=>{ensurePanel();const f=window.A;if(!f)return;const set=(id,label,ms)=>{const el=document.getElementById(id);if(!el)return;el.textContent=`${label} ${format(ms)}`;el.classList.toggle('ready',ms<=0);el.classList.toggle('cooling',ms>0);};const p1={s1:remaining('p1','s1'),s2:remaining('p1','s2'),r:remaining('p1','r'),c:remaining('p1','c')};set('cdS1','技能1',p1.s1);set('cdS2','技能2',p1.s2);set('cdSub','替身',p1.r);set('cdScroll','密卷',p1.c);for(const [id,a] of [['skill1','s1'],['skill2','s2'],['skillSub','r'],['skillScroll','c']]){const el=document.getElementById(id);if(!el)continue;const ms=p1[a];el.classList.toggle('on-cd',ms>0);el.dataset.cooldown=ms>0?(ms/1000).toFixed(1):'READY';}f._cdSnapshot={skill1:p1.s1,skill2:p1.s2,substitute:p1.r,scroll:p1.c};};
    window.BIBLE_FIGHTER_COOLDOWN_READY=true;
    window.BIBLE_FIGHTER_COOLDOWN_API={snapshot:()=>({version:state.version,now:now(),p1:{s1:remaining('p1','s1'),s2:remaining('p1','s2'),r:remaining('p1','r'),c:remaining('p1','c')}})};
    const loop=()=>{refreshUi();requestAnimationFrame(loop);};loop();return true;
  };
  const timer=setInterval(()=>{if(boot())clearInterval(timer);},50);boot();
})();
