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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function renderField(_ref) {
  var content = _ref.content,
      _ref$input = _ref.input,
      name = _ref$input.name,
      value = _ref$input.value,
      type = _ref$input.type,
      label = _ref.label,
      subLabel = _ref.subLabel,
      max = _ref.max,
      displayError = _ref.displayError,
      _ref$formGroupClass = _ref.formGroupClass,
      formGroupClass = _ref$formGroupClass === undefined ? true : _ref$formGroupClass,
      meta = _ref.meta,
      _ref$meta = _ref.meta,
      error = _ref$meta.error,
      touched = _ref$meta.touched;

  var errorDisplayed = displayError ? displayError(meta) : touched;
  return _react2.default.createElement(
    'div',
    {
      className: (0, _classnames2.default)({
        'form-group': type !== 'hidden' || !formGroupClass,
        'has-error has-feedback': errorDisplayed && error
      })
    },
    label && _react2.default.createElement(
      'label',
      { htmlFor: name },
      label
    ),
    subLabel,
    content,
    errorDisplayed && error && _react2.default.createElement(
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
  var type = _ref2.type,
      placeholder = _ref2.placeholder,
      className = _ref2.className,
      spellCheck = _ref2.spellCheck,
      props = _objectWithoutProperties(_ref2, ['type', 'placeholder', 'className', 'spellCheck']);

  var inputAttrs = { type: type, placeholder: placeholder, className: className, spellCheck: spellCheck };
  var content = _react2.default.createElement('input', _extends({}, props.input, inputAttrs));
  return renderField.bind(this)(_extends({ content: content }, props));
};

function renderTextarea(_ref3) {
  var placeholder = _ref3.placeholder,
      className = _ref3.className,
      rows = _ref3.rows,
      cols = _ref3.cols,
      spellCheck = _ref3.spellCheck,
      props = _objectWithoutProperties(_ref3, ['placeholder', 'className', 'rows', 'cols', 'spellCheck']);

  var inputAttrs = { placeholder: placeholder, className: className, rows: rows, cols: cols, spellCheck: spellCheck };
  var content = _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement('textarea', _extends({}, props.input, inputAttrs))
  );
  return renderField.bind(this)(_extends({ content: content }, props));
};

function renderInputGroup(_ref4) {
  var type = _ref4.type,
      placeholder = _ref4.placeholder,
      className = _ref4.className,
      before = _ref4.before,
      after = _ref4.after,
      spellCheck = _ref4.spellCheck,
      props = _objectWithoutProperties(_ref4, ['type', 'placeholder', 'className', 'before', 'after', 'spellCheck']);

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
  var placeholder = _ref5.placeholder,
      _ref5$className = _ref5.className,
      className = _ref5$className === undefined ? '' : _ref5$className,
      _ref5$lang = _ref5.lang,
      lang = _ref5$lang === undefined ? 'fr' : _ref5$lang,
      props = _objectWithoutProperties(_ref5, ['placeholder', 'className', 'lang']);

  var inputAttrs = { placeholder: placeholder, className: className, lang: lang };
  var content = _react2.default.createElement(_MarkdownComponent2.default, _extends({}, props.input, inputAttrs));
  return renderField.bind(this)(_extends({ content: content }, props));
}
//# sourceMappingURL=inputs.js.map