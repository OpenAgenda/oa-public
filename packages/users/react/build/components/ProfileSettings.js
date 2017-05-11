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

var ProfileSettings = createReactClass({

  displayName: 'ProfileSettings',

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
        _props$fields = _props.fields,
        full_name = _props$fields.full_name,
        culture = _props$fields.culture,
        handleSubmit = _props.handleSubmit,
        displayModal = _props.displayModal,
        deleteAccount = _props.deleteAccount,
        successMessageDisplayed = _props.successMessageDisplayed,
        prefix = _props.prefix;


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
        onClick: !activeTab ? this.props.dispatch.bind(this, push(prefix + '/profile')) : null,
        className: !activeTab ? 'inactive' : ''
      },
      React.createElement(
        'td',
        { onClick: activeTab ? this.props.dispatch.bind(this, push(prefix + '/')) : null,
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
              React.createElement('input', _extends({ type: 'text', className: 'form-control', name: 'full_name' }, domOnlyProps(full_name))),
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
                _extends({ name: 'culture', className: 'form-control' }, domOnlyProps(culture)),
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

});

module.exports = reduxForm({
  form: 'profileSettings',
  fields: ['full_name', 'culture']
})(connect(function (state) {
  return { prefix: state.app.appSettings.prefix };
})(ProfileSettings));