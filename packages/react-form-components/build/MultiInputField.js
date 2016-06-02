"use strict";

var React = require('react'),
    _getLabel = require('../lib/makeLabelGetter')(require('../labels')),
    TagsInput = require('react-tagsinput');

module.exports = React.createClass({

  displayName: 'MultiInputField',

  propTypes: {

    value: React.PropTypes.array,
    // the form name of the field
    name: React.PropTypes.string,
    typeIconClassNames: React.PropTypes.object,
    lang: React.PropTypes.string,
    validator: React.PropTypes.func

  },

  getInitialState: function getInitialState() {

    return {
      inputValue: ''
    };
  },

  getDefaultProps: function getDefaultProps() {

    return {

      name: 'multi_input',

      lang: 'en',

      typeIconClassNames: {
        link: 'fa fa-link',
        phone: 'fa fa-phone',
        email: 'fa fa-envelope',
        error: 'fa fa-exclamation-circle'
      },

      allowedTypes: ['link', 'email', 'phone']

    };
  },

  decorate: function decorate(values) {

    return this.props.validator.decorate(values);
  },

  getLabel: function getLabel(label, values) {

    var str;

    if (this.props.getLabel) {

      str = this.props.getLabel(label, values, this.props.lang);
    }

    return str || _getLabel(label, values, this.props.lang);
  },

  onChange: function onChange(v) {

    this.setState({ inputValue: '' });

    this.props.onChange(this.props.name, v.map(function (decoratedItem) {

      return typeof decoratedItem == 'string' ? decoratedItem : decoratedItem.value;
    }));
  },

  onBlur: function onBlur(v) {

    var value = this.state.inputValue;

    if (!value.length) return;

    this.setState({ inputValue: '' });

    // stick the last typed entry to the values and signal parent
    this.onChange(this.decorate((this.props.value || []).concat(value)));
  },

  onInputChange: function onInputChange(v) {

    var value = v.target.value;

    if (value.indexOf(',') !== -1) {

      this.onChange(this.decorate((this.props.value || []).concat(value.split(',')[0])));

      value = value.split(',')[1];
    }

    this.setState({ inputValue: value });
  },

  renderItem: function renderItem(t) {

    if (t.tag.errors) t.className += ' error';

    return React.createElement(
      'span',
      { key: t.key, className: t.className },
      React.createElement('i', { className: this.props.typeIconClassNames[t.tag.type || 'error'] }),
      t.tag.value,
      React.createElement('a', { onClick: t.onRemove.bind(null, t.key) })
    );
  },

  render: function render() {

    var values = this.decorate(this.props.value || []),
        error = !!values.filter(function (v) {
      return !!v.errors;
    }).length;

    return React.createElement(
      'div',
      { className: 'multi-input' },
      React.createElement(
        'label',
        null,
        this.getLabel(this.props.name)
      ),
      React.createElement(TagsInput, {
        value: values,
        renderTag: this.renderItem,
        onChange: this.onChange,
        inputProps: {
          onBlur: this.onBlur,
          onChange: this.onInputChange,
          value: this.state.inputValue
        } }),
      React.createElement(
        'span',
        { className: error ? 'error' : 'info' },
        error ? this.getLabel('multi-input.error') : this.props.info || this.getLabel('multi-input.info')
      ),
      this.props.bottom ? this.props.bottom : null
    );
  }

});