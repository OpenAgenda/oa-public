'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRoutes;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _containers = require('./containers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createRoutes(store) {

  var state = store.getState();

  return _react2.default.createElement(
    _reactRouter.Route,
    { path: state.settings.prefix, component: _containers.CreationApp },
    _react2.default.createElement(_reactRouter.IndexRoute, { component: _containers.AgendaCreation })
  );
}
module.exports = exports['default'];
//# sourceMappingURL=createRoutes.js.map