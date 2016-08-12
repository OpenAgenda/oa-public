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
  ApiKeySettings: {
    displayName: 'ApiKeySettings'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/ApiKeySettings.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var React = require('react');

var _require = require('redux-form');

var reduxForm = _require.reduxForm;

var _require2 = require('react-router-redux');

var push = _require2.push;


var ApiKeySettings = _wrapComponent('ApiKeySettings')(React.createClass({

  displayName: 'ApiKeySettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  contextTypes: {
    getLabels: React.PropTypes.func
  },

  render: function render() {
    var getLabels = this.context.getLabels;
    var _props = this.props;
    var activeTab = _props.activeTab;
    var dispatch = _props.dispatch;
    var _props$fields = _props.fields;
    var apiKey = _props$fields.apiKey;
    var apiSecret = _props$fields.apiSecret;
    var displayModal = _props.displayModal;
    var generateApiKey = _props.generateApiKey;


    var generateApiKeyModal = function generateApiKeyModal() {
      var secret = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      return {
        visible: true,
        title: getLabels('generateNewApiKey'),
        content: React.createElement(
          'p',
          null,
          getLabels('generateNewApiKeyModalText')
        ),
        action: function action() {
          return generateApiKey(secret);
        },
        actionText: getLabels('generateNewApiKeyModalButton'),
        buttonClass: 'btn btn-primary'
      };
    };

    return React.createElement(
      'tr',
      { onClick: !activeTab ? dispatch.bind(this, push('/apiKey')) : null },
      React.createElement(
        'td',
        { onClick: activeTab ? dispatch.bind(this, push('/')) : null,
          className: 'col-md-3', style: { cursor: 'pointer' } },
        getLabels('apiKeys')
      ),
      activeTab ? React.createElement(
        'td',
        null,
        React.createElement(
          'div',
          { style: { padding: '0 5px' } },
          React.createElement(
            'p',
            null,
            getLabels('apiKeyInformation')
          ),
          React.createElement(
            'p',
            null,
            React.createElement(
              'a',
              { href: '//openagenda.zendesk.com/hc/fr/sections/201090781-The-API-documentation-in-english-' },
              getLabels('showDocumentation')
            )
          ),
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement(
              'label',
              { htmlFor: 'api_key' },
              getLabels('publicKey')
            ),
            React.createElement(
              'div',
              { className: 'input-group' },
              React.createElement('input', _extends({ type: 'text', className: 'form-control', name: 'api_key', readOnly: true }, apiKey)),
              React.createElement(
                'span',
                { className: 'input-group-btn' },
                React.createElement(
                  'button',
                  { className: 'btn btn-default', type: 'button',
                    onClick: function onClick() {
                      return displayModal(generateApiKeyModal());
                    } },
                  React.createElement('i', { className: 'fa fa-refresh', 'aria-hidden': 'true' })
                )
              )
            )
          ),
          apiSecret.value && React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement(
              'label',
              { htmlFor: 'api_secret' },
              getLabels('secretKey')
            ),
            React.createElement(
              'div',
              { className: 'input-group' },
              React.createElement('input', _extends({ type: 'text', className: 'form-control', name: 'api_secret', readOnly: true }, apiSecret)),
              React.createElement(
                'span',
                { className: 'input-group-btn' },
                React.createElement(
                  'button',
                  { className: 'btn btn-default', type: 'button',
                    onClick: function onClick() {
                      return displayModal(generateApiKeyModal(1));
                    } },
                  React.createElement('i', { className: 'fa fa-refresh', 'aria-hidden': 'true' })
                )
              )
            )
          )
        )
      ) : React.createElement(
        'td',
        { style: { cursor: 'pointer' } },
        getLabels('showApiKeys')
      )
    );
  }

}));

module.exports = reduxForm({
  form: 'apiKeySettings',
  fields: ['apiKey', 'apiSecret']
})(ApiKeySettings);