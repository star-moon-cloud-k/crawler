const puppeteer = require('puppeteer');

// 터미널에서 입력한 키워드를 인자로 받기
const keyword = process.argv[2];
const id = process.argv[3];
const password = process.argv[4].replace("'", '');

// 로그인 폼의 셀렉터
const usernameSelector = 'input[name="username"]';
const passwordSelector = 'input[name="password"]';
const loginButtonSelector = 'button[type="submit"]';

async function fetchInstagramImages(keyword, id, password) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Instagram 메인 페이지로 이동
  const url = `https://www.instagram.com/`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  // 로그인 필드가 보일 때까지 대기
  await page.waitForSelector(usernameSelector);
  await page.waitForSelector(passwordSelector);

  // ID와 비밀번호 입력
  await page.type(usernameSelector, id);
  await page.type(passwordSelector, password);

  // 로그인 버튼 클릭
  await page.click(loginButtonSelector);

  // 로그인 완료 후, 피드로 이동할 때까지 대기
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // 검색 페이지로 이동
  const searchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(
    keyword,
  )}/`;
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // 이미지 요소를 스크래핑
  const images = await page.evaluate(() => {
    const imageElements = Array.from(document.querySelectorAll('img'));
    return imageElements.map((img) => img.src); // 이미지 URL 수집
  });

  await browser.close();
  return images;
}

// 예제 실행
fetchInstagramImages(keyword, id, password)
  .then((images) => {
    console.log('스크래핑된 이미지 URL들:', images);
  })
  .catch((error) => {
    console.error('스크래핑 중 오류 발생:', error);
  });
