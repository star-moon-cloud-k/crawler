const { wait } = require('./time');
const { getTime } = require('./random_time');
const qs = require('qs');
const axios = require('axios');
const cheerio = require('cheerio');

async function proxyScan() {
  const url = 'https://spys.one/en/https-ssl-proxy/';
  const payload = {
    xx0: 'a83b70b409000d40d1b2eaa785f6bc5f',
    xpp: 5,
    xf1: 0,
    xf4: 0,
    xf5: 0,
  };
  // `qs.stringify`로 URL-encoded 형식으로 변환
  const response = await axios.post(url, qs.stringify(payload), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const $ = cheerio.load(response.data);

  // Cheerio로 HTML 파싱

  const data = [];

  // 테이블의 각 행을 순회
  $('tr.spy1xx, tr.spy1x').each((index, element) => {
    if (index >= 2) {
      // 첫 두 행을 제외
      const row = [];

      // 각 행의 셀(td) 텍스트 추출

      // IP 주소와 포트 추출
      console.log($(element).find('td').text());
      const ipRaw = $(element).find('td:nth-child(1)>').text().trim();
      const ip = ipRaw.split('document')[0];
      const port = ipRaw.split(':')[1];

      const latencyRaw = $(element).find('td:nth-child(6)').text().trim();
      console.log({ ip, ipRaw });
      console.log({ latencyRaw: latencyRaw * 1000 });

      // 빈 배열이 아닌 경우만 데이터에 추가
      if (row.length > 0) {
        data.push(row);
      }
    }
  });
  // console.log(data);
}
proxyScan();
