(() => {
  'use strict';
  window.BIBLE_FIGHTER_UPDATE_MANIFEST = {
    channel: 'stable',
    version: '1.4.3',
    build: 'David Runtime Hardening Pass',
    published: '2026-08-24',
    notes: [
      '大卫模型与真实投射物、真实命中反馈保持同步',
      '战斗开始后再初始化 David interaction / polish，避免启动竞态',
      '再战或回合恢复时清理震屏与终结状态',
      'Windows portable、runtime contract、smoke test 统一到 1.4.3'
    ],
    minimumWindows: '1.4.3',
    download: 'https://github.com/junkaiichen-cpu/Bible/actions'
  };
  window.BIBLE_FIGHTER_UPDATE_READY = true;
})();
