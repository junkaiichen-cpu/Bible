(() => {
  'use strict';

  const boot = () => {
    if (!window.attack || !window.skill1 || !window.skill2 || !window.update || !window.hit) return;

    const baseAttack = window.attack;
    const baseSkill1 = window.skill1;
    const baseSkill2 = window.skill2;
    const baseUpdate = window.update;
    const baseHit = window.hit;

    S.ruleLayer = 'frame-runtime-v1';
    S.frameClock = 0;
    S.skillBufferWindow = 7;
    S.juggleCap = 4;

    const phaseFor = (f) => {
      if (!f) return { phase: 'idle', timer: 0, kind: null };
      if (f.attackCtx) return { phase: f.attackCtx.phase, timer: Math.max(0, f.attackCtx.timer), kind: 'normal' };
      if (f.skillCtx) return { phase: f.skillCtx.phase || 'active', timer: Math.max(0, f.skillCtx.timer || 0), kind: 'skill' };
      if (f.st > 0) return { phase: 'hitstun', timer: f.st, kind: 'hitstun' };
      if (f.inv > 0) return { phase: 'invincible', timer: f.inv, kind: 'defense' };
      return { phase: 'idle', timer: 0, kind: null };
    };

    const sync = (f) => {
      const p = phaseFor(f);
      f.movePhase = p.phase;
      f.moveTimer = p.timer;
      f.moveKind = p.kind;
      if (f.bufferedSkill === undefined) f.bufferedSkill = null;
      if (f.protect === undefined) f.protect = 0;
      if (f.juggleCount === undefined) f.juggleCount = 0;
      if (f.juggleGrace === undefined) f.juggleGrace = 0;
    };

    window.attack = (f) => {
      if (!f) return;
      if (f.st > 0 || f.inv > 0 && f.attackCtx) return;
      baseAttack(f);
      sync(f);
      if (f.attackCtx) {
        f.moveKind = 'normal';
        f.bufferedSkill = null;
      }
    };

    const queueSkill = (f, which) => {
      if (!f || !f.attackCtx) return false;
      if (f.attackCtx.phase !== 'recovery' || f.attackCtx.timer > S.skillBufferWindow) return false;
      f.bufferedSkill = which;
      return true;
    };

    window.skill1 = (f) => {
      if (queueSkill(f, 1)) return;
      const hadAttack = Boolean(f?.attackCtx);
      baseSkill1(f);
      sync(f);
      if (!hadAttack && f) f.moveKind = 'skill';
    };

    window.skill2 = (f) => {
      if (queueSkill(f, 2)) return;
      const hadAttack = Boolean(f?.attackCtx);
      baseSkill2(f);
      sync(f);
      if (!hadAttack && f) f.moveKind = 'skill';
    };

    const originalHit = baseHit;
    window.hit = (attacker, defender, damage, stun, knock, label) => {
      if (!attacker || !defender) return originalHit(attacker, defender, damage, stun, knock, label);
      const juggle = defender.airborneTime > 0 || defender.y + defender.h < G - 2;
      if (juggle) {
        defender.juggleCount = Math.min(S.juggleCap, (defender.juggleCount || 0) + 1);
        defender.juggleGrace = 12;
      }
      let scaledStun = stun;
      let scaledKnock = knock;
      if ((defender.juggleCount || 0) >= S.juggleCap) {
        scaledStun = Math.max(2, Math.round(stun * 0.45));
        scaledKnock = Math.max(3, Math.round(knock * 0.7));
      }
      originalHit(attacker, defender, damage, scaledStun, scaledKnock, label);
      defender.protect = juggle ? 8 : Math.max(defender.protect || 0, 4);
      defender.moveKind = 'hit';
      defender.movePhase = 'hitstun';
      defender.moveTimer = defender.st;
    };

    const keyHandler = (e) => {
      if (!S.run || S.paused) return;
      const key = e.key.toLowerCase();
      const map = { k: [A, 1], l: [A, 2], '2': [B, 1], '3': [B, 2] };
      const target = map[key];
      if (!target) return;
      if (target[0]?.attackCtx?.phase === 'recovery' && target[0].attackCtx.timer <= S.skillBufferWindow) {
        e.preventDefault();
        e.stopImmediatePropagation();
        target[0].bufferedSkill = target[1];
      }
    };
    document.addEventListener('keydown', keyHandler, true);

    window.update = (f, dt) => {
      baseUpdate(f, dt);
      if (!f) return;
      S.frameClock += f.slot === 'p1' ? 1 : 0;
      if (f.protect > 0) f.protect -= 1;
      if (f.juggleGrace > 0) f.juggleGrace -= 1;
      if (f.juggleGrace === 0 && f.y + f.h >= G - 1) f.juggleCount = 0;

      sync(f);

      if (f.bufferedSkill && f.attackCtx && f.attackCtx.phase === 'recovery' && f.attackCtx.timer <= S.skillBufferWindow) {
        const which = f.bufferedSkill;
        f.bufferedSkill = null;
        f.attackCtx = null;
        f.atk = 0;
        f.lock = 0;
        requestAnimationFrame(() => {
          if (!S.run || f.st > 0) return;
          if (which === 1) baseSkill1(f); else baseSkill2(f);
          sync(f);
          f.moveKind = 'skill';
        });
      }

      if (f.attackCtx && f.attackCtx.phase === 'startup') f.moveKind = 'normal';
      if (f.attackCtx && f.attackCtx.phase === 'active') f.moveKind = 'normal-active';
      if (f.attackCtx && f.attackCtx.phase === 'recovery') f.moveKind = 'normal-recovery';
    };

    window.BIBLE_FIGHTER_FRAME_RULES = {
      version: '1.1.6',
      phaseFor,
      snapshot(f) {
        if (!f) return null;
        return {
          id: f.id,
          slot: f.slot,
          phase: f.movePhase,
          timer: f.moveTimer,
          kind: f.moveKind,
          bufferedSkill: f.bufferedSkill || null,
          juggleCount: f.juggleCount || 0,
          protect: f.protect || 0,
          cancelWindow: Boolean(f.attackCtx?.phase === 'recovery' && f.attackCtx.timer <= S.skillBufferWindow)
        };
      }
    };
    window.BIBLE_FIGHTER_FRAME_RULES_READY = true;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
