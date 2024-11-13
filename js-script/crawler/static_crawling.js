const axios = require('axios');
const cheerio = require('cheerio');
const { sleep } = require('../util/time');
const { getTime } = require('../util/random_time');

// 터미널에서 입력한 키워드를 인자로 받기
const keyword = process.argv[2];

async function fetchNaverData(event, keyword, pageCount) {
  const results = [];
  for (let i = 1; i <= pageCount; i++) {
    const baseURL = 'https://kin.naver.com/search/list.naver';
    const url = new URL(baseURL);

    // 쿼리 파라미터 추가
    url.searchParams.set('query', keyword);
    url.searchParams.set('page', i);

    // 데이터 분류
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      $('.basic1 > li').each((_, element) => {
        const question = $(element)
          .find('._nclicks\\:kin\\.txt._searchListTitleAnchor')
          .text();
        const link = $(element)
          .find('._nclicks\\:kin\\.txt._searchListTitleAnchor')
          .attr('href');
        const date = $(element).find('.txt_inline').text();
        const category = $(element)
          .find('.txt_block > a:nth-of-type(2)')
          .text();
        const answerCount =
          $(element)
            .find('.txt_block > span:nth-of-type(2)')
            .text()
            .split(' ')[1] || '0';
        const data = `${question}`;
        event.sender.send('messages', data);
        results.push({ question, link, date, category, answerCount });
      });
    } catch (error) {
      console.error('Error fetching Naver data:', error);
    }

    await sleep(getTime());
  }
  return results;
}

exports.crawl = fetchNaverData;
