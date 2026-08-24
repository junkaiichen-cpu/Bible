(() => {
  'use strict';

  const ensure = (id, tag = 'div') => {
    let node = document.getElementById(id);
    if (!node) {
      node = document.createElement(tag);
      node.id = id;
      node.hidden = true;
      document.body.appendChild(node);
    }
    return node;
  };

  // Build 18's game7 layer still expects a few optional legacy HUD nodes.
  // Keep the new playtest screen lean while preventing those optional hooks
  // from aborting the core character-selection initialization.
  ensure('aboutBtn', 'button');
  ensure('closeAbout', 'button');
  ensure('aboutDialog', 'dialog');
  ensure('fightLoreTitle', 'div');
  ensure('fightLore', 'div');
})();
