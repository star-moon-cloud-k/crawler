document.addEventListener('DOMContentLoaded', () => {
  // HTML 요소가 로드된 후에 이벤트 리스너 추가
  const scrapButton = document.getElementById('scrapButton');
  const exportButton = document.getElementById('exportButton');
  const messageElement = document.getElementById('message');
  exportButton.disabled = true;
  exportButton.textContent = '크롤링 후 저장 가능';

  if (scrapButton) {
    scrapButton.addEventListener('click', () => {
      const keyword = document.getElementById('keyword').value;
      const pageCount = document.getElementById('pageCount').value;
      messageElement.replaceChildren();
      window.scrap.static(keyword, pageCount);
    });
  }

  window.scrap.isSaved((event, data) => {
    console.log('Received data:', data);

    if (data) {
      exportButton.disabled = false;
      exportButton.textContent = '결과 저장';
    }

    // exportButton 이벤트 리스너 등록 (한 번만 등록되도록 조건 추가)
    if (!exportButton.hasAttribute('data-listener')) {
      exportButton.addEventListener('click', async () => {
        const savePath = await window.dialog.getSavePath();

        if (savePath) {
          window.export.csv(savePath); // 필요한 함수 호출
          message = `파일 저장위치: ${savePath}`;
          const newMessage = document.createElement('div');
          newMessage.textContent = message;
          messageElement.replaceChildren();
          messageElement.appendChild(newMessage);
          exportButton.disabled = true;
          exportButton.textContent = '크롤링 후 저장 가능';
          // 파일 저장 로직 추가 (예: fs.writeFile로 파일 저장)
        } else {
          console.log('Save canceled by the user.');
        }
      });
    }
  });

  window.scrap.messages((event, message) => {
    if (messageElement) {
      const newMessage = document.createElement('div');
      newMessage.textContent = message;
      messageElement.appendChild(newMessage);
    }
  });
});
