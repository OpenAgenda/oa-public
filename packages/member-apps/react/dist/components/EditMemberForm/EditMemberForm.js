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

var _validate = require('./validate');

var _validate2 = _interopRequireDefault(_validate);

var _form = require('../../utils/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  EditMembersForm: {
    displayName: 'EditMembersForm'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/EditMemberForm/EditMemberForm.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var EditMembersForm = _wrapComponent('EditMembersForm')((_dec = (0, _reactRedux.connect)(function (state, props) {
  var custom = props.stakeholder && props.stakeholder.custom;
  return {
    initialValues: {
      organization: custom.organization,
      email: custom.email,
      contactNumber: custom.contactNumber,
      contactName: custom.contactName,
      contactPosition: custom.contactPosition,
      credential: props.stakeholder.credential
    },
    roles: state.agenda.roles,
    userCredential: state.stakeholder.credential
  };
}), _dec2 = (0, _reduxForm.reduxForm)({
  form: 'editMember',
  validate: _validate2.default
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(EditMembersForm, _Component);

  function EditMembersForm(props) {
    (0, _classCallCheck3.default)(this, EditMembersForm);

    var _this = (0, _possibleConstructorReturn3.default)(this, (EditMembersForm.__proto__ || (0, _getPrototypeOf2.default)(EditMembersForm)).call(this, props));

    _this.renderField = _form.renderField.bind(_this);
    _this.renderInput = _form.renderInput.bind(_this);
    _this.renderSelect = _form.renderSelect.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(EditMembersForm, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          handleSubmit = _props.handleSubmit,
          roles = _props.roles,
          userCredential = _props.userCredential;
      var getLabel = this.context.getLabel;


      var haveRole = function haveRole(value) {
        return roles.some(function (role) {
          return role.value === value;
        });
      };

      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit },
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('name'),
          component: this.renderInput,
          name: 'contactName',
          type: 'text',
          classNameGroup: 'margin-v-md',
          className: 'form-control'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('email'),
          component: this.renderInput,
          name: 'email',
          type: 'email',
          classNameGroup: 'margin-v-md',
          className: 'form-control'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('phone'),
          component: this.renderInput,
          name: 'contactNumber',
          type: 'text',
          classNameGroup: 'margin-v-md',
          className: 'form-control'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('position'),
          component: this.renderInput,
          name: 'contactPosition',
          type: 'text',
          classNameGroup: 'margin-v-md',
          className: 'form-control'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('organization'),
          component: this.renderInput,
          name: 'organization',
          type: 'text',
          classNameGroup: 'margin-v-md',
          className: 'form-control'
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
          userCredential === 2 && haveRole(3) && _react3.default.createElement(
            'option',
            { value: '3' },
            getLabel('moderator')
          ),
          userCredential === 2 && haveRole(2) && _react3.default.createElement(
            'option',
            { value: '2' },
            getLabel('administrator')
          )
        ),
        _react3.default.createElement(
          'div',
          { className: 'text-center' },
          _react3.default.createElement(
            'button',
            { role: 'submit', className: 'btn btn-primary' },
            getLabel('editProfile')
          )
        )
      );
    }
  }]);
  return EditMembersForm;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func
}, _temp)) || _class) || _class));

exports.default = EditMembersForm;
module.exports = exports['default'];