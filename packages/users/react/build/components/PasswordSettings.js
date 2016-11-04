"use strict";

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  PasswordSettings: {
    displayName: 'PasswordSettings'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/PasswordSettings.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var React = require('react'),
    _require = require('redux-form'),
    reduxForm = _require.reduxForm,
    _require2 = require('utils'),
    capitalize = _require2.capitalize,
    _require3 = require('react-router-redux'),
    push = _require3.push;

var PasswordSettings = _wrapComponent('PasswordSettings')(React.createClass({

  displayName: 'PasswordSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  contextTypes: {
    getLabels: React.PropTypes.func
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
        successMessageDisplayed = _props.successMessageDisplayed;


    return React.createElement(
      'tr',
      { onClick: !activeTab ? dispatch.bind(this, push('/password')) : null },
      React.createElement(
        'td',
        { onClick: activeTab ? dispatch.bind(this, push('/')) : null,
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
                autoComplete: 'off' }, old_password)),
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
                autoComplete: 'off' }, new_password)),
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
                autoComplete: 'off' }, confirmation)),
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

}));

module.exports = reduxForm({
  form: 'passwordSettings',
  fields: ['old_password', 'new_password', 'confirmation']
})(PasswordSettings);