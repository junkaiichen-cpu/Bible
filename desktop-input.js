/* PC combat input layer for Bible Fighter 1.5.1.
 * Target layout: 1P J/U/I/O/K/L/Space and 2P numpad 1/4/5/6/2/3/0.
 * The legacy P2 row-number bindings remain in game45.js; this layer adds the numpad layout.
 * This intentionally does not add controller support.
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

  window.addEventListener('keydown', (e) => {
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

  window.addEventListener('keyup', (e) => {
    if (!handled.has(e.code)) return;
    handled.delete(e.code);
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
})();
