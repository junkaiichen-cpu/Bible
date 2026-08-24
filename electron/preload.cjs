const { contextBridge } = require('electron');

const originalGetElementById = document.getElementById.bind(document);
const legacyIds = new Map([
  ['aboutBtn', 'button'],
  ['closeAbout', 'button'],
  ['aboutDialog', 'dialog'],
  ['fightLoreTitle', 'div'],
  ['fightLore', 'div']
]);

const ensureLegacyNode = (id) => {
  const existing = originalGetElementById(id);
  if (existing) return existing;
  const tag = legacyIds.get(id);
  if (!tag) return null;
  const node = document.createElement(tag);
  node.id = id;
  node.hidden = true;
  const parent = document.body || document.documentElement;
  if (parent) parent.appendChild(node);
  return node;
};

document.getElementById = function getElementByIdCompat(id) {
  return originalGetElementById(id) || ensureLegacyNode(id);
};

contextBridge.exposeInMainWorld('BIBLE_FIGHTER_DESKTOP', { version: '1.0.3' });
