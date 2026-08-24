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
          supports: typeof window.BIBLE_SUPPORTS === 'object'
        }))()`, true);
        console.log(`[smoke] ${JSON.stringify(probe)}`);
        const ok = probe.ready === 'complete'
          && probe.canvas
          && probe.startButton
          && probe.selectScreen
          && probe.battleScreen
          && probe.roster
          && probe.supports;
        if (!ok) {
          console.error(`Runtime probe failed: ${JSON.stringify(probe)}`);
          smokeFailed = true;
        }
      } catch (error) {
        console.error(`Runtime probe exception: ${error?.stack || error}`);
        smokeFailed = true;
      }
      if (!smokeFailed) app.exit(0);
      else app.exit(1);
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
