const { wait } = require('./time'); // 사용자 정의 대기 함수
const { getTime } = require('./random_time'); // 사용자 정의 시간 관련 함수
const qs = require('qs'); // 쿼리 스트링을 쉽게 만들기 위해 사용
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

async function proxyScan() {
  // StealthPlugin을 사용하여 Puppeteer의 탐지를 방지
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: false, // 개발 중에는 false로 설정하여 브라우저 창을 볼 수 있습니다.
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();

  const url = 'https://spys.one/en/https-ssl-proxy/';

  // 사용자 에이전트 설정
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
  );

  try {
    // 초기 페이지 로드
    await page.goto(url, { waitUntil: 'networkidle0' });
  } catch (e) {
    console.warn(`프록시 서버 리스트 접근 오류 발생 : ${e}`);
    await browser.close();
    return;
  }

  // 페이지에서 xx0 값 추출 (예시: input 필드에서)
  const xx0 = await page.evaluate(() => {
    const input = document.querySelector('input[name="xx0"]');
    return input ? input.value : '';
  });

  if (!xx0) {
    console.warn('xx0 값을 추출하지 못했습니다.');
    await browser.close();
    return;
  }

  // 대기 시간 랜덤화 (필요 시 사용)
  await wait(getTime());

  // POST 요청에 사용할 페이로드 정의
  const payload = {
    xx0: xx0,
    xpp: 5, // 예: 500개의 프록시 표시
    xf1: 0,
    xf4: 0,
    xf5: 0,
  };

  // 페이로드를 application/x-www-form-urlencoded 형식으로 변환
  const formBody = qs.stringify(payload);

  // 빈 페이지로 이동
  await page.goto('about:blank');

  // 페이지 내에서 폼을 생성하고 제출하여 POST 요청 수행
  await page.evaluate(
    (targetUrl, encodedForm) => {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = targetUrl;
      form.enctype = 'application/x-www-form-urlencoded';

      const params = new URLSearchParams(encodedForm);
      for (const [key, value] of params.entries()) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    },
    url,
    formBody,
  );

  // 네트워크 활동이 완료될 때까지 대기
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // JavaScript가 실행된 후의 HTML 가져오기
  const body = await page.content();

  if (body) {
    // Cheerio로 HTML 파싱
    const $ = cheerio.load(body);
    const data = [];

    // 테이블의 각 행을 순회
    $('tr.spy1xx, tr.spy1x').each((index, element) => {
      if (index >= 2) {
        // 첫 두 행을 제외 (헤더 등)
        const ipRaw = $(element).find('td:nth-child(1)').text().trim();
        const ipMatch = ipRaw.match(/(\d{1,3}\.){3}\d{1,3}/);
        const portMatch = ipRaw.match(/:(\d+)/);

        const ip = ipMatch ? ipMatch[0] : '';
        const port = portMatch ? portMatch[1] : '';

        // 지연 시간 (latency) 추출 및 변환
        const latencyRaw = $(element).find('td:nth-child(6)').text().trim();
        const latencyMs = parseFloat(latencyRaw) * 1000;

        if (ip && port && !isNaN(latencyMs)) {
          // 수집된 데이터 저장
          data.push({ ip, port, latency: latencyMs });
        }
      }
    });

    console.log('추출된 프록시 데이터:', data);
  } else {
    console.warn('응답 본문을 가져오지 못했습니다.');
  }

  await browser.close();
}

// 함수 호출
proxyScan();
