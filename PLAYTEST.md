# Bible Fighter · 第一版 Playtest

## Windows 最快试玩

下载仓库 ZIP 并解压后，直接双击 **`Playtest-Windows.bat`**。

它会打开当前最新的 `playtest.html`，无需安装 Node.js，也无需手柄。

也可以直接双击 `playtest.html`。

## Windows EXE

仓库同时保留 Electron + electron-builder 的 Windows x64 portable 构建链。CI 成功后会产出 `bible-fighter-windows-x64` artifact；这是正式桌面版入口。

## 当前入口

- `playtest.html`：当前 Build 13 实际战斗入口
- `Playtest-Windows.bat`：Windows 一键浏览器试玩
- 主战斗链：`game7.js` → `game8.js` → `game9.js` → `game10.js`

## 操作

### P1
- WASD：移动 / 跳跃
- J：普攻
- K：技能 1
- L：技能 2
- I：替身
- O：奥义
- 6：密卷
- 7：帮手

### P2
- 方向键：移动 / 跳跃
- 1：普攻
- 2：技能 1
- 3：技能 2
- 4：替身
- 5：奥义
- 8：密卷
- 9：帮手

## 调试操作

- `F2`：显示当前战斗版本
- `F3`：攻击框 / 当前攻击阶段调试
- `ESC`：暂停 / 继续

## 核心规则

- 2 Player 本地 1v1
- Best of 3
- 普攻 5 段连击
- Startup / Active / Recovery 帧阶段
- 连招输入缓存
- 技能取消窗口
- 连招伤害衰减
- 替身资源
- 奥义资源
- 密卷：长 CD，发动期间金刚体
- 帮手：整场 BO3 仅一次，跨回合保留

## 建议测试顺序

1. 大卫 vs 参孙
2. 摩西 vs 以利亚
3. 但以理 vs 保罗
4. 测试普攻 1→2→3→4→5 的节奏
5. 在 5A 收招阶段接技能 1 / 技能 2
6. 测试替身、密卷、帮手与奥义的资源博弈
7. F3 查看攻击框与攻击阶段

## 目标

第一版重点不是最终美术资源，而是先把：

- 战斗节奏
- 连招反馈
- 替身博弈
- 技能取消
- 角色差异
- 圣经人物技能主题

做到真正可以反复玩的水平。
