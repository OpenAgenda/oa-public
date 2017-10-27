'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.renderField = renderField;
exports.renderInput = renderInput;
exports.renderTextarea = renderTextarea;
exports.renderSelect = renderSelect;
exports.renderSearchInput = renderSearchInput;
exports.renderMarkdownInput = renderMarkdownInput;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Spinner = require('@openagenda/react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _MarkdownComponent = require('@openagenda/react-form-components/build/MarkdownComponent');

var _MarkdownComponent2 = _interopRequireDefault(_MarkdownComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

function renderField(_ref) {
  var content = _ref.content,
      _ref$input = _ref.input,
      name = _ref$input.name,
      value = _ref$input.value,
      label = _ref.label,
      subLabel = _ref.subLabel,
      max = _ref.max,
      classNameGroup = _ref.classNameGroup,
      visible = _ref.visible,
      displayError = _ref.displayError,
      _ref$displayFeedback = _ref.displayFeedback,
      displayFeedback = _ref$displayFeedback === undefined ? true : _ref$displayFeedback,
      errorOnDirty = _ref.errorOnDirty,
      meta = _ref.meta;
  var touched = meta.touched,
      error = meta.error,
      dirty = meta.dirty;

  displayError = displayError ? displayError(meta) : errorOnDirty ? dirty || touched : touched;

  if (visible === false) return _react2.default.createElement('div', null);

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
    displayError && displayFeedback && error && _react2.default.createElement(
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
}

function renderInput(_ref2) {
  var placeholder = _ref2.placeholder,
      className = _ref2.className,
      spellCheck = _ref2.spellCheck,
      props = _objectWithoutProperties(_ref2, ['placeholder', 'className', 'spellCheck']);

  var inputAttrs = { placeholder: placeholder, className: className, spellCheck: spellCheck };

  var content = _react2.default.createElement('input', _extends({}, props.input, inputAttrs));

  return renderField.call(this, _extends({ content: content }, props));
}

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

  return renderField.call(this, _extends({ content: content }, props));
}

function renderSelect(_ref4) {
  var className = _ref4.className,
      children = _ref4.children,
      props = _objectWithoutProperties(_ref4, ['className', 'children']);

  var inputAttrs = { className: className };

  var content = _react2.default.createElement(
    'select',
    _extends({}, props.input, inputAttrs),
    children
  );

  return renderField.call(this, _extends({ content: content }, props));
}

function renderSearchInput(_ref5) {
  var type = _ref5.type,
      placeholder = _ref5.placeholder,
      className = _ref5.className,
      spellCheck = _ref5.spellCheck,
      action = _ref5.action,
      loading = _ref5.loading,
      props = _objectWithoutProperties(_ref5, ['type', 'placeholder', 'className', 'spellCheck', 'action', 'loading']);

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

  return renderField.call(this, _extends({ content: content }, props));
};

function renderMarkdownInput(_ref6) {
  var _ref6$lang = _ref6.lang,
      lang = _ref6$lang === undefined ? 'fr' : _ref6$lang,
      label = _ref6.label,
      placeholder = _ref6.placeholder,
      className = _ref6.className,
      props = _objectWithoutProperties(_ref6, ['lang', 'label', 'placeholder', 'className']);

  var inputAttrs = { lang: lang, placeholder: placeholder, label: label, className: className };

  var content = _react2.default.createElement(_MarkdownComponent2.default, _extends({}, props.input, inputAttrs));

  return renderField.call(this, _extends({ content: content }, props));
};
//# sourceMappingURL=form.js.map