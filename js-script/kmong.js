import axios from 'axios';
// import cheerio from 'cheerio';
import ExcelJS from 'exceljs';
import puppeteer from 'puppeteer';
const cheerio = await import('cheerio');

import { sleep } from './util/time.js';

import { getTime } from './util/random_time.js';

const baseUrl = 'https://kmong.com';
const searchUrl = `${baseUrl}/search`;
const url = new URL(searchUrl);

url.searchParams.set('keyword', '크롤링');
url.searchParams.set('type', 'gigs');
url.searchParams.set('page', 1);
url.searchParams.set('q', '크롤링');

try {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  await sleep(getTime());

  $(
    '#__next > div > div > div > div > section.css-jl6p2c.e12zymde0 > div.css-q52tmu.e1k46ixa0 ',
  )
    .children()
    .map(async (_, element) => {
      //   console.log({ index: 1, element: element.children });
      const post = $(element).find('article > a').attr('href');
      await sleep(getTime());
      const postLink = `${baseUrl}${post}`;
      const response = await axios.get(postLink);
      const $P = cheerio.load(response.data);
      console.log($P('main'));
      await sleep(getTime());
    });
} catch {}
