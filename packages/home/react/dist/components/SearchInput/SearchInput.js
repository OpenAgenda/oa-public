'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Spinner = require('@openagenda/react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      props = (0, _objectWithoutProperties3.default)(_ref, ['type', 'placeholder', 'className', 'spellCheck', 'action', 'loading']);

  var inputAttrs = { type: type, placeholder: placeholder, className: className, spellCheck: spellCheck };
  var onChange = function onChange(e) {
    props.input.onChange(e.target.value);
    action();
  };

  var content = _react2.default.createElement(
    'div',
    { className: 'input-icon-right' },
    _react2.default.createElement('input', (0, _extends3.default)({}, props.input, inputAttrs, { onChange: onChange })),
    _react2.default.createElement(
      'button',
      { type: 'submit', className: 'btn' },
      loading ? _react2.default.createElement(_Spinner2.default, { spinner: searchSpinner }) : _react2.default.createElement('i', { className: 'fa fa-search', 'aria-hidden': 'true' })
    )
  );

  return _react2.default.createElement(_.Field, (0, _extends3.default)({ content: content }, props));
};

exports.default = SearchInput;
module.exports = exports['default'];
//# sourceMappingURL=SearchInput.js.map