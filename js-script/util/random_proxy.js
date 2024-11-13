const proxy = require('./proxy.json');

function randomProxy() {
  const randomIndex = Math.floor(Math.random() * proxy.length);
  return proxy[randomIndex];
}
module.exports = randomProxy;
