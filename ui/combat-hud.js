(()=>{
  const wrap=document.querySelector('.game-wrap');
  if(!wrap) return;
  const panel=document.createElement('div');
  panel.id='combatSupportHud';
  panel.innerHTML=`<div class="support-card p1"><b>P1 战术</b><span id="p1ScrollState">密卷 READY</span><span id="p1ArmorState">金刚体 OFF</span><span id="p1HelperState">帮手 AVAILABLE</span></div><div class="support-card p2"><b>P2 战术</b><span id="p2ScrollState">密卷 READY</span><span id="p2ArmorState">金刚体 OFF</span><span id="p2HelperState">帮手 AVAILABLE</span></div>`;
  wrap.appendChild(panel);
  const fmt=v=>Math.max(0,Math.ceil(v));
  const update=()=>{
    if(typeof A==='undefined'||typeof B==='undefined'){requestAnimationFrame(update);return;}
    const set=(f,scroll,armor,helper)=>{
      const ready=f.scrollCd<=0;
      scroll.textContent=ready?'密卷 READY':`密卷 CD ${fmt(f.scrollCd)}`;
      scroll.classList.toggle('ready',ready);
      armor.textContent=f.armor>0?'金刚体 ACTIVE':'金刚体 OFF';
      armor.classList.toggle('active',f.armor>0);
      helper.textContent=f.helperUsed?'帮手 USED':'帮手 AVAILABLE';
      helper.classList.toggle('used',!!f.helperUsed);
    };
    set(A,$('#p1ScrollState'),$('#p1ArmorState'),$('#p1HelperState'));
    set(B,$('#p2ScrollState'),$('#p2ArmorState'),$('#p2HelperState'));
    requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
})();
