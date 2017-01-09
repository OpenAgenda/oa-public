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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _class2, _temp, _initialiseProps;

var _reduxForm = require('redux-form');

var _validate = require('./validate');

var _validate2 = _interopRequireDefault(_validate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var InviteMembersForm = _wrapComponent('InviteMembersForm')((_dec = (0, _reduxForm.reduxForm)({
  form: 'inviteMembers',
  validate: _validate2.default
}), _dec(_class = (_temp = _class2 = function (_Component) {
  _inherits(InviteMembersForm, _Component);

  function InviteMembersForm(props) {
    _classCallCheck(this, InviteMembersForm);

    var _this = _possibleConstructorReturn(this, (InviteMembersForm.__proto__ || Object.getPrototypeOf(InviteMembersForm)).call(this, props));

    _initialiseProps.call(_this);

    _this.renderField = _this.renderField.bind(_this);
    _this.renderTextarea = _this.renderTextarea.bind(_this);
    _this.renderSelect = _this.renderSelect.bind(_this);
    return _this;
  }

  _createClass(InviteMembersForm, [{
    key: 'render',
    value: function render() {
      var handleSubmit = this.props.handleSubmit;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit },
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('emails'),
          component: this.renderTextarea,
          name: 'emails',
          type: 'textarea',
          classNameGroup: 'search margin-v-md',
          className: 'form-control',
          rows: '5',
          placeholder: getLabel('inviteMembersPlaceholder')
        }),
        _react3.default.createElement(
          _reduxForm.Field,
          {
            label: getLabel('role'),
            component: this.renderSelect,
            name: 'role',
            type: 'select',
            classNameGroup: 'search margin-top-md margin-bottom-lg',
            className: 'form-control'
          },
          _react3.default.createElement(
            'option',
            { selected: true, disabled: true },
            getLabel('selectRole')
          ),
          _react3.default.createElement(
            'option',
            { value: '4' },
            getLabel('reader')
          ),
          _react3.default.createElement(
            'option',
            { value: '1' },
            getLabel('contributor')
          ),
          _react3.default.createElement(
            'option',
            { value: '3' },
            getLabel('moderator')
          ),
          _react3.default.createElement(
            'option',
            { value: '2' },
            getLabel('administrator')
          )
        )
      );
    }
  }]);

  return InviteMembersForm;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _react2.PropTypes.func
}, _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.renderField = function (_ref) {
    var content = _ref.content,
        _ref$input = _ref.input,
        name = _ref$input.name,
        value = _ref$input.value,
        label = _ref.label,
        subLabel = _ref.subLabel,
        max = _ref.max,
        classNameGroup = _ref.classNameGroup,
        visible = _ref.visible,
        errorOnDirty = _ref.errorOnDirty,
        _ref$meta = _ref.meta,
        touched = _ref$meta.touched,
        error = _ref$meta.error,
        dirty = _ref$meta.dirty;

    var displayError = errorOnDirty ? dirty || touched : touched;

    if (visible === false) return _react3.default.createElement('div', null);

    return _react3.default.createElement(
      'div',
      { className: 'form-group ' + classNameGroup + ' ' + (displayError && error ? 'has-error has-feedback' : '') },
      label && _react3.default.createElement(
        'label',
        { htmlFor: name },
        label
      ),
      subLabel,
      content,
      displayError && error && _react3.default.createElement(
        'span',
        { className: 'form-control-feedback' },
        _react3.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' })
      ),
      displayError && error && _react3.default.createElement(
        'div',
        { className: 'text-danger ' + (max && 'pull-left' || '') },
        _this2.context.getLabel(error)
      ),
      max && _react3.default.createElement(
        'div',
        { className: 'text-right ' + (max - value.length < 0 && 'text-danger' || '') },
        max - value.length
      )
    );
  };

  this.renderTextarea = function (_ref2) {
    var placeholder = _ref2.placeholder,
        className = _ref2.className,
        rows = _ref2.rows,
        cols = _ref2.cols,
        spellCheck = _ref2.spellCheck,
        props = _objectWithoutProperties(_ref2, ['placeholder', 'className', 'rows', 'cols', 'spellCheck']);

    var inputAttrs = { placeholder: placeholder, className: className, rows: rows, cols: cols, spellCheck: spellCheck };

    var content = _react3.default.createElement(
      'div',
      null,
      _react3.default.createElement('textarea', _extends({}, props.input, inputAttrs))
    );

    return _this2.renderField(_extends({ content: content }, props));
  };

  this.renderSelect = function (_ref3) {
    var className = _ref3.className,
        children = _ref3.children,
        props = _objectWithoutProperties(_ref3, ['className', 'children']);

    var inputAttrs = { className: className };

    var content = _react3.default.createElement(
      'select',
      _extends({}, props.input, inputAttrs),
      children
    );

    return _this2.renderField(_extends({ content: content }, props));
  };
}, _temp)) || _class));

exports.default = InviteMembersForm;
module.exports = exports['default'];