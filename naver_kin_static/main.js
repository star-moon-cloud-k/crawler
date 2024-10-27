const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('node:path');
const path = require('path');
const { registerIpcMainHandlers } = require(path.join(
  __dirname,
  'src',
  'ipc_handler',
));
// const { registerIpcMainHandlers } = require('src/ipc_handler');
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      contextIsolation: true, // contextIsolation을 활성화하여 보안 강화
      enableRemoteModule: false,
    },
  });

  win.loadFile('src/public/index.html');
};

app.whenReady().then(() => {
  createWindow();
  registerIpcMainHandlers(); // ipcMain 핸들러 등록
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

//Electron can run in: win32 (Windows), linux (Linux), and darwin (macOS).
app.on('window-all-closed', () => {
  app.quit();
});
