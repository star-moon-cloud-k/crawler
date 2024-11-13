const puppeteer = require('puppeteer');

// 터미널에서 입력한 키워드를 인자로 받기
const keyword = process.argv[2];

async function fetchInstagramImages(keyword) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = `https://kin.naver.com/search/list.naver?query=${encodeURIComponent(
    keyword,
  )}`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  const images = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('.basic1 > li'));
    console.log(elements);
    const results = [];

    elements.forEach((element) => {
      const titleElement = element.querySelector(
        '._nclicks\\:kin\\.txt._searchListTitleAnchor',
      );
      const title = titleElement ? titleElement.textContent : null;
      const url = titleElement ? titleElement.getAttribute('href') : null;

      results.push({ title, url }); // 결과에 제목 추가
    });

    return results;
  });

  await browser.close();
  return images;
}

// 예제 실행
fetchInstagramImages(keyword);
