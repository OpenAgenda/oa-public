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

function editApp(options) {

  var setMenuLinks = function setMenuLinks(_ref) {
    var store = _ref.store;


    if (typeof document === 'undefined') return;

    var tabs = [{
      className: 'settings_profile'
    }, {
      className: 'settings_contribution'
    }, {
      className: 'settings_advanced'
    }];

    tabs.forEach(function (t) {

      var elem = _domUtils2.default.el('.js_menu_item_' + t.className);

      _domUtils2.default.addEvent(elem, 'click', function (e) {

        _domUtils2.default.preventDefault(e);

        store.dispatch((0, _reactRouterRedux.push)(elem.querySelector('a').getAttribute('href')));
      });
    });
  };

  return (0, _app2.default)(options, _editRoutes2.default, setMenuLinks);
}
module.exports = exports['default'];
//# sourceMappingURL=editApp.js.map