'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {

  return (0, _createApp2.default)(options.state, (0, _createStore2.default)(_reducer2.default), _routes2.default, _ApiClient2.default);
};

var _createApp = require('react-utils/dist/createApp');

var _createApp2 = _interopRequireDefault(_createApp);

var _createStore = require('react-utils/dist/createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _ApiClient = require('react-utils/dist/ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _reducer = require('./redux/reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dom-utils/ie8');
require('dom-utils/ie9');

;
module.exports = exports['default'];