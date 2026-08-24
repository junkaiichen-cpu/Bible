const { contextBridge, shell } = require('electron');
const APP_VERSION='1.5.0';
const UPDATE_JSON_URL='https://raw.githubusercontent.com/junkaiichen-cpu/Bible/main/data/update.json';
const syncVersionUi=()=>{document.title=`约谷 · Bible Fighter ${APP_VERSION}`;const eyebrow=[...document.querySelectorAll('.eyebrow')].find(el=>/BIBLE FIGHTER/.test(el.textContent||''));if(eyebrow)eyebrow.textContent=`BIBLE FIGHTER · ${APP_VERSION} · LOCAL 2P`;};
const mount=(src,key)=>{const body=document.body||document.documentElement;if(!body||document.querySelector(`script[src="${src}"]`))return;const s=document.createElement('script');s.src=src;s.dataset[key]='1';body.appendChild(s);};
const boot=()=>{syncVersionUi();mount('data/update-manifest.js','bibleManifest');mount('game43.js','davidPolish');mount('game44.js','cooldown');mount('game45.js','realCombat');mount('game46.js','combatCore');mount('game47.js','verticalSlice');};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
contextBridge.exposeInMainWorld('BIBLE_FIGHTER_DESKTOP',{version:APP_VERSION,updateUrl:UPDATE_JSON_URL,openDownload:url=>shell.openExternal(url)});
