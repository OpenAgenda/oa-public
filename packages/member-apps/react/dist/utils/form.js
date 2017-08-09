'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

exports.renderField = renderField;
exports.renderInput = renderInput;
exports.renderTextarea = renderTextarea;
exports.renderSelect = renderSelect;
exports.renderSearchInput = renderSearchInput;
exports.renderMarkdownInput = renderMarkdownInput;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Spinner = require('react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _MarkdownComponent = require('react-form-components/build/MarkdownComponent');

var _MarkdownComponent2 = _interopRequireDefault(_MarkdownComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      props = (0, _objectWithoutProperties3.default)(_ref2, ['placeholder', 'className', 'spellCheck']);


  var inputAttrs = { placeholder: placeholder, className: className, spellCheck: spellCheck };

  var content = _react2.default.createElement('input', (0, _extends3.default)({}, props.input, inputAttrs));

  return renderField.call(this, (0, _extends3.default)({ content: content }, props));
}

function renderTextarea(_ref3) {
  var placeholder = _ref3.placeholder,
      className = _ref3.className,
      rows = _ref3.rows,
      cols = _ref3.cols,
      spellCheck = _ref3.spellCheck,
      props = (0, _objectWithoutProperties3.default)(_ref3, ['placeholder', 'className', 'rows', 'cols', 'spellCheck']);


  var inputAttrs = { placeholder: placeholder, className: className, rows: rows, cols: cols, spellCheck: spellCheck };

  var content = _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement('textarea', (0, _extends3.default)({}, props.input, inputAttrs))
  );

  return renderField.call(this, (0, _extends3.default)({ content: content }, props));
}

function renderSelect(_ref4) {
  var className = _ref4.className,
      children = _ref4.children,
      props = (0, _objectWithoutProperties3.default)(_ref4, ['className', 'children']);


  var inputAttrs = { className: className };

  var content = _react2.default.createElement(
    'select',
    (0, _extends3.default)({}, props.input, inputAttrs),
    children
  );

  return renderField.call(this, (0, _extends3.default)({ content: content }, props));
}

function renderSearchInput(_ref5) {
  var type = _ref5.type,
      placeholder = _ref5.placeholder,
      className = _ref5.className,
      spellCheck = _ref5.spellCheck,
      action = _ref5.action,
      loading = _ref5.loading,
      props = (0, _objectWithoutProperties3.default)(_ref5, ['type', 'placeholder', 'className', 'spellCheck', 'action', 'loading']);


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

  return renderField.call(this, (0, _extends3.default)({ content: content }, props));
};

function renderMarkdownInput(_ref6) {
  var _ref6$lang = _ref6.lang,
      lang = _ref6$lang === undefined ? 'fr' : _ref6$lang,
      label = _ref6.label,
      placeholder = _ref6.placeholder,
      className = _ref6.className,
      loadComponent = _ref6.loadComponent,
      props = (0, _objectWithoutProperties3.default)(_ref6, ['lang', 'label', 'placeholder', 'className', 'loadComponent']);


  var inputAttrs = { lang: lang, placeholder: placeholder, label: label, className: className, loadComponent: loadComponent };

  var content = _react2.default.createElement(_MarkdownComponent2.default, (0, _extends3.default)({}, props.input, inputAttrs));

  return renderField.call(this, (0, _extends3.default)({ content: content }, props));
};
//# sourceMappingURL=form.js.map