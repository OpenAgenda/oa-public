'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = editApp;

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _editRoutes = require('./editRoutes');

var _editRoutes2 = _interopRequireDefault(_editRoutes);

var _domUtils = require('dom-utils');

var _domUtils2 = _interopRequireDefault(_domUtils);

var _reactRouterRedux = require('react-router-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var normalizePrefix = function normalizePrefix(prefix) {
  return prefix.substr(-1) === '/' ? prefix.slice(0, -1) : prefix;
};

function editApp(options) {

  var setMenuLinks = function setMenuLinks(_ref) {
    var store = _ref.store;


    if (typeof document === 'undefined') return;

    var state = store.getState();
    var prefix = normalizePrefix(state.settings.prefix);

    var tabs = [{
      className: 'settings_profile',
      to: prefix + '/profile'
    }, {
      className: 'settings_contribution',
      to: prefix + '/contribution'
    }];

    tabs.forEach(function (t) {

      _domUtils2.default.addEvent(_domUtils2.default.el('.js_menu_item_' + t.className), 'click', function (e) {

        e.preventDefault();
        console.log(t.to);
        store.dispatch((0, _reactRouterRedux.push)(t.to));
      });
    });
  };

  return (0, _app2.default)(options, _editRoutes2.default, setMenuLinks);
}
module.exports = exports['default'];