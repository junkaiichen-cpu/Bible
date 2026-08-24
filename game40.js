(() => {
  'use strict';

  const boot = () => {
    if (!window.S || typeof window.update !== 'function' || typeof window.act !== 'function' || typeof window.hit !== 'function') return;
    const baseAct = window.act;
    const baseUpdate = window.update;
    const baseHit = window.hit;

    const route = window.BIBLE_FIGHTER_DAVID_COMBO = window.BIBLE_FIGHTER_DAVID_COMBO || {
      version: '1.3.3',
      chain: [],
      chainTimer: 0,
      route: '',
      cancelWindow: 0,
      landingGrace: 0,
      airChaseReady: false,
      lastConfirm: 0
    };

    const david = (f) => f?.id === 'david';
    const fighter = (slot) => slot === 'p1' ? window.A : window.B;
    const isCombatAction = (a) => ['a','s1','s2','d','r','u','c','h'].includes(a);
    const pushChain = (action) => {
      route.chain.push(action);
      if (route.chain.length > 5) route.chain.shift();
      route.chainTimer = 28;
    };

    window.act = (slot, action) => {
      const f = fighter(slot);
      if (!f || !isCombatAction(action)) return baseAct(slot, action);
      if (david(f)) {
        const cancelable = f.lock <= 0 && f.st <= 0 && f.skillBusy <= 0 && f.atk <= 0;
        const inRecovery = f.attackCtx?.phase === 'recovery' || f.skillCtx?.phase === 'recovery';
        if (!cancelable && inRecovery && route.cancelWindow > 0) {
          f.inputBuffer = { action, ttl: 8 };
          pushChain(action);
          route.lastConfirm = performance.now();
          return;
        }
      }
      baseAct(slot, action);
      if (david(f)) pushChain(action);
    };

    window.hit = (attacker, defender, damage, stun, knock, label) => {
      const before = defender?.hp ?? 0;
      baseHit(attacker, defender, damage, stun, knock, label);
      const dealt = defender && defender.hp < before;
      if (!dealt || !david(attacker)) return;
      const text = String(label || '');
      if (text.includes('普攻')) {
        route.cancelWindow = Math.max(route.cancelWindow, 10);
        route.route = Number(attacker.step || 0) >= 4 ? '五击确认' : '基础连段';
      } else if (text.includes('投石索')) {
        route.cancelWindow = 12;
        route.route = '投石索确认';
        route.airChaseReady = true;
      } else if (text.includes('疾奔')) {
        route.cancelWindow = 14;
        route.route = '突进追击';
      }
      route.lastConfirm = performance.now();
    };

    window.update = (f, dt) => {
      baseUpdate(f, dt);
      if (!f) return;

      if (route.cancelWindow > 0 && f.slot === 'p1') route.cancelWindow -= 1;
      if (route.chainTimer > 0 && f.slot === 'p1') route.chainTimer -= 1;
      if (route.landingGrace > 0) route.landingGrace -= 1;
      if (route.chainTimer === 0 && route.chain.length) route.chain.length = 0;

      if (!david(f)) return;
      const wasAirborne = Number(f.y || 0) < Number(window.G || 438) - f.h - 3;

      // David's landing is slightly forgiving so a buffered follow-up can connect immediately after an air hit.
      if (wasAirborne && Number(f.y || 0) >= Number(window.G || 438) - f.h - 3) {
        route.landingGrace = 5;
      }

      // Landing grace lets a buffered follow-up survive a one-frame landing transition.
      if (route.landingGrace > 0 && f.inputBuffer && f.lock <= 0 && f.st <= 0 && f.skillBusy <= 0) {
        const next = f.inputBuffer.action;
        f.inputBuffer = null;
        baseAct(f.slot, next);
        pushChain(next);
      }

      if (f.slot === 'p1') {
        const e = window.B;
        const close = e && Math.abs((e.x || 0) - (f.x || 0)) < 118;
        if (close && f.y < window.G - f.h - 6 && (f.juggleCount || 0) < 3) route.airChaseReady = true;
        if (!close && route.chainTimer === 0) route.airChaseReady = false;
      }
    };

    window.BIBLE_FIGHTER_DAVID_COMBO_READY = true;
    window.BIBLE_FIGHTER_DAVID_COMBO_API = {
      snapshot: () => ({ ...route, chain: [...route.chain] })
    };
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
