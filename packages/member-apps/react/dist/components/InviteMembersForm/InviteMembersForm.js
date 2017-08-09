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

var _dec, _dec2, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _validate = require('./validate');

var _validate2 = _interopRequireDefault(_validate);

var _form = require('../../utils/form');

var _Spinner = require('react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  InviteMembersForm: {
    displayName: 'InviteMembersForm'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/InviteMembersForm/InviteMembersForm.js',
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
    userCredential: state.stakeholder.credential,
    inviteLoading: state.members.inviteLoading
  };
}), _dec2 = (0, _reduxForm.reduxForm)({
  form: 'inviteMembers',
  validate: _validate2.default
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(InviteMembersForm, _Component);

  function InviteMembersForm(props) {
    (0, _classCallCheck3.default)(this, InviteMembersForm);

    var _this = (0, _possibleConstructorReturn3.default)(this, (InviteMembersForm.__proto__ || (0, _getPrototypeOf2.default)(InviteMembersForm)).call(this, props));

    _this.renderField = _form.renderField.bind(_this);
    _this.renderTextarea = _form.renderTextarea.bind(_this);
    _this.renderSelect = _form.renderSelect.bind(_this);
    _this.renderMarkdownInput = _form.renderMarkdownInput.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(InviteMembersForm, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          handleSubmit = _props.handleSubmit,
          userCredential = _props.userCredential,
          invitationMessage = _props.invitationMessage,
          inviteLoading = _props.inviteLoading;
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
            { className: (0, _classnames2.default)('btn btn-primary', { disabled: inviteLoading }), role: 'submit' },
            getLabel('inviteMembers')
          )
        ),
        inviteLoading && _react3.default.createElement(_Spinner2.default, null)
      );
    }
  }]);
  return InviteMembersForm;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func
}, _temp)) || _class) || _class));

exports.default = InviteMembersForm;
module.exports = exports['default'];
//# sourceMappingURL=InviteMembersForm.js.map