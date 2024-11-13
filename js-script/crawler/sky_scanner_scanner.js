const { wait } = require('../util/time');
const { getTime } = require('../util/random_time');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const getProxy = require('../util/get_proxy');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin({ options: { evasionEnabled: true } }));
const keyword = '시모지시마';

async function skyScanner(keyword) {
  const { proxy, delayTime } = await getProxy(10);
  console.log(delayTime);
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--proxy-server=http://${proxy.ip_address}:${proxy.port}`, // 여기에 사용할 프록시 주소와 포트를 입력하세요
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const page = await browser.newPage();
  // 각 작업의 기본 타임아웃 설정
  page.setDefaultTimeout(delayTime);
  page.setDefaultNavigationTimeout(delayTime);
  // 헤더 설정
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
  );
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ko',
  });

  // 이전 세션 쿠키 로드
  if (fs.existsSync('cookies.json')) {
    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf-8'));
    await page.setCookie(...cookies);
  }

  // 스카이스캐너 웹사이트로 이동
  const url = 'https://www.skyscanner.co.kr/';
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
  } catch (error) {
    console.error('페이지 로드 중 오류 발생:', error);
    await browser.close();
    return;
  }

  await wait(getTime());

  const originElement = '#originInput-input';
  const desitinationElement = '#destinationInput-input';

  // 출발지와 도착지 입력란에 키워드 입력 (evaluate 활용)
  await page.evaluate(
    (originSelector, destinationSelector, originValue, destinationValue) => {
      const origin = document.querySelector(originSelector);
      const destination = document.querySelector(destinationSelector);

      if (origin) {
        origin.click();
        origin.value = originValue;
        origin.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (destination) {
        destination.click();
        destination.value = destinationValue;
        destination.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    originElement,
    desitinationElement,
    keyword,
    keyword,
  ); // 키워드 두 번 사용 (출발지와 도착지 동일하게 설정)

  await page.type(desitinationElement, keyword, { delay: getTime() });
}

skyScanner(keyword);
