const { contextBridge, shell } = require('electron');

const originalGetElementById = document.getElementById.bind(document);
const legacyIds = new Map([
  ['aboutBtn', 'button'], ['closeAbout', 'button'], ['aboutDialog', 'dialog'], ['fightLoreTitle', 'div'], ['fightLore', 'div']
]);
const ensureLegacyNode = (id) => { const existing = originalGetElementById(id); if (existing) return existing; const tag = legacyIds.get(id); if (!tag) return null; const node = document.createElement(tag); node.id=id; node.hidden=true; const parent=document.body||document.documentElement; if(parent) parent.appendChild(node); return node; };
document.getElementById = function getElementByIdCompat(id){ return originalGetElementById(id)||ensureLegacyNode(id); };

const mountUpdateCenter = () => {
  const head = document.head || document.documentElement;
  const body = document.body || document.documentElement;
  if (!head || !body || document.querySelector('script[data-bible-update-manifest]')) return;
  const css = document.createElement('link'); css.rel='stylesheet'; css.href='game34.css'; css.dataset.bibleUpdate='1'; head.appendChild(css);
  const manifest = document.createElement('script'); manifest.src='data/update-manifest.js'; manifest.dataset.bibleUpdateManifest='1';
  manifest.onload = () => { const script=document.createElement('script'); script.src='game34.js'; script.dataset.bibleUpdate='1'; body.appendChild(script); };
  body.appendChild(manifest);
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountUpdateCenter, { once:true }); else mountUpdateCenter();

contextBridge.exposeInMainWorld('BIBLE_FIGHTER_DESKTOP', { version:'1.2.7', openDownload:(url)=>shell.openExternal(url) });
