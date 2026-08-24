(() => {
  'use strict';

  const boot = () => {
    if (!window.S || typeof window.update !== 'function' || typeof window.act !== 'function' || typeof window.hit !== 'function') return;

    const baseAct = window.act;
    const baseUpdate = window.update;
    const baseHit = window.hit;
    const feel = window.BIBLE_FIGHTER_COMBAT_FEEL = window.BIBLE_FIGHTER_COMBAT_FEEL || {
      version: '1.3.2',
      inputBufferFrames: 10,
      hitStopFrames: 0,
      comboWindowFrames: 0,
      lastAction: '',
      lastHitLabel: '',
      impactLevel: 0,
      perfectInputCount: 0
    };

    const combatAction = (action) => ['a','s1','s2','d','r','u','c','h'].includes(action);
    const fighter = (slot) => slot === 'p1' ? window.A : window.B;

    const queueInput = (f, action) => {
      if (!f || !combatAction(action)) return false;
      f.inputBuffer = { action, ttl: feel.inputBufferFrames };
      feel.lastAction = `${f.slot}:${action}`;
      return true;
    };

    window.act = (slot, action) => {
      const f = fighter(slot);
      if (f && combatAction(action) && (f.lock > 0 || f.st > 0 || f.skillBusy > 0 || f.atk > 0)) {
        return queueInput(f, action);
      }
      baseAct(slot, action);
      if (f && combatAction(action)) f.lastInputAction = action;
    };

    window.hit = (attacker, defender, damage, stun, knock, label) => {
      const wasHp = defender?.hp ?? 0;
      baseHit(attacker, defender, damage, stun, knock, label);
      const dealt = defender && defender.hp < wasHp;
      if (!dealt) return;

      const heavy = Number(knock || 0) >= 14 || String(label || '').includes('重击');
      const impactX = (attacker?.x || 0) + (attacker?.f || 1) * 34;
      const impactY = (attacker?.y || 0) + 32;
      if (typeof window.burst === 'function') window.burst(impactX, impactY, heavy ? 18 : 10, heavy ? '#f2d08a' : (attacker?.color || '#d4b77a'), heavy ? 4 : 2.6);
      if (typeof window.ring === 'function') window.ring(impactX, impactY, heavy ? 26 : 18, heavy ? '#f5dda0' : '#d6bc7d');
      if (typeof window.txt === 'function') window.txt(impactX, impactY - 20, heavy ? '重击确认' : '命中', heavy ? 'heavy' : 'hit');
      window.S.shake = Math.max(window.S.shake || 0, heavy ? 8 : 4);
      feel.hitStopFrames = heavy ? 5 : 3;
      feel.impactLevel = heavy ? 2 : 1;
      feel.lastHitLabel = String(label || '命中');
      feel.comboWindowFrames = 24;
    };

    window.update = (f, dt) => {
      if (feel.hitStopFrames > 0) {
        if (f?.slot === 'p1') feel.hitStopFrames -= 1;
        return;
      }

      baseUpdate(f, dt);
      if (!f) return;

      const e = f.slot === 'p1' ? window.B : window.A;
      if (e && f.st <= 0 && f.lock <= 0 && f.skillBusy <= 0) {
        f.f = e.x >= f.x ? 1 : -1;
      }

      if (f.inputBuffer) {
        f.inputBuffer.ttl -= 1;
        if (f.inputBuffer.ttl <= 0) f.inputBuffer = null;
        else if (f.lock <= 0 && f.st <= 0 && f.skillBusy <= 0 && f.atk <= 0) {
          const next = f.inputBuffer.action;
          f.inputBuffer = null;
          feel.perfectInputCount += 1;
          baseAct(f.slot, next);
        }
      }

      if (f.slot === 'p1') {
        feel.comboWindowFrames = Math.max(0, feel.comboWindowFrames - 1);
        if (feel.comboWindowFrames === 0) feel.impactLevel = 0;
      }
    };

    window.BIBLE_FIGHTER_COMBAT_FEEL_READY = true;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
