(() => {
  'use strict';
  const boot = () => {
    if (!window.refreshSelect || !window.BIBLE_ROSTER || document.querySelector('[data-david-selection-layer]')) return;
    const select = document.querySelector('#selectScreen');
    if (!select) return;
    const panel = document.createElement('section');
    panel.dataset.davidSelectionLayer = '1';
    panel.className = 'character-showcase';
    panel.innerHTML = `
      <div class="showcase-copy">
        <div class="showcase-eyebrow">CHARACTER SHOWCASE · 1.3</div>
        <h3 id="showcaseTitle">选择你的圣经人物</h3>
        <p id="showcaseDescription">每名人物都有独立的战斗节奏、技能主题和经文锚点。</p>
        <div class="showcase-route" id="showcaseRoute">选择角色后查看战斗定位</div>
      </div>
      <div class="showcase-statbox">
        <div class="showcase-stat"><span>定位</span><strong id="showcaseRole">—</strong></div>
        <div class="showcase-stat"><span>经文</span><strong id="showcaseAnchor">—</strong></div>
        <div class="showcase-skills" id="showcaseSkills"></div>
      </div>
      <div class="showcase-stage">
        <div class="stage-preview-title">STAGE PREVIEW</div>
        <div class="stage-preview" id="stagePreview"><i></i><b></b><em></em><span>以拉谷</span></div>
      </div>`;
    select.querySelector('.player-selects')?.after(panel);

    const info = (id) => window.BIBLE_ROSTER[id] || null;
    const update = () => {
      const id = window.S?.pick?.p1 || 'david';
      const c = info(id); if (!c) return;
      const title = document.querySelector('#showcaseTitle');
      const desc = document.querySelector('#showcaseDescription');
      const role = document.querySelector('#showcaseRole');
      const anchor = document.querySelector('#showcaseAnchor');
      const route = document.querySelector('#showcaseRoute');
      const skills = document.querySelector('#showcaseSkills');
      if (title) title.textContent = `${c.name} · ${c.title}`;
      if (desc) desc.textContent = Array.isArray(c.facts) ? c.facts.slice(0, 2).join(' · ') : '';
      if (role) role.textContent = c.role;
      if (anchor) anchor.textContent = c.anchor;
      if (route) route.textContent = `${c.name}：${(c.moves || []).slice(0, 3).join(' · ')}`;
      if (skills) skills.innerHTML = (c.moves || []).slice(0, 4).map((m, i) => `<span><b>${i + 1}</b>${m}</span>`).join('');
      const stage = document.querySelector('#stagePreview');
      if (stage) {
        stage.classList.toggle('red-sea', id === 'moses');
        stage.querySelector('span').textContent = id === 'moses' ? '红海 · 旷野边界' : (id === 'david' ? '以拉谷' : '圣经战场');
      }
    };
    const decorate = () => {
      document.querySelectorAll('.char-card').forEach((card) => {
        if (card.dataset.showcaseDecorated) return;
        card.dataset.showcaseDecorated = '1';
        const id = Object.keys(window.BIBLE_ROSTER).find((key) => card.textContent.includes(window.BIBLE_ROSTER[key].name));
        const c = id && window.BIBLE_ROSTER[id]; if (!c) return;
        const avatar = card.querySelector('.avatar');
        if (avatar) {
          avatar.textContent = '';
          avatar.innerHTML = `<span class="pixel-head"></span><span class="pixel-body"></span><span class="pixel-weapon"></span>`;
          avatar.dataset.fighter = id;
        }
        const role = card.querySelector('.char-main span');
        if (role) role.textContent = c.role;
      });
      update();
    };
    const original = window.refreshSelect;
    window.refreshSelect = (...args) => { const r = original(...args); requestAnimationFrame(decorate); return r; };
    window.refreshSelect();
    decorate();
    document.addEventListener('click', (e) => {
      if (e.target.closest('.char-card')) requestAnimationFrame(() => { decorate(); update(); });
    });
    window.BIBLE_FIGHTER_SELECTION_SHOWCASE_READY = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
