'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {

  return (0, _createApp2.default)(options.state, (0, _createStore2.default)(_reducer2.default), _routes2.default, _ApiClient2.default, setMenuLinks);
};

var _createApp = require('@openagenda/react-utils/dist/createApp');

var _createApp2 = _interopRequireDefault(_createApp);

var _createStore = require('@openagenda/react-utils/dist/createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _ApiClient = require('@openagenda/react-utils/dist/ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _domUtils = require('@openagenda/dom-utils');

var _domUtils2 = _interopRequireDefault(_domUtils);

var _reactRouterRedux = require('react-router-redux');

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _reducer = require('../../redux/reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var normalizePrefix = function normalizePrefix(prefix) {
  return prefix.substr(-1) === '/' ? prefix.slice(0, -1) : prefix;
};

;

var setMenuLinks = function setMenuLinks(_ref) {
  var store = _ref.store;


  if (typeof document === 'undefined') return;

  var state = store.getState();
  var prefix = normalizePrefix(state.settings.prefix);

  var tabs = [{
    className: 'activities',
    to: prefix + '/activities'
  }];

  tabs.forEach(function (t) {

    _domUtils2.default.addEvent(_domUtils2.default.el('.js_menu_item_' + t.className), 'click', function (e) {

      e.preventDefault();
      store.dispatch((0, _reactRouterRedux.push)(t.to));
    });
  });
};
module.exports = exports['default'];
//# sourceMappingURL=index.js.map