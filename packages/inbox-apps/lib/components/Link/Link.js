'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

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
  var _extends2;

  return (0, _extends4.default)({}, (0, _omit3.default)(props, 'prefix', 'external', props.external ? 'to' : undefined), (_extends2 = {}, (0, _defineProperty3.default)(_extends2, props.external ? 'href' : 'to', (props.external ? '' : (0, _removeTrailingSlash2.default)(props.prefix)) + props.to), (0, _defineProperty3.default)(_extends2, 'component', props.external ? 'a' : _reactRouter.Link), (0, _defineProperty3.default)(_extends2, 'dispatch', undefined), _extends2));
}))((0, _recompose.componentFromProp)('component'));

exports.default = Link;
module.exports = exports['default'];
//# sourceMappingURL=Link.js.map