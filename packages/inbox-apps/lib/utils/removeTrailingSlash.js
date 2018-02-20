'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeTrailingSlash;
function removeTrailingSlash(path) {
  return path.substr(-1) === '/' ? path.slice(0, -1) : path;
}
module.exports = exports['default'];
//# sourceMappingURL=removeTrailingSlash.js.map