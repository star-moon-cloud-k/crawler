const { dialog } = require('electron');

async function filePath() {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save your file',
    defaultPath: `${formattedDate}.xlsx`,
    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
  });

  if (canceled) {
    return null; // 사용자가 취소했을 경우 null 반환
  } else {
    return filePath; // 파일 경로 반환
  }
}

exports.getPath = filePath;
