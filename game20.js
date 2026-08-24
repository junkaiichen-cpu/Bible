(() => {
  'use strict';

  const boot = () => {
    if (!window.S || !window.K || !window.BIBLE_MISSIONS) return;
    const wrap = document.querySelector('.game-wrap');
    if (!wrap || document.querySelector('.combat-ui')) return;

    const ui = document.createElement('div');
    ui.className = 'combat-ui';
    ui.innerHTML = `
      <aside class="mission-panel" aria-label="战斗任务">
        <div class="mission-kicker">BATTLE MISSION · 经文任务</div>
        <div class="mission-title"><strong id="missionCharacter">等待角色</strong><span id="missionChapter">—</span></div>
        <div class="mission-objective" id="missionObjective">选择角色后开始本场任务。</div>
        <div class="mission-progress"><div class="mission-progress-bar"><i id="missionProgressBar"></i></div><b id="missionProgressText">0 / 1</b></div>
        <div class="mission-lore" id="missionLore">人物故事将在战斗中逐步展开。</div>
        <div class="mission-hint" id="missionHint">通过完成任务，获得人物故事线索。</div>
      </aside>
      <aside class="battle-map" aria-label="战场地图">
        <div class="map-title"><strong id="mapName">战场</strong><span class="map-badge">LIVE</span></div>
        <div class="mini-map valley" id="miniMap"><div class="ridge"></div><div class="route"></div><i class="map-dot p1" id="mapP1"></i><i class="map-dot p2" id="mapP2"></i></div>
        <div class="map-legend"><span id="mapRegion">区域</span><span>◆ P1　◆ P2</span></div>
        <div class="map-copy" id="mapCopy">战场位置会随角色与技能动态变化。</div>
      </aside>
      <div class="mission-toast" id="missionToast"></div>
      <div class="skill-deck" aria-label="技能栏">
        <div class="skill-slot basic" id="skillBasic"><span class="skill-key">普</span><span class="skill-icon">⚔</span><span class="skill-name">普攻</span></div>
        <div class="skill-slot" id="skill1"><span class="skill-key">K</span><span class="skill-icon">Ⅰ</span><span class="skill-name">技能1</span><span class="skill-cd" id="skill1Cd"></span></div>
        <div class="skill-slot" id="skill2"><span class="skill-key">L</span><span class="skill-icon">Ⅱ</span><span class="skill-name">技能2</span><span class="skill-cd" id="skill2Cd"></span></div>
        <div class="skill-slot" id="skillSub"><span class="skill-key">I</span><span class="skill-icon">替</span><span class="skill-name">替身</span><span class="skill-cd" id="subCd"></span></div>
        <div class="skill-slot" id="skillUlt"><span class="skill-key">O</span><span class="skill-icon">奥</span><span class="skill-name">奥义</span></div>
        <div class="skill-slot" id="skillScroll"><span class="skill-key">6</span><span class="skill-icon">卷</span><span class="skill-name">密卷</span><span class="skill-cd" id="scrollCd"></span></div>
        <div class="skill-slot" id="skillHelper"><span class="skill-key">7</span><span class="skill-icon">援</span><span class="skill-name">帮手</span></div>
        <div class="ult-meter"><i id="ultMeter"></i></div>
      </div>`;
    wrap.appendChild(ui);

    const missionState = { slot: 'p1', id: null, progress: 0, started: false, complete: false, hits: 0, skill1: 0, skill2: 0, sub: 0 };
    S.mission = missionState;

    const $id = (id) => document.getElementById(id);
    const toast = (text) => {
      const el = $id('missionToast');
      if (!el) return;
      el.textContent = text;
      el.classList.remove('show');
      void el.offsetWidth;
      el.classList.add('show');
    };

    const getMission = () => {
      const f = A;
      return f ? window.BIBLE_MISSIONS[f.id] : null;
    };

    const resetMission = () => {
      const f = A;
      const m = f ? window.BIBLE_MISSIONS[f.id] : null;
      missionState.slot = 'p1';
      missionState.id = f?.id || null;
      missionState.progress = 0;
      missionState.started = !!f;
      missionState.complete = false;
      missionState.hits = 0;
      missionState.skill1 = 0;
      missionState.skill2 = 0;
      missionState.sub = 0;
      if (m) {
        $id('missionCharacter').textContent = `${window.BIBLE_ROSTER[f.id].name} · 人物任务`;
        $id('missionChapter').textContent = m.lore;
        $id('missionObjective').textContent = m.objective;
        $id('missionLore').textContent = `目标：${m.lore}`;
        $id('missionHint').textContent = m.hint;
      }
    };

    const refreshMission = () => {
      const m = getMission();
      if (!m) return;
      const value = Math.min(m.target, missionState[m.metric] ?? missionState.progress);
      missionState.progress = value;
      const pct = Math.round((value / m.target) * 100);
      $id('missionProgressBar').style.width = `${pct}%`;
      $id('missionProgressText').textContent = `${value} / ${m.target}`;
      const objective = $id('missionObjective');
      if (value >= m.target) {
        objective.classList.add('mission-done');
        objective.textContent = '任务完成 · 经文线索已记录';
        if (!missionState.complete) {
          missionState.complete = true;
          toast(`MISSION COMPLETE · ${m.lore}`);
        }
      } else objective.classList.remove('mission-done');
    };

    const wrapStart = window.start;
    window.start = (...args) => {
      const result = wrapStart?.(...args);
      if (result !== false) {
        setTimeout(() => { resetMission(); refreshMission(); }, 40);
      }
      return result;
    };

    const wrapHit = window.hit;
    window.hit = (f, e, d, st, kn, label) => {
      const before = e?.hp ?? 0;
      wrapHit?.(f, e, d, st, kn, label);
      if (e && e.hp < before && f?.slot === missionState.slot) {
        missionState.hits += 1;
        if (/投石索|杖击|驴腮骨|火焰|书信/.test(label || '')) missionState.skill1 += 1;
        refreshMission();
      }
    };

    const wrapAct = window.act;
    window.act = (slot, action) => {
      if (slot === missionState.slot) {
        if (action === 's1') missionState.skill1 += 1;
        if (action === 's2') missionState.skill2 += 1;
        if (action === 'r') missionState.sub += 1;
        refreshMission();
      }
      return wrapAct?.(slot, action);
    };

    const mapFor = () => {
      const ids = [A?.id, B?.id];
      if (ids.includes('moses')) return { name: '红海·旷野边界', region: '出埃及路线', copy: '海水两侧形成可识别的红海战场层。', cls: 'red-sea' };
      if (ids.includes('david')) return { name: '以拉谷', region: '犹大山地', copy: '低地、山脊与中央战线构成三层战场。', cls: 'valley' };
      return { name: '圣经战场', region: '历史区域', copy: '角色位置会实时映射到小地图。', cls: 'valley' };
    };

    const updateMap = () => {
      if (!A || !B) return;
      const map = mapFor();
      const mm = $id('miniMap');
      mm.classList.toggle('red-sea', map.cls === 'red-sea');
      mm.classList.toggle('valley', map.cls !== 'red-sea');
      $id('mapName').textContent = map.name;
      $id('mapRegion').textContent = map.region;
      $id('mapCopy').textContent = map.copy;
      const px = Math.max(3, Math.min(97, (A.x / (W - A.w)) * 94 + 3));
      const qx = Math.max(3, Math.min(97, (B.x / (W - B.w)) * 94 + 3));
      const py = Math.max(18, Math.min(82, 62 - (A.y / G) * 28));
      const qy = Math.max(18, Math.min(82, 62 - (B.y / G) * 28));
      Object.assign($id('mapP1').style, { left: `${px}%`, top: `${py}%` });
      Object.assign($id('mapP2').style, { left: `${qx}%`, top: `${qy}%` });
    };

    const updateSkills = () => {
      const f = A;
      if (!f) return;
      const cd1 = Math.max(0, f.cd1 || 0);
      const cd2 = Math.max(0, f.cd2 || 0);
      const sub = Math.max(0, f.sub || 0);
      const scrollCd = Math.max(0, f.scrollCd || 0);
      const set = (id, cdId, cd, max, disabled = false) => {
        const slot = $id(id);
        if (!slot) return;
        slot.classList.toggle('on-cd', cd > 0);
        slot.classList.toggle('disabled', disabled);
        if (cdId) $id(cdId).textContent = cd > 0 ? `${Math.ceil(cd)}` : '';
      };
      set('skill1', 'skill1Cd', cd1, 32);
      set('skill2', 'skill2Cd', cd2, 54);
      set('skillSub', 'subCd', 0, 0, sub <= 0);
      $id('subCd').textContent = sub > 0 ? `${sub}` : '0';
      set('skillScroll', 'scrollCd', scrollCd, 60);
      set('skillHelper', null, 0, 0, !!f.helperUsed);
      set('skillUlt', null, 0, 0, (f.u || 0) < 100);
      $id('ultMeter').style.width = `${Math.max(0, Math.min(100, f.u || 0))}%`;
    };

    const originalArena = window.arena;
    window.arena = () => {
      originalArena?.();
      const ids = [A?.id, B?.id];
      X.save();
      if (ids.includes('moses')) {
        X.globalAlpha = 0.36;
        X.fillStyle = '#6f9dad';
        X.fillRect(72, 122, 120, G - 160);
        X.fillRect(W - 192, 122, 120, G - 160);
        X.globalAlpha = 0.78;
        X.fillStyle = '#b8d6dc';
        for (let i = 0; i < 7; i++) {
          X.fillRect(82, 140 + i * 38, 84, 3);
          X.fillRect(W - 166, 150 + i * 38, 84, 3);
        }
        X.globalAlpha = 1;
        X.fillStyle = '#c1ad7c';
        X.fillRect(W / 2 - 120, G - 92, 240, 28);
      } else {
        X.globalAlpha = 0.28;
        X.fillStyle = '#6b6250';
        X.fillRect(0, 214, W, 3);
        X.fillRect(0, 288, W, 3);
        X.fillStyle = '#4d594f';
        for (let i = 0; i < 10; i++) X.fillRect(i * 108 + 18, 192 + (i % 3) * 7, 46, 18);
        X.globalAlpha = 1;
        X.fillStyle = '#6d5635';
        X.fillRect(W / 2 - 2, 278, 4, 160);
      }
      X.restore();
    };

    const loop = () => {
      if (S.run) {
        updateSkills();
        updateMap();
        refreshMission();
      }
      requestAnimationFrame(loop);
    };

    resetMission();
    loop();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
