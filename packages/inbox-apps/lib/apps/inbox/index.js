'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _noop2 = require('lodash/noop');

var _noop3 = _interopRequireDefault(_noop2);

var _partialRight2 = require('lodash/partialRight');

var _partialRight3 = _interopRequireDefault(_partialRight2);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

exports.default = function (options) {

  var params = (0, _merge3.default)({
    selectMenuItem: false
  }, options);

  var routesGetter = params.selectMenuItem ? (0, _partialRight3.default)(_routes2.default, { selectMenuItem: true }) : _routes2.default;

  return (0, _createApp2.default)({
    state: params.state,
    createHistory: _createBrowserHistory2.default,
    createStore: (0, _createStore2.default)(_reducer2.default),
    getRoutes: routesGetter,
    ApiClient: _ApiClient2.default,
    beforeCreate: params.selectMenuItem ? setMenuLinks : _noop3.default
  });
};

var _createApp = require('@openagenda/react-utils/dist/createApp');

var _createApp2 = _interopRequireDefault(_createApp);

var _createStore = require('@openagenda/react-utils/dist/createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _ApiClient = require('@openagenda/react-utils/dist/ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _domUtils = require('@openagenda/dom-utils');

var _domUtils2 = _interopRequireDefault(_domUtils);

var _createBrowserHistory = require('history/lib/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _reactRouterRedux = require('react-router-redux');

var _routes = require('../../routes');

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
    classNamePart: 'inbox',
    to: prefix + '/'
  }];

  tabs.forEach(function (t) {

    _domUtils2.default.addEvent(_domUtils2.default.el('.js_menu_item_' + t.classNamePart), 'click', function (e) {

      e.preventDefault();
      store.dispatch((0, _reactRouterRedux.push)(t.to));
    });
  });
};
module.exports = exports['default'];
//# sourceMappingURL=index.js.map