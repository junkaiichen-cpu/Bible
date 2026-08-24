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

process.on('uncaughtException', (error) => {
  writeFatalLog('uncaughtException', error);
  if (smoke) {
    smokeFailed = true;
    app.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  writeFatalLog('unhandledRejection', reason);
  if (smoke) {
    smokeFailed = true;
    app.exit(1);
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: '#090807',
    title: 'Bible Fighter',
    autoHideMenuBar: true,
    show: !smoke,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  Menu.setApplicationMenu(null);

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    if (!smoke) return;
    console.error(`Renderer failed to load: ${errorCode} ${errorDescription}`);
    smokeFailed = true;
    app.exit(1);
  });

  win.webContents.on('render-process-gone', (_event, details) => {
    if (!smoke) return;
    console.error(`Renderer process ended: ${details.reason}`);
    smokeFailed = true;
    app.exit(1);
  });

  win.webContents.on('console-message', (_event, level, message) => {
    if (!smoke) return;
    console.log(`[renderer:${level}] ${message}`);
    if (level >= 3) {
      smokeFailed = true;
      app.exit(1);
    }
  });

  win.webContents.once('did-finish-load', () => {
    if (!smoke) return;
    setTimeout(async () => {
      try {
        const probe = await win.webContents.executeJavaScript(`(() => ({
          ready: document.readyState,
          title: document.title,
          canvas: Boolean(document.querySelector('#game')),
          startButton: Boolean(document.querySelector('#startBtn')),
          selectScreen: Boolean(document.querySelector('#selectScreen')),
          battleScreen: Boolean(document.querySelector('#battleScreen')),
          roster: typeof window.BIBLE_ROSTER === 'object',
          supports: typeof window.BIBLE_SUPPORTS === 'object',
          diagnostics: typeof window.BIBLE_FIGHTER_TEST_API === 'object',
          diagnosticReady: Boolean(window.BIBLE_FIGHTER_DIAGNOSTICS?.ready)
        }))()`, true);
        console.log(`[smoke] boot ${JSON.stringify(probe)}`);
        const ok = probe.ready === 'complete'
          && probe.canvas
          && probe.startButton
          && probe.selectScreen
          && probe.battleScreen
          && probe.roster
          && probe.supports
          && probe.diagnostics
          && probe.diagnosticReady;
        if (!ok) {
          console.error(`Runtime boot probe failed: ${JSON.stringify(probe)}`);
          smokeFailed = true;
          app.exit(1);
          return;
        }

        await win.webContents.executeJavaScript(`window.BIBLE_FIGHTER_TEST_API.selectAndStart('david','moses')`, true);
        const started = await win.webContents.executeJavaScript(`new Promise(resolve => setTimeout(() => resolve(window.BIBLE_FIGHTER_TEST_API.snapshot()), 2800))`, true);
        console.log(`[smoke] battle-start ${JSON.stringify(started)}`);
        const battleStarted = started?.phase === 'battle'
          && Array.isArray(started?.fighters)
          && started.fighters.length === 2
          && started.fighters[0].id === 'david'
          && started.fighters[1].id === 'moses';
        if (!battleStarted) {
          console.error(`Combat start probe failed: ${JSON.stringify(started)}`);
          smokeFailed = true;
          app.exit(1);
          return;
        }

        await win.webContents.executeJavaScript(`window.BIBLE_FIGHTER_TEST_API.press('p1','a')`, true);
        const afterAttack = await win.webContents.executeJavaScript(`new Promise(resolve => setTimeout(() => resolve(window.BIBLE_FIGHTER_TEST_API.snapshot()), 120))`, true);
        console.log(`[smoke] attack ${JSON.stringify(afterAttack)}`);
        if (afterAttack?.phase !== 'battle' || afterAttack?.lastAction !== 'p1:a') {
          console.error(`Combat input probe failed: ${JSON.stringify(afterAttack)}`);
          smokeFailed = true;
          app.exit(1);
          return;
        }
      } catch (error) {
        console.error(`Runtime combat probe exception: ${error?.stack || error}`);
        smokeFailed = true;
        app.exit(1);
        return;
      }
      app.exit(smokeFailed ? 1 : 0);
    }, 700);
  });

  win.loadFile(path.join(__dirname, '..', 'playtest.html'));
  return win;
}

app.whenReady().then(() => {
  createWindow();
  if (!smoke) {
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  }
});

app.on('window-all-closed', () => {
  if (!smoke && process.platform !== 'darwin') app.quit();
});
