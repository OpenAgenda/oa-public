'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Spinner = require('react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

var SearchInput = function SearchInput(_ref) {
  var type = _ref.type,
      placeholder = _ref.placeholder,
      className = _ref.className,
      spellCheck = _ref.spellCheck,
      action = _ref.action,
      loading = _ref.loading,
      props = _objectWithoutProperties(_ref, ['type', 'placeholder', 'className', 'spellCheck', 'action', 'loading']);

  var inputAttrs = { type: type, placeholder: placeholder, className: className, spellCheck: spellCheck };
  var onChange = function onChange(e) {
    props.input.onChange(e.target.value);
    action();
  };

  var content = _react2.default.createElement(
    'div',
    { className: 'input-icon-right' },
    _react2.default.createElement('input', _extends({}, props.input, inputAttrs, { onChange: onChange })),
    _react2.default.createElement(
      'button',
      { type: 'submit', className: 'btn' },
      loading ? _react2.default.createElement(_Spinner2.default, { spinner: searchSpinner }) : _react2.default.createElement('i', { className: 'fa fa-search', 'aria-hidden': 'true' })
    )
  );

  return _react2.default.createElement(_.Field, _extends({ content: content }, props));
};

exports.default = SearchInput;
module.exports = exports['default'];