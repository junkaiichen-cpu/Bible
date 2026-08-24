(() => {
  'use strict';
  const boot = () => {
    if (!window.BIBLE_FIGHTER_UPDATE_READY) { setTimeout(boot, 50); return; }
    const manifest = window.BIBLE_FIGHTER_UPDATE_MANIFEST;
    const desktop = window.BIBLE_FIGHTER_DESKTOP || {};
    const root = document.createElement('section');
    root.id = 'updateCenter';
    root.className = 'update-center';
    root.innerHTML = `
      <div class="update-center-head">
        <div><span class="eyebrow">UPDATE CENTER</span><h3>Bible Fighter 更新中心</h3></div>
        <button type="button" id="updateClose" class="ghost-btn">关闭</button>
      </div>
      <div class="update-current">
        <strong>当前版本 ${desktop.version || manifest.version}</strong>
        <span>${manifest.build}</span>
        <small>Windows x64 · ${manifest.channel}</small>
      </div>
      <div class="update-status" id="updateStatus">正在检查本地版本契约…</div>
      <ul class="update-notes">${manifest.notes.map((n) => `<li>${n}</li>`).join('')}</ul>
      <div class="update-actions">
        <button type="button" id="updateCheck" class="primary-btn">检查更新</button>
        <button type="button" id="updateOpen" class="ghost-btn">打开下载页</button>
      </div>`;
    document.body.appendChild(root);
    const status = document.getElementById('updateStatus');
    const close = () => root.classList.remove('show');
    const open = () => root.classList.add('show');
    document.getElementById('updateClose')?.addEventListener('click', close);
    document.getElementById('updateCheck')?.addEventListener('click', async () => {
      status.textContent = '检查中…';
      try {
        const result = await window.BIBLE_FIGHTER_DESKTOP?.checkForUpdate?.();
        if (result?.error) status.textContent = `检查失败：${result.error}`;
        else if (result?.available) status.textContent = `发现新版本 ${result.version}，请打开下载页更新。`;
        else status.textContent = `已是最新稳定版 ${result?.version || manifest.version}。`;
      } catch { status.textContent = `已是当前稳定版 ${manifest.version}。`; }
    });
    document.getElementById('updateOpen')?.addEventListener('click', () => window.BIBLE_FIGHTER_DESKTOP?.openDownload?.(manifest.download));
    const trigger = document.createElement('button');
    trigger.id = 'updateBtn';
    trigger.className = 'ghost-btn update-trigger';
    trigger.textContent = `版本 ${desktop.version || manifest.version}`;
    trigger.title = '查看版本与更新';
    trigger.addEventListener('click', open);
    document.querySelector('.topbar')?.appendChild(trigger);
    status.textContent = `稳定版 ${manifest.version} · ${manifest.published}`;
    window.BIBLE_FIGHTER_UPDATE_CENTER_READY = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
