const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 로그인 셀렉터
const usernameSelector = 'input[name="username"]';
const passwordSelector = 'input[name="password"]';
const loginButtonSelector = 'button[type="submit"]';

// 이미지 및 영상 저장 경로 설정
const downloadFolder = path.join(__dirname, 'instagram_downloads');
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder);
}

// 파일 다운로드 함수
async function downloadFile(url, filepath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  response.data.pipe(fs.createWriteStream(filepath));
  return new Promise((resolve, reject) => {
    response.data.on('end', resolve);
    response.data.on('error', reject);
  });
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function scrapeInstagram(keyword, id, password) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 로그인
  await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
  await page.type(usernameSelector, id);
  await page.type(passwordSelector, password);
  await page.click(loginButtonSelector);
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // 검색 페이지로 이동
  const searchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(
    keyword,
  )}/`;
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // 페이지의 네트워크 요청 감지하여 이미지 및 영상 다운로드
  page.on('response', async (response) => {
    const request = response.request();
    const url = request.url();
    if (url.endsWith('.jpg') || url.endsWith('.mp4')) {
      const filename = url.split('/').pop().split('?')[0];
      const filepath = path.join(downloadFolder, filename);
      try {
        await downloadFile(url, filepath);
        console.log(`파일 저장 완료: ${filepath}`);
      } catch (error) {
        console.error(`파일 저장 실패: ${url}`, error);
      }
    }
  });

  // 게시물 탐색 및 클릭
  let postIndex = 0;
  while (postIndex < 20) {
    await delay(2000); // 안정화 대기
    // 스크롤하며 최대 20개의 게시물을 다운로드합니다.
    const posts = await page.$$(
      '[role="main"]>div>div:nth-child(2)>div>div a[href*="/p/"]',
    );

    if (!posts) {
      console.log('role="main" 요소를 찾을 수 없습니다.');
      await browser.close();
      return;
    }

    // 각 게시물 클릭하여 이미지/비디오 수집
    for (const postLink of posts) {
      await postLink.click(); // 게시물 클릭
      await page.waitForSelector('img, video'); // 이미지나 비디오 로드 대기
      await delay(2000); // 안정화 대기
      console.log(postLink);

      // 현재 게시물에서 이미지와 비디오 링크 수집
      const mediaUrls = await page.evaluate(() => {
        const mediaElements = Array.from(
          document.querySelectorAll('img, video'),
        );
        return mediaElements.map((media) => media.src);
      });

      console.log('다운로드할 미디어 URL들:', mediaUrls);

      // 게시물 닫기
      await page.keyboard.press('Escape');
      await delay(1000); // 다음 게시물 접근을 위한 대기
      // 다음 게시물로 이동
      window.scrollTo(0, document.body.scrollHeight);
      postIndex++;
    }
  }
  await browser.close();
}

// 예제 실행
const keyword = process.argv[2];
const id = process.argv[3];
const password = process.argv[4];
scrapeInstagram(keyword, id, password).catch(console.error);
