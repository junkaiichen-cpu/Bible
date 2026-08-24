(() => {
  'use strict';

  const boot = () => {
    if (!window.S || !window.BIBLE_CODEX) return;
    const wrap = document.querySelector('.game-wrap');
    if (!wrap || document.querySelector('.codex-layer')) return;

    const layer = document.createElement('div');
    layer.className = 'codex-layer hidden';
    layer.innerHTML = `
      <div class="codex-card" role="dialog" aria-modal="true" aria-label="圣经人物档案">
        <div class="codex-kicker">BIBLE CODEX · 已解锁线索</div>
        <button class="codex-close" id="codexClose" aria-label="关闭">×</button>
        <div class="codex-head">
          <div class="codex-avatar" id="codexAvatar">大</div>
          <div><h2 id="codexTitle">人物档案</h2><span id="codexAnchor">—</span></div>
        </div>
        <p id="codexClue">完成战斗任务后，这里会出现人物线索。</p>
        <div class="codex-next" id="codexNext">—</div>
      </div>`;
    wrap.appendChild(layer);

    const $ = (id) => document.getElementById(id);
    const storageKey = 'bible-fighter-codex-v1';
    const readUnlocked = () => {
      try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
    };
    const initial = readUnlocked();
    const state = { id: null, unlocked: new Set(Object.keys(initial).filter((id) => initial[id])) };

    const persist = (id) => {
      state.unlocked.add(id);
      try {
        const next = {};
        state.unlocked.forEach((key) => { next[key] = true; });
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    };

    const render = (id) => {
      const entry = window.BIBLE_CODEX[id];
      const roster = window.BIBLE_ROSTER?.[id];
      if (!entry || !roster) return false;
      state.id = id;
      $('codexAvatar').textContent = roster.name.slice(0, 1);
      $('codexTitle').textContent = entry.title;
      $('codexAnchor').textContent = entry.anchor;
      $('codexClue').textContent = entry.clue;
      $('codexNext').textContent = entry.next;
      return true;
    };

    const showUnlocked = (id) => {
      if (!state.unlocked.has(id)) return false;
      if (!render(id)) return false;
      layer.classList.remove('hidden');
      S.paused = Boolean(S.run);
      return true;
    };

    const unlockAndShow = (id) => {
      if (!window.BIBLE_CODEX[id]) return;
      persist(id);
      if (render(id)) {
        layer.classList.remove('hidden');
        S.paused = Boolean(S.run);
      }
    };

    const hide = () => {
      layer.classList.add('hidden');
      if (S.run) S.paused = false;
    };

    $('codexClose')?.addEventListener('click', hide);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F7') {
        e.preventDefault();
        if (!A) return;
        if (layer.classList.contains('hidden')) {
          const preferred = state.unlocked.has(A.id) ? A.id : [...state.unlocked][0];
          if (preferred) showUnlocked(preferred);
        } else hide();
      }
      if (e.key === 'Escape' && !layer.classList.contains('hidden')) {
        e.preventDefault();
        hide();
      }
    });

    const observe = () => {
      const m = S.mission;
      if (m?.complete && m.id && !state.unlocked.has(m.id)) unlockAndShow(m.id);
      requestAnimationFrame(observe);
    };
    requestAnimationFrame(observe);
    window.BIBLE_FIGHTER_CODEX_READY = true;
    window.BIBLE_FIGHTER_CODEX_UNLOCKED = () => [...state.unlocked];
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
