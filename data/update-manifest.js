(() => {
  'use strict';
  window.BIBLE_FIGHTER_UPDATE_MANIFEST = {
    channel: 'stable',
    version: '1.5.1',
    build: 'Stability & Performance Pass',
    published: '2026-08-24',
    notes: [
      '在 1.5.0 完整战斗场景基础上优化运行时稳定性与性能',
      '限制并回收粒子、文字、环与投射物对象',
      '增加实时 frame time / FPS / spike 诊断',
      '回合、再战与换角色统一清理运行时状态',
      'Windows portable、runtime contract、smoke test 统一到 1.5.1'
    ],
    minimumWindows: '1.5.1',
    download: 'https://github.com/junkaiichen-cpu/Bible/actions'
  };
  window.BIBLE_FIGHTER_UPDATE_READY = true;
})();
