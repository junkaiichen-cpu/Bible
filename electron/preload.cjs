const { contextBridge, shell } = require('electron');

const APP_VERSION = '1.2.9';
const UPDATE_JSON_URL = 'https://raw.githubusercontent.com/junkaiichen-cpu/Bible/main/data/update.json';

const originalGetElementById = document.getElementById.bind(document);
const legacyIds = new Map([
  ['aboutBtn', 'button'], ['closeAbout', 'button'], ['aboutDialog', 'dialog'], ['fightLoreTitle', 'div'], ['fightLore', 'div']
]);
const ensureLegacyNode = (id) => { const existing = originalGetElementById(id); if (existing) return existing; const tag = legacyIds.get(id); if (!tag) return null; const node = document.createElement(tag); node.id=id; node.hidden=true; const parent=document.body||document.documentElement; if(parent) parent.appendChild(node); return node; };
document.getElementById = function getElementByIdCompat(id){ return originalGetElementById(id)||ensureLegacyNode(id); };

const compareVersions = (a,b) => {
  const pa=String(a||'0').split('.').map(Number); const pb=String(b||'0').split('.').map(Number);
  for(let i=0;i<3;i++){ const av=pa[i]||0, bv=pb[i]||0; if(av!==bv) return av>bv?1:-1; }
  return 0;
};
const checkForUpdate = async () => {
  try {
    const response = await fetch(UPDATE_JSON_URL, { cache:'no-store' });
    if (!response.ok) return { error:`HTTP ${response.status}`, available:false, version:APP_VERSION };
    const remote = await response.json();
    return { available:compareVersions(remote.version, APP_VERSION)>0, version:remote.version||APP_VERSION, build:remote.build||'', download:remote.download||'', notes:Array.isArray(remote.notes)?remote.notes:[] };
  } catch (error) { return { error:String(error), available:false, version:APP_VERSION }; }
};

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

contextBridge.exposeInMainWorld('BIBLE_FIGHTER_DESKTOP', {
  version: APP_VERSION,
  updateUrl: UPDATE_JSON_URL,
  checkForUpdate,
  openDownload:(url)=>shell.openExternal(url)
});
