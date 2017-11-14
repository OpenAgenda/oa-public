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

var _dec, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxForm = require('redux-form');

var _Spinner = require('@openagenda/react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _validate = require('./validate');

var _validate2 = _interopRequireDefault(_validate);

var _form = require('../../utils/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  SendMessageForm: {
    displayName: 'SendMessageForm'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/SendMessageForm/SendMessageForm.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var SendMessageForm = _wrapComponent('SendMessageForm')((_dec = (0, _reduxForm.reduxForm)({
  form: 'writeToMembers',
  validate: _validate2.default
}), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(SendMessageForm, _Component);

  function SendMessageForm(props) {
    (0, _classCallCheck3.default)(this, SendMessageForm);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SendMessageForm.__proto__ || (0, _getPrototypeOf2.default)(SendMessageForm)).call(this, props));

    _this.renderField = _form.renderField.bind(_this);
    _this.renderInput = _form.renderInput.bind(_this);
    _this.renderTextarea = _form.renderTextarea.bind(_this);
    _this.renderSelect = _form.renderSelect.bind(_this);
    _this.renderMarkdownInput = _form.renderMarkdownInput.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(SendMessageForm, [{
    key: 'render',
    value: function render() {
      var handleSubmit = this.props.handleSubmit;
      var _context = this.context,
          getLabel = _context.getLabel,
          lang = _context.lang;


      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit, className: 'invite-members-form' },
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('replyTo'),
          component: this.renderInput,
          name: 'replyTo',
          type: 'text',
          classNameGroup: 'margin-v-md',
          className: 'form-control',
          placeholder: lang === 'fr' ? 'ne-pas-repondre@openagenda.com' : 'no-reply@openagenda.com'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('message'),
          component: this.renderMarkdownInput,
          name: 'message',
          classNameGroup: 'margin-top-md margin-bottom-lg',
          displayFeedback: false,
          loadComponent: _react3.default.createElement(
            'div',
            { style: { height: '200px', position: 'relative' } },
            _react3.default.createElement(_Spinner2.default, null)
          )
        }),
        _react3.default.createElement(
          'div',
          { className: 'text-center' },
          _react3.default.createElement(
            'button',
            { className: 'btn btn-primary', role: 'submit' },
            getLabel('sendMessage')
          )
        )
      );
    }
  }]);
  return SendMessageForm;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func,
  lang: _propTypes2.default.string
}, _temp)) || _class));

exports.default = SendMessageForm;
module.exports = exports['default'];
//# sourceMappingURL=SendMessageForm.js.map