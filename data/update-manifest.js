(() => {
  'use strict';
  window.BIBLE_FIGHTER_UPDATE_MANIFEST = {
    channel: 'stable',
    version: '1.3.2',
    build: 'Combat Feel + Responsive Input Pass',
    published: '2026-08-24',
    notes: [
      '加入输入缓冲：普攻、技能与突进在受击/前后摇期间可保留短窗口输入',
      '加入命中停顿与轻重击差异化反馈，提高真实打击感',
      '加入近身自动朝向修正，减少贴身战斗失去目标的问题',
      '大卫保留 5A、投石索、牧者跃步、终结演出与 1.3.1 战斗展示层',
      'Windows 构建会独立上传 EXE build artifact；Smoke 失败不再阻止人工试玩包上传'
    ],
    minimumWindows: '1.3.2',
    download: 'https://github.com/junkaiichen-cpu/Bible/actions'
  };
  window.BIBLE_FIGHTER_UPDATE_READY = true;
})();
