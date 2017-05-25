'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Field = function Field(_ref) {
  var content = _ref.content,
      _ref$input = _ref.input,
      name = _ref$input.name,
      value = _ref$input.value,
      label = _ref.label,
      subLabel = _ref.subLabel,
      max = _ref.max,
      classNameGroup = _ref.classNameGroup,
      _ref$visible = _ref.visible,
      visible = _ref$visible === undefined ? true : _ref$visible,
      errorOnDirty = _ref.errorOnDirty,
      _ref$meta = _ref.meta,
      touched = _ref$meta.touched,
      error = _ref$meta.error,
      dirty = _ref$meta.dirty;

  var displayError = errorOnDirty ? dirty || touched : touched;

  if (!visible) return _react2.default.createElement('div', null);

  return _react2.default.createElement(
    'div',
    { className: 'form-group ' + classNameGroup + ' ' + (displayError && error ? 'has-error has-feedback' : '') },
    label && _react2.default.createElement(
      'label',
      { htmlFor: name },
      label
    ),
    subLabel,
    content,
    displayError && error && _react2.default.createElement(
      'span',
      { className: 'form-control-feedback' },
      _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' })
    ),
    displayError && error && _react2.default.createElement(
      'div',
      { className: 'text-danger ' + (max && 'pull-left' || '') },
      undefined.context.getLabel(error)
    ),
    max && _react2.default.createElement(
      'div',
      { className: 'text-right ' + (max - value.length < 0 && 'text-danger' || '') },
      max - value.length
    )
  );
};

exports.default = Field;
module.exports = exports['default'];