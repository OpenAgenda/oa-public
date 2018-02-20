'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchApp = undefined;

var _matchAppMw = require('@openagenda/react-utils/dist/matchAppMw');

var _matchAppMw2 = _interopRequireDefault(_matchAppMw);

var _createStore = require('@openagenda/react-utils/dist/createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _ApiClient = require('@openagenda/react-utils/dist/ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _reducer = require('./redux/reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matchApp = exports.matchApp = (0, _matchAppMw2.default)((0, _createStore2.default)(_reducer2.default), _routes2.default, _ApiClient2.default);
//# sourceMappingURL=middleware.js.map