const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const smoke = process.env.BIBLE_FIGHTER_SMOKE === '1';
let smokeFailed = false;

function writeFatalLog(kind, error) {
  try {
    const message = error instanceof Error ? `${error.stack || error.message}` : String(error);
    const logPath = path.join(app.getPath('userData'), 'bible-fighter-runtime.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${kind}\n${message}\n`, 'utf8');
  } catch {}
}
process.on('uncaughtException', (error) => { writeFatalLog('uncaughtException', error); if (smoke) { smokeFailed = true; app.exit(1); } });
process.on('unhandledRejection', (reason) => { writeFatalLog('unhandledRejection', reason); if (smoke) { smokeFailed = true; app.exit(1); } });

function createWindow() {
  const win = new BrowserWindow({ width:1280, height:820, minWidth:980, minHeight:700, backgroundColor:'#090807', title:'Bible Fighter', autoHideMenuBar:true, show:!smoke, webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,preload:path.join(__dirname,'preload.cjs')} });
  Menu.setApplicationMenu(null);
  win.webContents.on('did-fail-load', (_e, code, desc) => { if (!smoke) return; console.error(`Renderer failed to load: ${code} ${desc}`); smokeFailed=true; app.exit(1); });
  win.webContents.on('render-process-gone', (_e, details) => { if (!smoke) return; console.error(`Renderer process ended: ${details.reason}`); smokeFailed=true; app.exit(1); });
  win.webContents.on('console-message', (_e, level, message) => { if (!smoke) return; console.log(`[renderer:${level}] ${message}`); if (level >= 3) { smokeFailed=true; app.exit(1); } });
  win.webContents.once('did-finish-load', () => {
    if (!smoke) return;
    setTimeout(async () => {
      try {
        const probe = await win.webContents.executeJavaScript(`(() => ({
          ready:document.readyState, canvas:!!document.querySelector('#game'), startButton:!!document.querySelector('#startBtn'), selectScreen:!!document.querySelector('#selectScreen'), battleScreen:!!document.querySelector('#battleScreen'),
          p1Cards:document.querySelectorAll('#p1Grid .char-card').length, p2Cards:document.querySelectorAll('#p2Grid .char-card').length, p1ScrollOptions:document.querySelectorAll('#p1Scroll option').length, p2ScrollOptions:document.querySelectorAll('#p2Scroll option').length, p1HelperOptions:document.querySelectorAll('#p1Helper option').length, p2HelperOptions:document.querySelectorAll('#p2Helper option').length,
          startDisabled:!!document.querySelector('#startBtn')?.disabled, selectionReady:!!window.BIBLE_FIGHTER_SELECTION_READY, roster:typeof window.BIBLE_ROSTER==='object', supports:typeof window.BIBLE_SUPPORTS==='object', missions:typeof window.BIBLE_MISSIONS==='object', codex:typeof window.BIBLE_CODEX==='object', diagnostics:typeof window.BIBLE_FIGHTER_TEST_API==='object', diagnosticReady:!!window.BIBLE_FIGHTER_DIAGNOSTICS?.ready,
          hud:!!document.querySelector('.combat-ui'), mission:!!document.querySelector('.mission-panel'), skills:!!document.querySelector('.skill-deck'), map:!!document.querySelector('.battle-map'), identity:!!document.querySelector('.combat-identity-layer'), codexLayer:!!document.querySelector('.codex-layer'), frames:!!window.BIBLE_FIGHTER_COMBAT_FRAMES_READY, frameRules:!!window.BIBLE_FIGHTER_FRAME_RULES_READY, davidArt:!!window.BIBLE_FIGHTER_DAVID_ART_READY, davidImpact:!!window.BIBLE_FIGHTER_DAVID_IMPACT_READY, multiplayer:!!window.BIBLE_FIGHTER_MULTIPLAYER_READY, stage:!!window.BIBLE_FIGHTER_STAGE_READY, coreCharacters:!!window.BIBLE_FIGHTER_CORE_CHARACTERS_READY
        }))()`, true);
        console.log(`[smoke] boot ${JSON.stringify(probe)}`);
        const ok = probe.ready==='complete' && probe.canvas && probe.startButton && probe.selectScreen && probe.battleScreen && probe.p1Cards>=6 && probe.p2Cards>=6 && probe.p1ScrollOptions>0 && probe.p2ScrollOptions>0 && probe.p1HelperOptions>0 && probe.p2HelperOptions>0 && !probe.startDisabled && probe.selectionReady && probe.roster && probe.supports && probe.missions && probe.codex && probe.diagnostics && probe.diagnosticReady && probe.hud && probe.mission && probe.skills && probe.map && probe.identity && probe.codexLayer && probe.frames && probe.frameRules && probe.davidArt && probe.davidImpact && probe.multiplayer && probe.stage && probe.coreCharacters;
        if (!ok) { console.error(`Runtime boot probe failed: ${JSON.stringify(probe)}`); smokeFailed=true; app.exit(1); return; }
        const selected = await win.webContents.executeJavaScript(`(() => { const p1=[...document.querySelectorAll('#p1Grid .char-card')][0]; const p2=[...document.querySelectorAll('#p2Grid .char-card')][1]; if(!p1||!p2)return {ok:false}; p1.click(); p2.click(); return {ok:true,p1Label:document.querySelector('#p1Label')?.textContent||'',p2Label:document.querySelector('#p2Label')?.textContent||'',startDisabled:!!document.querySelector('#startBtn')?.disabled}; })()`, true);
        console.log(`[smoke] selection ${JSON.stringify(selected)}`);
        if (!selected?.ok || selected.p1Label!=='大卫' || selected.p2Label!=='摩西' || selected.startDisabled) { console.error(`Character selection probe failed: ${JSON.stringify(selected)}`); smokeFailed=true; app.exit(1); return; }
        await win.webContents.executeJavaScript(`window.BIBLE_FIGHTER_TEST_API.selectAndStart('david','moses')`, true);
        const started = await win.webContents.executeJavaScript(`new Promise(r=>setTimeout(()=>r(window.BIBLE_FIGHTER_TEST_API.snapshot()),2800))`, true);
        console.log(`[smoke] battle-start ${JSON.stringify(started)}`);
        const battleStarted = started?.phase==='battle' && Array.isArray(started?.fighters) && started.fighters.length===2 && started.fighters[0].id==='david' && started.fighters[1].id==='moses';
        if (!battleStarted) { console.error(`Combat start probe failed: ${JSON.stringify(started)}`); smokeFailed=true; app.exit(1); return; }
        const combatUi = await win.webContents.executeJavaScript(`(() => ({missionText:document.querySelector('#missionObjective')?.textContent||'',skill1:document.querySelector('#skill1 .skill-name')?.textContent||'',skill2:document.querySelector('#skill2 .skill-name')?.textContent||'',mapName:document.querySelector('#mapName')?.textContent||'',p1Identity:document.querySelector('#identityP1Name')?.textContent||'',p2Identity:document.querySelector('#identityP2Name')?.textContent||'',codexReady:!!window.BIBLE_FIGHTER_CODEX_READY,briefingReady:!!window.BIBLE_FIGHTER_BRIEFING_READY,framesReady:!!window.BIBLE_FIGHTER_COMBAT_FRAMES_READY,rulesReady:!!window.BIBLE_FIGHTER_FRAME_RULES_READY,davidArtReady:!!window.BIBLE_FIGHTER_DAVID_ART_READY,davidImpactReady:!!window.BIBLE_FIGHTER_DAVID_IMPACT_READY,multiplayerReady:!!window.BIBLE_FIGHTER_MULTIPLAYER_READY,stageReady:!!window.BIBLE_FIGHTER_STAGE_READY,stageCurrent:window.BIBLE_FIGHTER_STAGE?.current?.()||'',coreCharactersReady:!!window.BIBLE_FIGHTER_CORE_CHARACTERS_READY,coreRoster:window.BIBLE_FIGHTER_CORE_CHARACTERS?.roster||[]}))()`, true);
        console.log(`[smoke] combat-ui ${JSON.stringify(combatUi)}`);
        if (!combatUi.missionText || !combatUi.skill1 || !combatUi.skill2 || !combatUi.mapName || combatUi.p1Identity!=='大卫' || combatUi.p2Identity!=='摩西' || !combatUi.codexReady || !combatUi.briefingReady || !combatUi.framesReady || !combatUi.rulesReady || !combatUi.davidArtReady || !combatUi.davidImpactReady || !combatUi.multiplayerReady || !combatUi.stageReady || combatUi.stageCurrent!=='red-sea' || !combatUi.coreCharactersReady || !combatUi.coreRoster.includes('david') || !combatUi.coreRoster.includes('moses')) { console.error(`Combat UI probe failed: ${JSON.stringify(combatUi)}`); smokeFailed=true; app.exit(1); return; }

        const moved = await win.webContents.executeJavaScript(`(() => new Promise(resolve => { const before = window.BIBLE_FIGHTER_MULTIPLAYER.snapshot(); const kd1 = new KeyboardEvent('keydown',{key:'d',bubbles:true}); const ku1 = new KeyboardEvent('keyup',{key:'d',bubbles:true}); const kd2 = new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}); const ku2 = new KeyboardEvent('keyup',{key:'ArrowLeft',bubbles:true}); document.dispatchEvent(kd1); document.dispatchEvent(kd2); setTimeout(()=>{ document.dispatchEvent(ku1); document.dispatchEvent(ku2); resolve({before,after:window.BIBLE_FIGHTER_MULTIPLAYER.snapshot()}); },220); }))()`, true);
        console.log(`[smoke] movement ${JSON.stringify(moved)}`);
        if (!(moved?.after?.p1?.x > moved?.before?.p1?.x) || !(moved?.after?.p2?.x < moved?.before?.p2?.x)) { console.error(`Two-player movement probe failed: ${JSON.stringify(moved)}`); smokeFailed=true; app.exit(1); return; }

        const damage = await win.webContents.executeJavaScript(`new Promise(resolve => { A.x = B.x - 54; A.f = 1; B.hp = Math.min(B.hp, 100); const before = B.hp; act('p1','a'); setTimeout(()=>resolve({before,after:B.hp,p1:A.hp,p2:B.hp}),130) })`, true);
        console.log(`[smoke] damage ${JSON.stringify(damage)}`);
        if (!(damage?.after < damage?.before)) { console.error(`Two-player damage probe failed: ${JSON.stringify(damage)}`); smokeFailed=true; app.exit(1); return; }

        const ko = await win.webContents.executeJavaScript(`new Promise(resolve => { B.hp = 1; A.x = B.x - 54; act('p1','a'); setTimeout(()=>resolve({p1:A.hp,p2:B.hp,over:!!S.over,resultHidden:document.querySelector('#result')?.classList.contains('hidden')}),160) })`, true);
        console.log(`[smoke] ko ${JSON.stringify(ko)}`);
        if (!(ko?.over || ko?.p2 <= 0 || ko?.resultHidden === false)) { console.error(`Match-end probe failed: ${JSON.stringify(ko)}`); smokeFailed=true; app.exit(1); return; }
        console.log(`[smoke] multiplayer-final ${JSON.stringify(window.BIBLE_FIGHTER_MULTIPLAYER.snapshot())}`);
      } catch (error) { console.error(`Runtime combat probe exception: ${error?.stack || error}`); smokeFailed=true; app.exit(1); return; }
      app.exit(smokeFailed?1:0);
    },700);
  });
  win.loadFile(path.join(__dirname,'..','playtest.html')); return win;
}
app.whenReady().then(()=>{ createWindow(); if(!smoke) app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();}); });
app.on('window-all-closed',()=>{if(!smoke&&process.platform!=='darwin')app.quit();});
