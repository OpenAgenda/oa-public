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
  EmailSettings: {
    displayName: 'EmailSettings'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/EmailSettings.js',
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

var EmailSettings = _wrapComponent('EmailSettings')(React.createClass({

  displayName: 'EmailSettings',

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
        email = _props$fields.email,
        password = _props$fields.password,
        handleSubmit = _props.handleSubmit,
        successMessageDisplayed = _props.successMessageDisplayed;


    return React.createElement(
      'tr',
      {
        onClick: !activeTab ? dispatch.bind(this, push('/email')) : null,
        className: !activeTab ? 'inactive' : ''
      },
      React.createElement(
        'td',
        { onClick: activeTab ? dispatch.bind(this, push('/')) : null,
          className: 'col-md-3', style: { cursor: 'pointer' } },
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
              React.createElement('input', _extends({ type: 'text', className: 'form-control', name: 'email' }, email)),
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
              React.createElement('input', _extends({ type: 'password', className: 'form-control', name: 'password', autoComplete: 'off' }, password)),
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
        getLabels('modify')
      )
    );
  }

}));

module.exports = reduxForm({
  form: 'emailSettings',
  fields: ['email', 'password']
})(EmailSettings);