'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (store) {

  var state = store.getState();
  var basename = state.settings.prefix;

  var setTab = function setTab(tab) {
    return function () {
      return store.dispatch((0, _menu.setTab)(tab));
    };
  };

  return _react2.default.createElement(
    _reactRouter.Route,
    { path: basename || '/', component: _containers.App, tab: actualTab },
    _react2.default.createElement(_reactRouter.IndexRoute, { component: _containers.Agendas, onEnter: setTab('agendas') }),
    _react2.default.createElement(_reactRouter.Route, { path: 'events', component: _containers.Events, onEnter: setTab('events') })
  );
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _menu = require('./redux/modules/menu');

var _containers = require('./containers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var actualTab = null;

;
module.exports = exports['default'];