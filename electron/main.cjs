const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const smoke = process.env.BIBLE_FIGHTER_SMOKE === '1';
let smokeFailed = false;

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
    if (level >= 2) {
      smokeFailed = true;
      app.exit(1);
    }
  });

  win.webContents.once('did-finish-load', () => {
    if (!smoke) return;
    setTimeout(() => {
      if (!smokeFailed) app.exit(0);
    }, 600);
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
