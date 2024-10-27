const { ipcMain } = require('electron');

const path = require('./util/file_path');
const static = require('./crawler/static_crawling');
const excel = require('./excel/save');
// const Store = require('electron-store');

// const store = new Store();

function registerIpcMainHandlers() {
  let result = ipcMain.on('static', async (event, keyword, pageCount) => {
    try {
      const data = await static.crawl(event, keyword, pageCount);
      if (data) {
        result = data;
        event.sender.send('isSaved', data);
      }
    } catch (error) {
      console.error('Error in static crawl:', error);
    }
  });

  ipcMain.handle('get-save-path', async () => {
    return await path.getPath();
  });

  ipcMain.on('export', (event, filePath) => {
    excel.save(filePath, result);
  });
}
module.exports = { registerIpcMainHandlers };
