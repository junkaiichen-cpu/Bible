/* Desktop combat input compatibility layer.
 * Keeps the existing Build 10 bindings while adding the common PC layout used by the target fighting-game style.
 * Loaded before game7.js so target keys are handled through the game's public `act()` command router.
 */
(function () {
  const handled = new Set();
  const p1 = {
    KeyJ: 'a',
    KeyU: 's1',
    KeyI: 's2',
    Space: 'r',
    KeyO: 'u',
    KeyK: 'c',
    KeyL: 'h'
  };
  const p2 = {
    Numpad1: 'a',
    Numpad4: 's1',
    Numpad5: 's2',
    Numpad0: 'r',
    Numpad6: 'u',
    Numpad2: 'c',
    Numpad3: 'h'
  };

  window.addEventListener('keydown', function (e) {
    if (e.repeat) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    const action = p1[e.code] || p2[e.code];
    if (!action || typeof window.act !== 'function') return;
    const slot = p1[e.code] ? 'p1' : 'p2';
    handled.add(e.code);
    e.preventDefault();
    e.stopImmediatePropagation();
    window.act(slot, action);
  }, true);

  window.addEventListener('keyup', function (e) {
    if (handled.has(e.code)) {
      handled.delete(e.code);
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
})();
