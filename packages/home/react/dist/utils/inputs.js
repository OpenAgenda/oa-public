'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.renderField = renderField;
exports.renderInput = renderInput;
exports.renderTextarea = renderTextarea;
exports.renderInputGroup = renderInputGroup;
exports.renderMarkdownInput = renderMarkdownInput;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _MarkdownComponent = require('react-form-components/build/MarkdownComponent');

var _MarkdownComponent2 = _interopRequireDefault(_MarkdownComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function renderField(_ref) {
  var content = _ref.content;
  var _ref$input = _ref.input;
  var name = _ref$input.name;
  var value = _ref$input.value;
  var label = _ref.label;
  var subLabel = _ref.subLabel;
  var max = _ref.max;
  var errorOnDirty = _ref.errorOnDirty;
  var _ref$meta = _ref.meta;
  var touched = _ref$meta.touched;
  var error = _ref$meta.error;
  var dirty = _ref$meta.dirty;

  var displayError = errorOnDirty ? dirty || touched : touched;
  return _react2.default.createElement(
    'div',
    { className: 'form-group ' + (displayError && error ? 'has-error has-feedback' : '') },
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
      this.context.getLabel(error)
    ),
    max && _react2.default.createElement(
      'div',
      { className: 'text-right ' + (max - value.length < 0 && 'text-danger' || '') },
      max - value.length
    )
  );
};

function renderInput(_ref2) {
  var type = _ref2.type;
  var placeholder = _ref2.placeholder;
  var className = _ref2.className;
  var spellCheck = _ref2.spellCheck;

  var props = _objectWithoutProperties(_ref2, ['type', 'placeholder', 'className', 'spellCheck']);

  var inputAttrs = { type: type, placeholder: placeholder, className: className, spellCheck: spellCheck };
  var content = _react2.default.createElement('input', _extends({}, props.input, inputAttrs));
  return renderField.bind(this)(_extends({ content: content }, props));
};

function renderTextarea(_ref3) {
  var placeholder = _ref3.placeholder;
  var className = _ref3.className;
  var rows = _ref3.rows;
  var cols = _ref3.cols;
  var spellCheck = _ref3.spellCheck;

  var props = _objectWithoutProperties(_ref3, ['placeholder', 'className', 'rows', 'cols', 'spellCheck']);

  var inputAttrs = { placeholder: placeholder, className: className, rows: rows, cols: cols, spellCheck: spellCheck };
  var content = _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement('textarea', _extends({}, props.input, inputAttrs))
  );
  return renderField.bind(this)(_extends({ content: content }, props));
};

function renderInputGroup(_ref4) {
  var type = _ref4.type;
  var placeholder = _ref4.placeholder;
  var className = _ref4.className;
  var before = _ref4.before;
  var after = _ref4.after;
  var spellCheck = _ref4.spellCheck;

  var props = _objectWithoutProperties(_ref4, ['type', 'placeholder', 'className', 'before', 'after', 'spellCheck']);

  var inputAttrs = { type: type, placeholder: placeholder, className: className, spellCheck: spellCheck };
  var content = _react2.default.createElement(
    'div',
    { className: 'input-group' },
    before,
    _react2.default.createElement('input', _extends({}, props.input, inputAttrs)),
    after
  );
  return renderField.bind(this)(_extends({ content: content }, props));
};

function renderMarkdownInput(_ref5) {
  var placeholder = _ref5.placeholder;
  var _ref5$className = _ref5.className;
  var className = _ref5$className === undefined ? '' : _ref5$className;
  var _ref5$lang = _ref5.lang;
  var lang = _ref5$lang === undefined ? 'fr' : _ref5$lang;

  var props = _objectWithoutProperties(_ref5, ['placeholder', 'className', 'lang']);

  var inputAttrs = { placeholder: placeholder, className: className, lang: lang };
  var content = _react2.default.createElement(_MarkdownComponent2.default, _extends({}, props.input, inputAttrs));
  return renderField.bind(this)(_extends({ content: content }, props));
}