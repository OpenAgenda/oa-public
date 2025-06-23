import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
export default function reduceAccessToken(token) {
  var _context;
  return _reduceInstanceProperty(_context = token.split('')).call(_context, (accu, next) => accu + next.charCodeAt(0), 0);
}
//# sourceMappingURL=reduceAccessToken.js.map