"use strict";

var React = require('react'),
    _getLabel = require('../lib/makeLabelGetter')(require('../labels'));

module.exports = React.createClass({
  displayName: 'exports',


  propTypes: {

    // value - usually a string
    lang: React.PropTypes.string,

    // the name of the input
    name: React.PropTypes.string,

    // used by component to load labels
    getLabel: React.PropTypes.func,

    // called when value changes
    onChange: React.PropTypes.func,

    // optional validator
    validator: React.PropTypes.func,

    // optional placeholder
    placeholder: React.PropTypes.string,

    // type of input ( textarea or text )
    type: React.PropTypes.string,

    // optional button
    renderButton: React.PropTypes.func,

    // optional autofocus
    autofocus: React.PropTypes.bool

  },

  getInitialState: function getInitialState() {

    return {
      userHasTyped: false
    };
  },

  getDefaultProps: function getDefaultProps() {

    return {

      type: 'text',

      autofocus: false

    };
  },

  onChange: function onChange(e) {

    this.setState({
      userHasTyped: true
    });

    this.props.onChange(this.props.name, e.target.value);
  },

  getLabel: function getLabel(label, values) {

    var str;

    if (this.props.getLabel) {

      str = this.props.getLabel(label, values, this.props.lang);
    }

    return str || _getLabel(label, values, this.props.lang);
  },

  renderErrors: function renderErrors() {

    var self = this;

    if (!this.props.validator) return null;

    if ((!this.props.value || !this.props.value.length) && !this.state.userHasTyped) return null;

    try {

      this.props.validator(this.props.value);
    } catch (errors) {

      return React.createElement(
        'p',
        null,
        errors.map(function (error) {

          return React.createElement(
            'span',
            {
              key: error.code,
              className: 'error' },
            self.getLabel(error.code, error.values, self.props.lang)
          );
        })
      );
    }

    return null;
  },

  render: function render() {

    return React.createElement(
      'div',
      { className: 'form-group' },
      React.createElement(
        'label',
        null,
        this.getLabel(this.props.name)
      ),
      React.createElement(
        'div',
        { className: this.props.className || '' },
        this.props.type !== "textarea" ? React.createElement('input', {
          className: 'form-control',
          type: 'text',
          placeholder: this.getLabel(this.props.placeholder),
          value: this.props.value,
          onChange: this.onChange,
          autoFocus: !!this.props.autofocus }) : React.createElement('textarea', {
          className: 'form-control',
          value: this.props.value,
          rows: 6,
          onChange: this.onChange,
          autoFocus: !!this.props.autofocus }),
        ' ',
        this.props.renderButton ? this.props.renderButton() : ''
      ),
      this.renderErrors(),
      this.props.bottom ? this.props.bottom : null
    );
  }

});