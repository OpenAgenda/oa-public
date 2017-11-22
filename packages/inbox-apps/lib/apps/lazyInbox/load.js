'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

exports.default = loadApp;

var _loadScript = require('load-script');

var _loadScript2 = _interopRequireDefault(_loadScript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadApp(options) {

  var params = (0, _merge3.default)({
    functionName: '',
    selector: '.js_inbox_event',
    jsFilePath: '/js/inboxEvent.js',
    state: {
      settings: {
        prefix: '/',
        lang: 'fr',
        perPageLimit: 20
      },
      res: {}
    }
  }, options);

  (0, _loadScript2.default)(params.jsFilePath, function (err) {

    if (err) {
      return console.log('Error on script load:', err);
    }

    if (window[params.functionName]) {
      window[params.functionName](params);
    }
  });
}
module.exports = exports['default'];
//# sourceMappingURL=load.js.map