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
    _require2 = require('react-router-redux'),
    push = _require2.push,
    _require3 = require('react-redux'),
    connect = _require3.connect;

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

var ApiKeySettings = createReactClass({

  displayName: 'ApiKeySettings',

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
        apiKey = _props$fields.apiKey,
        apiSecret = _props$fields.apiSecret,
        displayModal = _props.displayModal,
        generateApiKey = _props.generateApiKey,
        prefix = _props.prefix;


    var generateApiKeyModal = function generateApiKeyModal() {
      var secret = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
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
      {
        onClick: !activeTab ? dispatch.bind(this, push(prefix + '/apiKey')) : null,
        className: !activeTab ? 'inactive' : ''
      },
      React.createElement(
        'td',
        {
          onClick: activeTab ? dispatch.bind(this, push(prefix + '/')) : null,
          className: 'col-md-3',
          style: { cursor: 'pointer' }
        },
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
              React.createElement('input', (0, _extends3.default)({ type: 'text', className: 'form-control', name: 'api_key', readOnly: true }, domOnlyProps(apiKey))),
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
              React.createElement('input', (0, _extends3.default)({ type: 'text', className: 'form-control', name: 'api_secret', readOnly: true }, domOnlyProps(apiSecret))),
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

});

module.exports = reduxForm({
  form: 'apiKeySettings',
  fields: ['apiKey', 'apiSecret']
})(connect(function (state) {
  return { prefix: state.app.appSettings.prefix };
})(ApiKeySettings));
//# sourceMappingURL=ApiKeySettings.js.map