"use strict";

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    _require = require('redux-form'),
    reduxForm = _require.reduxForm,
    _require2 = require('@openagenda/utils'),
    capitalize = _require2.capitalize,
    _require3 = require('react-router-redux'),
    push = _require3.push,
    _require4 = require('react-redux'),
    connect = _require4.connect;

var domOnlyProps = function domOnlyProps(_ref) {
  var initialValue = _ref.initialValue,
      autofill = _ref.autofill,
      onUpdate = _ref.onUpdate,
      valid = _ref.valid,
      invalid = _ref.invalid,
      dirty = _ref.dirty,
      pristine = _ref.pristine,
      active = _ref.active,
      touched = _ref.touched,
      visited = _ref.visited,
      autofilled = _ref.autofilled,
      domProps = (0, _objectWithoutProperties3.default)(_ref, ['initialValue', 'autofill', 'onUpdate', 'valid', 'invalid', 'dirty', 'pristine', 'active', 'touched', 'visited', 'autofilled']);
  return domProps;
};

var EmailSettings = createReactClass({

  displayName: 'EmailSettings',

  propTypes: {
    activeTab: PropTypes.bool
  },

  contextTypes: {
    getLabels: PropTypes.func
  },

  render: function render() {
    var getLabels = this.context.getLabels;
    var _props = this.props,
        activeTab = _props.activeTab,
        dispatch = _props.dispatch,
        _props$fields = _props.fields,
        email = _props$fields.email,
        password = _props$fields.password,
        handleSubmit = _props.handleSubmit,
        successMessageDisplayed = _props.successMessageDisplayed,
        prefix = _props.prefix;


    return React.createElement(
      'tr',
      {
        onClick: !activeTab ? dispatch.bind(this, push(prefix + '/email')) : null,
        className: !activeTab ? 'inactive' : ''
      },
      React.createElement(
        'td',
        {
          onClick: activeTab ? dispatch.bind(this, push(prefix + '/')) : null,
          className: 'col-md-3',
          style: { cursor: 'pointer' }
        },
        getLabels('email')
      ),
      activeTab ? React.createElement(
        'td',
        null,
        React.createElement(
          'div',
          { style: { padding: '0 5px' } },
          React.createElement(
            'form',
            { onSubmit: handleSubmit, style: { paddingBottom: '8px' } },
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement(
                'label',
                { htmlFor: 'email' },
                getLabels('email'),
                ' *'
              ),
              React.createElement('input', (0, _extends3.default)({ type: 'text', className: 'form-control', name: 'email' }, domOnlyProps(email))),
              email.touched && email.error && React.createElement(
                'div',
                { className: 'text-danger' },
                capitalize(getLabels(email.error))
              )
            ),
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement(
                'label',
                { htmlFor: 'password' },
                getLabels('password'),
                ' *'
              ),
              React.createElement('input', (0, _extends3.default)({
                type: 'password',
                className: 'form-control',
                name: 'password',
                autoComplete: 'new-email'
              }, domOnlyProps(password))),
              password.touched && password.error && React.createElement(
                'div',
                { className: 'text-danger' },
                capitalize(getLabels(password.error))
              )
            ),
            React.createElement(
              'div',
              { className: 'form-inline pull-left' },
              React.createElement(
                'button',
                { type: 'submit', className: 'btn btn-primary' },
                getLabels('save')
              ),
              successMessageDisplayed && React.createElement(
                'label',
                { className: 'text-success', style: { marginLeft: '10px' } },
                React.createElement(
                  'b',
                  null,
                  getLabels('updateEmailSuccess')
                )
              )
            )
          )
        )
      ) : React.createElement(
        'td',
        { style: { cursor: 'pointer' } },
        React.createElement(
          'b',
          { className: 'text-muted' },
          email.value
        )
      )
    );
  }

});

module.exports = reduxForm({
  form: 'emailSettings',
  fields: ['email', 'password']
})(connect(function (state) {
  return { prefix: state.app.appSettings.prefix };
})(EmailSettings));
//# sourceMappingURL=EmailSettings.js.map