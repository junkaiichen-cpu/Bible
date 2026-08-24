(() => {
  'use strict';
  const boot = () => {
    const wrap = document.querySelector('.game-wrap');
    if (!wrap || document.querySelector('.battle-briefing-layer')) return;
    const layer = document.createElement('div');
    layer.className = 'battle-briefing-layer';
    layer.innerHTML = `<div class="briefing-kicker">BATTLE EVENT</div><div class="briefing-title" id="briefingTitle">圣经人物对决</div><div class="briefing-copy" id="briefingCopy">准备进入战场。</div><div class="briefing-objective" id="briefingObjective">目标：完成角色任务。</div>`;
    wrap.appendChild(layer);
    const title = document.getElementById('briefingTitle');
    const copy = document.getElementById('briefingCopy');
    const objective = document.getElementById('briefingObjective');
    const describe = () => {
      const a = window.A, b = window.B;
      if (!a || !b) return;
      const ra = window.BIBLE_ROSTER?.[a.id], rb = window.BIBLE_ROSTER?.[b.id];
      const mission = window.BIBLE_MISSIONS?.[a.id];
      if (!ra || !rb) return;
      title.textContent = `${ra.name} vs ${rb.name}`;
      copy.textContent = `人物锚点：${ra.anchor} · ${rb.anchor}`;
      objective.textContent = `目标：${mission?.objective || '认识人物并完成本场战斗。'}`;
      layer.classList.add('show');
      setTimeout(() => layer.classList.remove('show'), 2200);
    };
    const wrapStart = window.start;
    window.start = (...args) => { const r = wrapStart?.(...args); if (r !== false) setTimeout(describe, 120); return r; };
    window.BIBLE_FIGHTER_BRIEFING_READY = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
