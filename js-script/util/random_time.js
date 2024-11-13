function getRandomTime() {
  const min = 800;
  const max = 3000;
  const time = Math.floor(Math.random() * (max - min + 1)) + min;
  return time;
}
module.exports = { getTime: getRandomTime };
// export { getRandomTime as getTime };
