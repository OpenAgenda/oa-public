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
  ProfileSettings: {
    displayName: 'ProfileSettings'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/ProfileSettings.js',
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

var ProfileSettings = _wrapComponent('ProfileSettings')(React.createClass({

  displayName: 'ProfileSettings',

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
        _props$fields = _props.fields,
        full_name = _props$fields.full_name,
        culture = _props$fields.culture,
        handleSubmit = _props.handleSubmit,
        displayModal = _props.displayModal,
        deleteAccount = _props.deleteAccount,
        successMessageDisplayed = _props.successMessageDisplayed;


    var deleteModal = {
      visible: true,
      title: getLabels('deleteMyAccount'),
      content: React.createElement(
        'p',
        null,
        getLabels('deleteModalText')
      ),
      action: deleteAccount,
      actionText: getLabels('deleteModalButton')
    };

    return React.createElement(
      'tr',
      {
        onClick: !activeTab ? this.props.dispatch.bind(this, push('/profile')) : null,
        className: !activeTab ? 'inactive' : ''
      },
      React.createElement(
        'td',
        { onClick: activeTab ? this.props.dispatch.bind(this, push('/')) : null,
          className: 'col-md-3', style: { cursor: 'pointer' } },
        getLabels('userProfile')
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
                { htmlFor: 'full_name' },
                getLabels('fullname'),
                ' *'
              ),
              React.createElement('input', _extends({ type: 'text', className: 'form-control', name: 'full_name' }, full_name)),
              full_name.touched && full_name.error && React.createElement(
                'div',
                { className: 'text-danger' },
                capitalize(getLabels(full_name.error))
              )
            ),
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement(
                'label',
                { htmlFor: 'culture' },
                getLabels('language'),
                ' *'
              ),
              React.createElement(
                'select',
                _extends({ name: 'culture', className: 'form-control' }, culture),
                React.createElement(
                  'option',
                  { value: 'fr' },
                  'Fran\xE7ais'
                ),
                React.createElement(
                  'option',
                  { value: 'en' },
                  'English'
                )
              ),
              culture.touched && culture.error && React.createElement(
                'div',
                { className: 'text-danger' },
                capitalize(getLabels(culture.error))
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
                  getLabels('updateProfileSuccess')
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'pull-right' },
              React.createElement(
                'a',
                { href: '#', className: 'text-danger', onClick: function onClick() {
                    return displayModal(deleteModal);
                  } },
                getLabels('deleteMyAccount')
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
  form: 'profileSettings',
  fields: ['full_name', 'culture']
})(ProfileSettings);