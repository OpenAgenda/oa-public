'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
    _jsxFileName = 'src/components/MessageForm/MessageForm.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxForm = require('redux-form');

var _recompose = require('recompose');

var _validate = require('./validate');

var _validate2 = _interopRequireDefault(_validate);

var _ = require('../');

var _form = require('../../utils/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  MessageForm: {
    displayName: 'MessageForm'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/MessageForm/MessageForm.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var MessageForm = _wrapComponent('MessageForm')((_dec = (0, _reduxForm.reduxForm)({
  validate: _validate2.default
}), _dec2 = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(MessageForm, _Component);

  function MessageForm() {
    (0, _classCallCheck3.default)(this, MessageForm);
    return (0, _possibleConstructorReturn3.default)(this, (MessageForm.__proto__ || (0, _getPrototypeOf2.default)(MessageForm)).apply(this, arguments));
  }

  (0, _createClass3.default)(MessageForm, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          handleSubmit = _props.handleSubmit,
          submit = _props.submit,
          submitting = _props.submitting,
          getLabel = _props.getLabel,
          Wrapper = _props.Wrapper,
          error = _props.error;


      return (0, _react2.createElement)(Wrapper, { handleSubmit: handleSubmit, submitting: submitting, error: error }, _react3.default.createElement(_reduxForm.Field, {
        component: _form.renderTextarea,
        name: 'body',
        className: 'form-control',
        classNameGroup: 'margin-v-xs',
        rows: '3',
        getErrorLabel: getLabel,
        onKeyDown: function onKeyDown(e) {
          if (e.keyCode === 13 && e.ctrlKey) {
            submit();
          }
        },
        placeholder: getLabel('yourMessage'),
        __source: {
          fileName: _jsxFileName,
          lineNumber: 33
        }
      }));
    }
  }]);
  return MessageForm;
}(_react2.Component), _class2.propTypes = {
  Wrapper: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.element])
}, _class2.defaultProps = {
  Wrapper: 'div'
}, _temp)) || _class) || _class));

exports.default = MessageForm;
module.exports = exports['default'];
//# sourceMappingURL=MessageForm.js.map