'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _class, _class2, _temp;

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _validate = require('./validate');

var _validate2 = _interopRequireDefault(_validate);

var _form = require('../../utils/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  InviteMembersForm: {
    displayName: 'InviteMembersForm'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/SendMessageForm/InviteMembersForm.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var InviteMembersForm = _wrapComponent('InviteMembersForm')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    roles: state.agenda.roles,
    invitationMessage: state.agenda.credentials.invitationMessage,
    userCredential: state.stakeholder.credential
  };
}), _dec2 = (0, _reduxForm.reduxForm)({
  form: 'inviteMembers',
  validate: _validate2.default
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  _inherits(InviteMembersForm, _Component);

  function InviteMembersForm(props) {
    _classCallCheck(this, InviteMembersForm);

    var _this = _possibleConstructorReturn(this, (InviteMembersForm.__proto__ || Object.getPrototypeOf(InviteMembersForm)).call(this, props));

    _this.renderField = _form.renderField.bind(_this);
    _this.renderTextarea = _form.renderTextarea.bind(_this);
    _this.renderSelect = _form.renderSelect.bind(_this);
    _this.renderMarkdownInput = _form.renderMarkdownInput.bind(_this);
    return _this;
  }

  _createClass(InviteMembersForm, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          handleSubmit = _props.handleSubmit,
          userCredential = _props.userCredential,
          invitationMessage = _props.invitationMessage;
      var getLabel = this.context.getLabel;


      var haveRole = function haveRole(value) {
        return _this2.props.roles.some(function (role) {
          return role.value === value;
        });
      };

      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit, className: 'invite-members-form' },
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('emails'),
          subLabel: _react3.default.createElement(
            'p',
            { className: 'text-muted' },
            getLabel('inviteMembersPlaceholder')
          ),
          component: this.renderTextarea,
          name: 'emails',
          type: 'textarea',
          classNameGroup: 'emails-input margin-v-md',
          className: 'form-control',
          rows: '5',
          displayFeedback: false,
          normalize: function normalize(value) {
            return value;
          },
          format: function format(value) {
            return value;
          }
        }),
        _react3.default.createElement(
          _reduxForm.Field,
          {
            label: getLabel('role'),
            component: this.renderSelect,
            name: 'credential',
            type: 'select',
            classNameGroup: 'margin-top-md margin-bottom-lg',
            className: 'form-control',
            defaultValue: '0',
            displayFeedback: false,
            parse: function parse(v) {
              return parseInt(v);
            }
          },
          _react3.default.createElement(
            'option',
            { value: '0', hidden: true },
            getLabel('selectRole')
          ),
          haveRole(4) && _react3.default.createElement(
            'option',
            { value: '4' },
            getLabel('reader')
          ),
          haveRole(1) && _react3.default.createElement(
            'option',
            { value: '1' },
            getLabel('contributor')
          ),
          userCredential !== 3 && haveRole(3) && _react3.default.createElement(
            'option',
            { value: '3' },
            getLabel('moderator')
          ),
          userCredential !== 3 && haveRole(2) && _react3.default.createElement(
            'option',
            { value: '2' },
            getLabel('administrator')
          )
        ),
        invitationMessage && _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('message'),
          component: this.renderMarkdownInput,
          name: 'message',
          classNameGroup: 'margin-top-md margin-bottom-lg'
        }),
        _react3.default.createElement(
          'div',
          { className: 'text-center' },
          _react3.default.createElement(
            'button',
            { className: 'btn btn-primary', role: 'submit' },
            getLabel('inviteMembers')
          )
        )
      );
    }
  }]);

  return InviteMembersForm;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _react2.PropTypes.func
}, _temp)) || _class) || _class));

exports.default = InviteMembersForm;
module.exports = exports['default'];