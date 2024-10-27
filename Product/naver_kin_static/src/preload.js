const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('versions', {
//   node: () => process.versions.node,
//   chrome: () => process.versions.chrome,
//   electron: () => process.versions.electron,
//   // we can also expose variables, not just functions
// });

// contextBridge.exposeInMainWorld('send', {
//   sendPing: () => ipcRenderer.send('ping'),
//   onPong: (callback) => {
//     return ipcRenderer.on('pong', callback);
//   },
// });

/**
 * 크롤링
 */
contextBridge.exposeInMainWorld('scrap', {
  static: (keyword, pageCount) =>
    ipcRenderer.send('static', keyword, pageCount),
  messages: (callback) => ipcRenderer.on('messages', callback),
  isSaved: (callback) => ipcRenderer.on('isSaved', callback),
});

/**
 * 파일 경로 저장
 */
contextBridge.exposeInMainWorld('dialog', {
  getSavePath: () => ipcRenderer.invoke('get-save-path'),
});

/**
 *
 */
contextBridge.exposeInMainWorld('export', {
  csv: (data) => {
    return ipcRenderer.send('export', data);
    //export csv
  },
});
