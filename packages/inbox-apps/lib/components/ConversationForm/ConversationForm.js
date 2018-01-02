'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _isObject2 = require('lodash/isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _dec,
    _dec2,
    _class,
    _class2,
    _temp,
    _jsxFileName = 'src/components/ConversationForm/ConversationForm.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _recompose = require('recompose');

var _reduxForm = require('redux-form');

var _validate = require('./validate');

var _validate2 = _interopRequireDefault(_validate);

var _form = require('../../utils/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  ConversationForm: {
    displayName: 'ConversationForm'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/ConversationForm/ConversationForm.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ConversationForm = _wrapComponent('ConversationForm')((_dec = (0, _reduxForm.reduxForm)({
  form: 'conversation',
  validate: _validate2.default
}), _dec2 = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(ConversationForm, _Component);

  function ConversationForm() {
    (0, _classCallCheck3.default)(this, ConversationForm);
    return (0, _possibleConstructorReturn3.default)(this, (ConversationForm.__proto__ || (0, _getPrototypeOf2.default)(ConversationForm)).apply(this, arguments));
  }

  (0, _createClass3.default)(ConversationForm, [{
    key: 'formatJsonValue',
    value: function formatJsonValue(value) {
      return (0, _isObject3.default)(value) ? (0, _stringify2.default)(value) : value;
    }
  }, {
    key: 'parseJsonValue',
    value: function parseJsonValue(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          getLabel = _props.getLabel,
          submit = _props.submit,
          handleSubmit = _props.handleSubmit,
          submitting = _props.submitting,
          Wrapper = _props.Wrapper;


      return (0, _react2.createElement)(Wrapper, { handleSubmit: handleSubmit, submitting: submitting }, _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 46
          }
        },
        _react3.default.createElement(_reduxForm.Field, {
          name: 'destinationInbox',
          component: 'input',
          type: 'hidden',
          format: this.formatJsonValue,
          parse: this.parseJsonValue,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 47
          }
        }),
        _react3.default.createElement(_reduxForm.Field, {
          name: 'type',
          component: 'input',
          type: 'hidden',
          __source: {
            fileName: _jsxFileName,
            lineNumber: 54
          }
        }),
        _react3.default.createElement(_reduxForm.Field, {
          name: 'params',
          component: 'input',
          type: 'hidden',
          format: this.formatJsonValue,
          parse: this.parseJsonValue,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 59
          }
        }),
        _react3.default.createElement(_reduxForm.Field, {
          component: _form.renderTextarea,
          name: 'message',
          className: 'form-control',
          classNameGroup: 'margin-v-xs',
          rows: '6',
          getErrorLabel: getLabel,
          onKeyDown: function onKeyDown(e) {
            if (e.keyCode === 13 && e.ctrlKey) {
              submit();
            }
          },
          placeholder: getLabel('yourMessage'),
          __source: {
            fileName: _jsxFileName,
            lineNumber: 66
          }
        })
      ));
    }
  }]);
  return ConversationForm;
}(_react2.Component), _class2.propTypes = {
  Wrapper: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.element])
}, _class2.defaultProps = {
  Wrapper: 'div'
}, _temp)) || _class) || _class));

exports.default = ConversationForm;
module.exports = exports['default'];
//# sourceMappingURL=ConversationForm.js.map