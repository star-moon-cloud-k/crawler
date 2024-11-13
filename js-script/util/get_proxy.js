const axios = require('axios');
const randomProxy = require('./random_proxy');

async function getProxy(tryLimit = 5, tryCount = 0) {
  const proxy = randomProxy();
  console.log(`프록시 서버 검사 중: ${proxy.ip_address}:${proxy.port}`);

  try {
    const start = Date.now();
    const response = await axios.get('http://www.google.com', {
      proxy: { host: proxy.ip_address, port: proxy.port },
      timeout: 5000,
    });

    // 성공 시 응답 시간 계산
    const delayTime = Date.now() - start;
    console.log(
      `프록시 성공: ${proxy.ip_address}:${proxy.port}, 응답 시간: ${delayTime}ms`,
    );
    return { proxy, delayTime };
  } catch (error) {
    const retryableErrors = [
      'ECONNREFUSED',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ECONNRESET',
    ];
    const errorCode = error.code || (error.response && error.response.status);

    if (tryCount < tryLimit && retryableErrors.includes(errorCode)) {
      console.warn(
        `프록시 실패 (${proxy.ip_address}:${
          proxy.port
        }) - 오류 코드: ${errorCode}, 재시도 중... (${
          tryCount + 1
        }/${tryLimit})`,
      );
      return await getProxy(tryLimit, tryCount + 1); // 재귀 호출하여 재시도
    } else {
      console.error(
        `프록시 연결 실패 (${proxy.ip_address}:${proxy.port}) - 오류 코드: ${errorCode}`,
      );
      return await getProxy(tryLimit, tryCount + 1); // 재귀 호출하여 재시도; // 최대 재시도 횟수 초과 시 null 반환
    }
  }
}

module.exports = getProxy;
