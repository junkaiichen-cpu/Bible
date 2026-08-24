const { contextBridge } = require('electron');

// game7 expects a few optional legacy DOM nodes before its script body runs.
// Create them in preload so the current lightweight playtest HTML remains
// compatible without changing the combat engine itself.
const installLegacyUiCompatibility = () => {
  const ensure = (id, tag = 'div') => {
    let node = document.getElementById(id);
    if (!node) {
      node = document.createElement(tag);
      node.id = id;
      node.hidden = true;
      document.documentElement.appendChild(node);
    }
    return node;
  };

  ensure('aboutBtn', 'button');
  ensure('closeAbout', 'button');
  ensure('aboutDialog', 'dialog');
  ensure('fightLoreTitle', 'div');
  ensure('fightLore', 'div');
};

window.addEventListener('DOMContentLoaded', installLegacyUiCompatibility, { once: true });
contextBridge.exposeInMainWorld('BIBLE_FIGHTER_DESKTOP', { version: '1.0.3' });
