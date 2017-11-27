'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _omit2 = require('lodash/omit');

var _omit3 = _interopRequireDefault(_omit2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _recompose = require('recompose');

var _reactRouter = require('react-router');

var _removeTrailingSlash = require('../../utils/removeTrailingSlash');

var _removeTrailingSlash2 = _interopRequireDefault(_removeTrailingSlash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Link = (0, _recompose.compose)((0, _reactRedux.connect)(function (state) {
  return {
    prefix: state.settings.prefix
  };
}), (0, _recompose.mapProps)(function (props) {
  return (0, _extends3.default)({}, (0, _omit3.default)(props, 'prefix', 'external'), {
    dispatch: undefined,
    to: (props.external ? '' : (0, _removeTrailingSlash2.default)(props.prefix)) + props.to
  });
}))(_reactRouter.Link);

exports.default = Link;
module.exports = exports['default'];
//# sourceMappingURL=Link.js.map