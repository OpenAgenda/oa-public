'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (store) {

  var state = store.getState();
  var basename = state.settings.prefix;

  return _react2.default.createElement(
    _reactRouter.Route,
    { path: basename, component: _containers.UserApp },
    _react2.default.createElement(_reactRouter.IndexRoute, { component: _containers.UserDashboard })
  );
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _containers = require('../../containers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
module.exports = exports['default'];
//# sourceMappingURL=routes.js.map