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
      contactPosition: custom.contactPosition
    }
  };
}), _dec2 = (0, _reduxForm.reduxForm)({
  form: 'editMember',
  validate: _validate2.default
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  _inherits(EditMembersForm, _Component);

  function EditMembersForm(props) {
    _classCallCheck(this, EditMembersForm);

    var _this = _possibleConstructorReturn(this, (EditMembersForm.__proto__ || Object.getPrototypeOf(EditMembersForm)).call(this, props));

    _this.renderField = _form.renderField.bind(_this);
    _this.renderInput = _form.renderInput.bind(_this);
    return _this;
  }

  _createClass(EditMembersForm, [{
    key: 'render',
    value: function render() {
      var handleSubmit = this.props.handleSubmit;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit },
        _react3.default.createElement(_reduxForm.Field, {
          label: 'Name',
          component: this.renderInput,
          name: 'contactName',
          type: 'text',
          classNameGroup: 'margin-v-md',
          className: 'form-control'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: 'Email',
          component: this.renderInput,
          name: 'email',
          type: 'email',
          classNameGroup: 'margin-v-md',
          className: 'form-control'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: 'Tel',
          component: this.renderInput,
          name: 'contactNumber',
          type: 'text',
          classNameGroup: 'margin-v-md',
          className: 'form-control',
          placeholder: ''
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: 'Position',
          component: this.renderInput,
          name: 'contactPosition',
          type: 'text',
          classNameGroup: 'margin-v-md',
          className: 'form-control',
          placeholder: ''
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: 'Organization',
          component: this.renderInput,
          name: 'organization',
          type: 'text',
          classNameGroup: 'margin-v-md',
          className: 'form-control',
          placeholder: ''
        }),
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
  getLabel: _react2.PropTypes.func
}, _temp)) || _class) || _class));

exports.default = EditMembersForm;
module.exports = exports['default'];