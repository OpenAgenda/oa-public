'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _jsxFileName = 'src/utils/form.js';
exports.renderField = renderField;
exports.renderInput = renderInput;
exports.renderTextarea = renderTextarea;
exports.renderSelect = renderSelect;
exports.renderSearchInput = renderSearchInput;
exports.renderMarkdownInput = renderMarkdownInput;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _Spinner = require('@openagenda/react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _MarkdownComponent = require('@openagenda/react-form-components/build/MarkdownComponent');

var _MarkdownComponent2 = _interopRequireDefault(_MarkdownComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

function renderField(props) {
  var content = props.content,
      _props$input = props.input,
      name = _props$input.name,
      value = _props$input.value,
      label = props.label,
      subLabel = props.subLabel,
      max = props.max,
      classNameGroup = props.classNameGroup,
      visible = props.visible,
      displayFeedback = props.displayFeedback,
      errorOnDirty = props.errorOnDirty,
      meta = props.meta,
      getErrorLabel = props.getErrorLabel;
  var touched = meta.touched,
      error = meta.error,
      dirty = meta.dirty;

  var displayError = props.displayError ? props.displayError(meta) : errorOnDirty ? dirty || touched : touched;

  if (visible === false) return _react2.default.createElement('div', {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21
    }
  });

  var className = (0, _classnames2.default)('form-group', classNameGroup, {
    'has-error has-feedback': displayError && error
  });

  var errorClassName = (0, _classnames2.default)('text-danger', {
    'pull-left': max
  });

  var maxClassName = (0, _classnames2.default)('text-right', {
    'text-danger': max - value.length < 0
  });

  return _react2.default.createElement(
    'div',
    { className: className, __source: {
        fileName: _jsxFileName,
        lineNumber: 46
      }
    },
    label && _react2.default.createElement(
      'label',
      { htmlFor: name, __source: {
          fileName: _jsxFileName,
          lineNumber: 47
        }
      },
      label
    ),
    subLabel,
    content,
    displayError && displayFeedback && error && _react2.default.createElement(
      'span',
      { className: 'form-control-feedback', __source: {
          fileName: _jsxFileName,
          lineNumber: 50
        }
      },
      _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true', __source: {
          fileName: _jsxFileName,
          lineNumber: 51
        }
      })
    ),
    displayError && error && _react2.default.createElement(
      'div',
      { className: errorClassName, __source: {
          fileName: _jsxFileName,
          lineNumber: 53
        }
      },
      getErrorLabel(error)
    ),
    max && _react2.default.createElement(
      'div',
      { className: maxClassName, __source: {
          fileName: _jsxFileName,
          lineNumber: 56
        }
      },
      max - value.length
    )
  );
}

function renderInput(_ref) {
  var placeholder = _ref.placeholder,
      className = _ref.className,
      spellCheck = _ref.spellCheck,
      props = (0, _objectWithoutProperties3.default)(_ref, ['placeholder', 'className', 'spellCheck']);


  var inputAttrs = { placeholder: placeholder, className: className, spellCheck: spellCheck };

  var content = _react2.default.createElement('input', (0, _extends3.default)({}, props.input, inputAttrs, {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 68
    }
  }));

  return renderField((0, _extends3.default)({ content: content }, props));
}

function renderTextarea(_ref2) {
  var placeholder = _ref2.placeholder,
      className = _ref2.className,
      rows = _ref2.rows,
      cols = _ref2.cols,
      spellCheck = _ref2.spellCheck,
      props = (0, _objectWithoutProperties3.default)(_ref2, ['placeholder', 'className', 'rows', 'cols', 'spellCheck']);


  var inputAttrs = { placeholder: placeholder, className: className, rows: rows, cols: cols, spellCheck: spellCheck };

  var content = _react2.default.createElement(
    'div',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 78
      }
    },
    _react2.default.createElement('textarea', (0, _extends3.default)({}, props.input, inputAttrs, {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 79
      }
    }))
  );

  return renderField((0, _extends3.default)({ content: content }, props));
}

function renderSelect(_ref3) {
  var className = _ref3.className,
      children = _ref3.children,
      props = (0, _objectWithoutProperties3.default)(_ref3, ['className', 'children']);


  var inputAttrs = { className: className };

  var content = _react2.default.createElement(
    'select',
    (0, _extends3.default)({}, props.input, inputAttrs, {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 90
      }
    }),
    children
  );

  return renderField((0, _extends3.default)({ content: content }, props));
}

function renderSearchInput(_ref4) {
  var type = _ref4.type,
      placeholder = _ref4.placeholder,
      className = _ref4.className,
      spellCheck = _ref4.spellCheck,
      action = _ref4.action,
      loading = _ref4.loading,
      props = (0, _objectWithoutProperties3.default)(_ref4, ['type', 'placeholder', 'className', 'spellCheck', 'action', 'loading']);


  var inputAttrs = { type: type, placeholder: placeholder, className: className, spellCheck: spellCheck };
  var onChange = function onChange(e) {
    props.input.onChange(e.target.value);
    action();
  };

  var content = _react2.default.createElement(
    'div',
    { className: 'input-icon-right', __source: {
        fileName: _jsxFileName,
        lineNumber: 106
      }
    },
    _react2.default.createElement('input', (0, _extends3.default)({}, props.input, inputAttrs, { onChange: onChange, __source: {
        fileName: _jsxFileName,
        lineNumber: 107
      }
    })),
    _react2.default.createElement(
      'button',
      { type: 'submit', className: 'btn', __source: {
          fileName: _jsxFileName,
          lineNumber: 108
        }
      },
      loading ? _react2.default.createElement(_Spinner2.default, { spinner: searchSpinner, __source: {
          fileName: _jsxFileName,
          lineNumber: 109
        }
      }) : _react2.default.createElement('i', { className: 'fa fa-search', 'aria-hidden': 'true', __source: {
          fileName: _jsxFileName,
          lineNumber: 109
        }
      })
    )
  );

  return renderField((0, _extends3.default)({ content: content }, props));
};

function renderMarkdownInput(_ref5) {
  var _ref5$lang = _ref5.lang,
      lang = _ref5$lang === undefined ? 'fr' : _ref5$lang,
      label = _ref5.label,
      placeholder = _ref5.placeholder,
      className = _ref5.className,
      props = (0, _objectWithoutProperties3.default)(_ref5, ['lang', 'label', 'placeholder', 'className']);


  var inputAttrs = { lang: lang, placeholder: placeholder, label: label, className: className };

  var content = _react2.default.createElement(_MarkdownComponent2.default, (0, _extends3.default)({}, props.input, inputAttrs, {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 121
    }
  }));

  return renderField((0, _extends3.default)({ content: content }, props));
};
//# sourceMappingURL=form.js.map