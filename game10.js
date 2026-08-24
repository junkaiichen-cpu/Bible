(() => {
  'use strict';

  const boot = () => {
    if (!window.skill1 || !window.skill2 || !window.update) return;

    const baseSkill1 = window.skill1;
    const baseSkill2 = window.skill2;
    const baseUpdate = window.update;

    const cancelWindow = (f) => f && f.attackCtx && f.attackCtx.phase === 'recovery' && f.attackCtx.timer <= 7;

    const cancelAttack = (f) => {
      if (!f || !f.attackCtx) return;
      f.attackCtx = null;
      f.bufferedAttack = 0;
      f.atk = 0;
      f.lock = 0;
    };

    window.skill1 = function (f) {
      if (cancelWindow(f)) cancelAttack(f);
      baseSkill1(f);
    };

    window.skill2 = function (f) {
      if (cancelWindow(f)) cancelAttack(f);
      baseSkill2(f);
    };

    window.update = function (f, dt) {
      baseUpdate(f, dt);
      if (!f) return;
      if (f.st > 0 && f.attackCtx) cancelAttack(f);
    };

    const flashMessage = (text) => {
      const el = document.querySelector('#centerMessage');
      if (!el) return;
      el.textContent = text;
      el.classList.remove('show');
      void el.offsetWidth;
      el.classList.add('show');
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        flashMessage('COMBAT BUILD 13');
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
