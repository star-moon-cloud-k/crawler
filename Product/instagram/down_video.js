const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 로그인 셀렉터
const usernameSelector = 'input[name="username"]';
const passwordSelector = 'input[name="password"]';
const loginButtonSelector = 'button[type="submit"]';

// 이미지 및 영상 저장 경로 설정
const downloadFolder = path.join(__dirname, 'instagram__video');
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder);
}

// 파일 다운로드 함수
async function downloadFile(url, filepath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
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

  // 이미지 URL에서 해상도 파라미터를 추출하고 필터링하는 함수
  function isLargeEnough(url) {
    const match = url.match(/stp=dst-jpg_e/); // 해상도 추출
    if (match) {
      return true; // 해상도 파라미터가 없는 경우 제외
    }
  }

  // 네트워크 요청 감지하여 이미지 및 영상 다운로드
  page.on('response', async (response) => {
    const url = response.url();
    console.log('감지된 요청 URL:', url); // 모든 URL 출력하여 확인

    if (
      // url.includes('.jpg')
      url.includes('.mp4')
    ) {
      if (isLargeEnough(url)) {
        const filename = url.split('/').pop().split('?')[0];
        const filepath = path.join(downloadFolder, filename);
        console.log({ filename, filepath });
        try {
          await downloadFile(url, filepath);
          console.log(`파일 저장 완료: ${filepath}`);
        } catch (error) {
          console.error(`파일 저장 실패: ${url}`, error);
        }
      }
    }
  });
  await delay(2000); // 안정화 대기

  // 게시물 탐색 및 클릭
  let postIndex = 0;
  while (postIndex < 20) {
    const posts = await page.$$(
      '[role="main"]>div>div:nth-child(2)>div>div a[href*="/p/"]',
    );

    if (!posts || posts.length === 0) {
      console.log('게시물을 찾을 수 없습니다.');
      await browser.close();
      return;
    }

    // 각 게시물 클릭하여 이미지/비디오 수집
    for (const postLink of posts) {
      await postLink.click(); // 게시물 클릭
      await page.waitForSelector('img'); // 이미지나 비디오 로드 대기
      await delay(2000); // 안정화 대기
      console.log('게시물에 접근하여 미디어를 확인 중입니다.');
      await page.keyboard.press('Escape'); // 게시물 닫기
      // 페이지에서 미디어 감지 및 다운로드는 `page.on('response')`에서 처리

      postIndex++;
      await delay(1000); // 다음 게시물 접근을 위한 대기
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // 페이지 스크롤
    await delay(2000);
  }
  await browser.close();
}

// 예제 실행
const keyword = process.argv[2];
const id = process.argv[3];
const password = process.argv[4];
scrapeInstagram(keyword, id, password).catch(console.error);
