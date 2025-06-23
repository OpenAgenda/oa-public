import _random from "lodash/random.js";
export default function getNonce(reducedAccessToken, requestTokenTime) {
  const ms = new Date().getTime() - requestTokenTime;
  return parseInt("".concat(_random(10 ** 3)).concat(reducedAccessToken).concat(ms), 10);
}
//# sourceMappingURL=getNonce.js.map