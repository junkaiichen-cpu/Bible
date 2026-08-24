(() => {
  'use strict';
  const boot = () => {
    if (document.querySelector('[data-combat-presentation]')) return;
    const wrap = document.querySelector('.game-wrap');
    if (!wrap || !window.S) return;
    const layer = document.createElement('div');
    layer.dataset.combatPresentation = '1';
    layer.className = 'combat-presentation';
    layer.innerHTML = `
      <div class="combat-topline">
        <div class="combat-player-card p1"><div class="cp-avatar" id="cpAvatar1"></div><div><strong id="cpName1">大卫</strong><small id="cpTitle1">牧羊人 · 诗人 · 王</small></div></div>
        <div class="combat-center-badge"><span id="cpRound">ROUND 1</span><b id="cpScore">0 — 0</b><em id="cpStage">以拉谷</em></div>
        <div class="combat-player-card p2"><div class="cp-avatar" id="cpAvatar2"></div><div><strong id="cpName2">摩西</strong><small id="cpTitle2">先知 · 带领者</small></div></div>
      </div>
      <div class="combat-objective" id="combatObjective"><b>本场目标</b><span>—</span></div>
      <div class="combat-status-line"><span id="combatState">READY</span><i id="combatFrameState">60 FPS · 16.7ms</i><em id="combatRoute">DAVID · 基础五击</em></div>`;
    wrap.appendChild(layer);

    const byId = (id) => document.getElementById(id);
    const setPlayer = (n, f) => {
      const roster = window.BIBLE_ROSTER?.[f?.id]; if (!roster) return;
      byId(`cpName${n}`).textContent = roster.name;
      byId(`cpTitle${n}`).textContent = roster.title;
      const av = byId(`cpAvatar${n}`); if (av) { av.dataset.id = f.id; av.innerHTML = `<span></span><i></i>`; }
    };
    const refresh = () => {
      if (!window.A || !window.B) return;
      setPlayer(1, window.A); setPlayer(2, window.B);
      byId('cpRound').textContent = `ROUND ${window.S.r || 1}`;
      byId('cpScore').textContent = `${window.S.score?.[0] || 0} — ${window.S.score?.[1] || 0}`;
      const stage = document.querySelector('#mapName')?.textContent || (window.B.id === 'moses' || window.A.id === 'moses' ? '红海 · 旷野边界' : '以拉谷');
      byId('cpStage').textContent = stage;
      const m = window.BIBLE_MISSIONS?.[window.A.id];
      byId('combatObjective').querySelector('span').textContent = m?.objective || '击败对手，完成本场人物任务。';
      const state = window.S?.run ? (window.A.st > 0 ? 'HITSTUN' : window.A.inv > 0 ? 'INVINCIBLE' : window.A.atk > 0 ? 'ATTACK' : 'FIGHT') : 'READY';
      byId('combatState').textContent = state;
      const q = window.BIBLE_FIGHTER_QUALITY?.snapshot?.();
      byId('combatFrameState').textContent = q ? `${q.fps} FPS · ${q.frameMs}ms · DPR ${q.dpr}` : '60 FPS · 16.7ms';
      const route = window.BIBLE_FIGHTER_DAVID_SHOWCASE?.route || (window.A.id === 'david' ? '基础五击' : '角色战斗');
      byId('combatRoute').textContent = `${window.A.id === 'david' ? 'DAVID' : String(window.A.id).toUpperCase()} · ${route}`;
    };
    const loop = () => { refresh(); requestAnimationFrame(loop); };
    loop();
    window.BIBLE_FIGHTER_COMBAT_PRESENTATION_READY = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
