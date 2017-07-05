"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    _require = require('redux-form'),
    reduxForm = _require.reduxForm,
    _require2 = require('utils'),
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
      domProps = _objectWithoutProperties(_ref, ['initialValue', 'autofill', 'onUpdate', 'valid', 'invalid', 'dirty', 'pristine', 'active', 'touched', 'visited', 'autofilled']);

  return domProps;
};

var PasswordSettings = createReactClass({

  displayName: 'PasswordSettings',

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
        old_password = _props$fields.old_password,
        new_password = _props$fields.new_password,
        confirmation = _props$fields.confirmation,
        handleSubmit = _props.handleSubmit,
        successMessageDisplayed = _props.successMessageDisplayed,
        prefix = _props.prefix;


    return React.createElement(
      'tr',
      {
        onClick: !activeTab ? dispatch.bind(this, push(prefix + '/password')) : null,
        className: !activeTab ? 'inactive' : ''
      },
      React.createElement(
        'td',
        { onClick: activeTab ? dispatch.bind(this, push(prefix + '/')) : null,
          className: 'col-md-3', style: { cursor: 'pointer' } },
        getLabels('password')
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
                { htmlFor: 'old_password' },
                getLabels('actualPassword'),
                ' *'
              ),
              React.createElement('input', _extends({ type: 'password', className: 'form-control', name: 'old_password',
                autoComplete: 'new-password' }, domOnlyProps(old_password))),
              old_password.touched && old_password.error && React.createElement(
                'div',
                { className: 'text-danger' },
                capitalize(getLabels(old_password.error))
              )
            ),
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement(
                'label',
                { htmlFor: 'new_password' },
                getLabels('newPassword'),
                ' *'
              ),
              React.createElement('input', _extends({ type: 'password', className: 'form-control', name: 'new_password',
                autoComplete: 'new-password' }, domOnlyProps(new_password))),
              new_password.touched && new_password.error && React.createElement(
                'div',
                { className: 'text-danger' },
                capitalize(getLabels(new_password.error))
              )
            ),
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement(
                'label',
                { htmlFor: 'confirmation' },
                getLabels('confirmation'),
                ' *'
              ),
              React.createElement('input', _extends({ type: 'password', className: 'form-control', name: 'confirmation',
                autoComplete: 'new-password' }, domOnlyProps(confirmation))),
              confirmation.touched && confirmation.error && React.createElement(
                'div',
                { className: 'text-danger' },
                capitalize(getLabels(confirmation.error))
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
                  getLabels('updatePasswordSuccess')
                )
              )
            )
          )
        )
      ) : React.createElement(
        'td',
        { style: { cursor: 'pointer' } },
        getLabels('modify')
      )
    );
  }

});

module.exports = reduxForm({
  form: 'passwordSettings',
  fields: ['old_password', 'new_password', 'confirmation']
})(connect(function (state) {
  return { prefix: state.app.appSettings.prefix };
})(PasswordSettings));