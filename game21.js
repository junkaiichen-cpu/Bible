(() => {
  'use strict';

  const boot = () => {
    if (!window.S || !window.BIBLE_ROSTER) return;
    const wrap = document.querySelector('.game-wrap');
    const hud = wrap?.querySelector('.hud');
    if (!wrap || !hud || document.querySelector('.combat-identity-layer')) return;

    const layer = document.createElement('div');
    layer.className = 'combat-identity-layer';
    layer.innerHTML = `
      <div class="identity-card p1" id="identityP1">
        <div class="identity-avatar" id="identityP1Avatar">大</div>
        <div class="identity-copy"><strong id="identityP1Name">大卫</strong><span id="identityP1Role">牧羊人</span><small id="identityP1Anchor">撒母耳记上 17</small></div>
        <div class="identity-status" id="identityP1Status">READY</div>
      </div>
      <div class="identity-card p2" id="identityP2">
        <div class="identity-avatar" id="identityP2Avatar">摩</div>
        <div class="identity-copy"><strong id="identityP2Name">摩西</strong><span id="identityP2Role">先知 / 领袖</span><small id="identityP2Anchor">出埃及记 14</small></div>
        <div class="identity-status" id="identityP2Status">READY</div>
      </div>`;
    hud.appendChild(layer);

    const $ = (id) => document.getElementById(id);
    const setIdentity = (slot, f) => {
      if (!f) return;
      const r = window.BIBLE_ROSTER[f.id];
      if (!r) return;
      const p = slot === 'p1' ? 'P1' : 'P2';
      $(`identity${p}Avatar`).textContent = r.name.slice(0, 1);
      $(`identity${p}Name`).textContent = r.name;
      $(`identity${p}Role`).textContent = r.role;
      $(`identity${p}Anchor`).textContent = r.anchor;
      const status = f.inv > 0 ? 'INVINCIBLE' : f.st > 0 ? 'HITSTUN' : f.armor > 0 ? 'ARMOR' : f.attackCtx ? 'ATTACK' : S.run ? 'FIGHT' : 'READY';
      $(`identity${p}Status`).textContent = status;
      $(`identity${p}Status`).className = `identity-status ${status.toLowerCase()}`;
      $(`identity${p}`).classList.toggle('active', S.run);
    };

    const updateMissionReward = () => {
      const panel = document.querySelector('.mission-panel');
      const ms = S.mission;
      if (!panel || !ms) return;
      let reward = panel.querySelector('.mission-reward');
      if (!reward) {
        reward = document.createElement('div');
        reward.className = 'mission-reward';
        panel.appendChild(reward);
      }
      if (ms.complete) {
        reward.textContent = '✦ 经文线索已解锁 · 记录到人物档案';
        reward.classList.add('unlocked');
      } else {
        reward.textContent = '完成任务后解锁经文线索';
        reward.classList.remove('unlocked');
      }
    };

    const updateSkillLabels = () => {
      if (!A) return;
      const names = [A.skill?.[0] || '技能1', A.skill?.[1] || '技能2'];
      const n1 = document.querySelector('#skill1 .skill-name');
      const n2 = document.querySelector('#skill2 .skill-name');
      if (n1) n1.textContent = names[0];
      if (n2) n2.textContent = names[1];
      const ult = document.querySelector('#skillUlt .skill-name');
      if (ult) ult.textContent = A.ult || '奥义';
      const sub = document.querySelector('#skillSub .skill-name');
      if (sub) sub.textContent = `替身 × ${A.sub ?? 0}`;
      const helper = document.querySelector('#skillHelper .skill-name');
      if (helper) helper.textContent = A.helperUsed ? '已用' : '帮手';
      const scroll = document.querySelector('#skillScroll .skill-name');
      if (scroll) {
        const s = window.BIBLE_SUPPORTS?.scrolls?.[A.scroll];
        scroll.textContent = s?.name || '密卷';
      }
    };

    const update = () => {
      setIdentity('p1', window.A);
      setIdentity('p2', window.B);
      updateMissionReward();
      updateSkillLabels();
      const map = document.querySelector('#miniMap');
      if (map && window.A && window.B) map.dataset.distance = Math.round(Math.abs(window.A.x - window.B.x));
      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
