(() => {
  'use strict';
  const boot = () => {
    if (!window.BIBLE_FIGHTER_UPDATE_READY) { setTimeout(boot, 50); return; }
    const manifest = window.BIBLE_FIGHTER_UPDATE_MANIFEST;
    const desktop = window.BIBLE_FIGHTER_DESKTOP || {};
    const currentVersion = desktop.version || manifest.version;
    const root = document.createElement('section');
    root.id = 'updateCenter';
    root.className = 'update-center';
    root.innerHTML = `<div class="update-center-head"><div><span class="eyebrow">UPDATE CENTER</span><h3>Bible Fighter 更新中心</h3></div><button type="button" id="updateClose" class="ghost-btn">关闭</button></div><div class="update-current"><strong>当前版本 ${currentVersion}</strong><span id="updateBuild">${manifest.build}</span><small>Windows x64 · ${manifest.channel}</small></div><div class="update-status" id="updateStatus">稳定版 ${manifest.version} · ${manifest.published}</div><ul class="update-notes" id="updateNotes">${manifest.notes.map((n) => `<li>${n}</li>`).join('')}</ul><div class="update-actions"><button type="button" id="updateCheck" class="primary-btn">检查更新</button><button type="button" id="updateOpen" class="ghost-btn">打开下载页</button></div>`;
    document.body.appendChild(root);
    const status = document.getElementById('updateStatus');
    const compare = (a,b) => { const pa=String(a).split('.').map(Number), pb=String(b).split('.').map(Number); for(let i=0;i<3;i++){const av=pa[i]||0,bv=pb[i]||0;if(av!==bv)return av>bv?1:-1;}return 0; };
    const applyManifest = (m) => { if(!m)return; document.getElementById('updateBuild').textContent=m.build||manifest.build; document.getElementById('updateNotes').innerHTML=(m.notes||manifest.notes).map((n)=>`<li>${n}</li>`).join(''); window.BIBLE_FIGHTER_LIVE_UPDATE=m; return m; };
    const check = async () => { status.textContent='检查更新中…'; try { const response=await fetch('https://raw.githubusercontent.com/junkaiichen-cpu/Bible/main/data/update.json',{cache:'no-store'}); if(!response.ok)throw new Error(`HTTP ${response.status}`); const remote=applyManifest(await response.json()); const cmp=compare(remote.version,currentVersion); if(cmp>0)status.textContent=`发现新版本 ${remote.version} · ${remote.build||''}`; else status.textContent=`已是最新稳定版 ${currentVersion}。`; return {available:cmp>0,version:remote.version,build:remote.build||'',download:remote.download||manifest.download}; } catch(error) { status.textContent=`在线检查失败，当前版本 ${currentVersion} 仍可正常游玩。`; return {available:false,version:currentVersion,error:String(error)}; } };
    document.getElementById('updateClose')?.addEventListener('click',()=>root.classList.remove('show'));
    document.getElementById('updateCheck')?.addEventListener('click',check);
    document.getElementById('updateOpen')?.addEventListener('click',()=>window.BIBLE_FIGHTER_DESKTOP?.openDownload?.(window.BIBLE_FIGHTER_LIVE_UPDATE?.download||manifest.download));
    const trigger=document.createElement('button'); trigger.id='updateBtn'; trigger.className='ghost-btn update-trigger'; trigger.textContent=`版本 ${currentVersion}`; trigger.title='查看版本与更新'; trigger.addEventListener('click',()=>root.classList.add('show')); document.querySelector('.topbar')?.appendChild(trigger);
    window.BIBLE_FIGHTER_UPDATE_CENTER_READY=true;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
