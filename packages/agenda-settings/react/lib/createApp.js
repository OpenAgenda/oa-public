'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createApp;

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _createRoutes = require('./createRoutes');

var _createRoutes2 = _interopRequireDefault(_createRoutes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createApp(options) {

  return (0, _app2.default)(options, _createRoutes2.default);
}
module.exports = exports['default'];
//# sourceMappingURL=createApp.js.map