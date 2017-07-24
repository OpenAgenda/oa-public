'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (store) {

  var state = store.getState();
  var basename = state.settings.prefix;

  return _react2.default.createElement(
    _reactRouter.Route,
    { path: basename, component: _containers.AgendaApp },
    _react2.default.createElement(_reactRouter.IndexRoute, { component: _containers.AgendaDashboard, onEnter: selectItem('activities') }),
    _react2.default.createElement(_reactRouter.Route, { path: 'activities', component: _containers.AgendaDashboard, onEnter: selectItem('activities') })
  );
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _containers = require('../../containers');

var _domUtils = require('dom-utils');

var _domUtils2 = _interopRequireDefault(_domUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function selectItem(item) {

  return function () {
    if (typeof document !== 'undefined') {
      var elems = _domUtils2.default.els('.js_menu_item');
      var elem = _domUtils2.default.el('.js_menu_item_' + item);

      elems.forEach(function (e) {
        _domUtils2.default.removeClass(e, 'selected');
        _domUtils2.default.removeClass(_domUtils2.default.el(e, 'a'), 'active');
      });

      if (elem) {
        _domUtils2.default.addClass(elem, 'selected');
        _domUtils2.default.addClass(_domUtils2.default.el(elem, 'a'), 'active');
      }
    }
  };
}

;
module.exports = exports['default'];