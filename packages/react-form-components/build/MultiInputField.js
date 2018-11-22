"use strict";

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.function.name");

var _jsxFileName = "/home/bertho/oa/packages/react-form-components/components/MultiInputField.jsx";

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    _getLabel = require('../lib/makeLabelGetter')(require('../labels')),
    TagsInput = require('react-tagsinput');

module.exports = createReactClass({
  displayName: 'MultiInputField',
  propTypes: {
    value: PropTypes.array,
    // the form name of the field
    name: PropTypes.string,
    typeIconClassNames: PropTypes.object,
    lang: PropTypes.string,
    validator: PropTypes.func,
    enabled: PropTypes.bool
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
      allowedTypes: ['link', 'email', 'phone'],
      enabled: true
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
    if (!this.props.enabled) return;
    this.setState({
      inputValue: ''
    });
    this.props.onChange(this.props.name, v.map(function (decoratedItem) {
      return typeof decoratedItem == 'string' ? decoratedItem : decoratedItem.value;
    }));
  },
  onBlur: function onBlur(v) {
    if (!this.props.enabled) return;
    var value = this.state.inputValue;
    if (!value.length) return;
    this.setState({
      inputValue: ''
    }); // stick the last typed entry to the values and signal parent

    this.onChange(this.decorate((this.props.value || []).concat(value)));
  },
  onInputChange: function onInputChange(v) {
    var value = v.target.value;

    if (value.indexOf(',') !== -1) {
      this.onChange(this.decorate((this.props.value || []).concat(value.split(',')[0])));
      value = value.split(',')[1];
    }

    this.setState({
      inputValue: value
    });
  },
  renderItem: function renderItem(t) {
    if (t.tag.errors) t.className += ' error';
    return React.createElement("span", {
      key: t.key,
      className: t.className,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 129
      },
      __self: this
    }, React.createElement("i", {
      className: this.props.typeIconClassNames[t.tag.type || 'error'],
      __source: {
        fileName: _jsxFileName,
        lineNumber: 130
      },
      __self: this
    }), t.tag.value, React.createElement("a", {
      onClick: t.onRemove.bind(null, t.key),
      __source: {
        fileName: _jsxFileName,
        lineNumber: 132
      },
      __self: this
    }));
  },
  render: function render() {
    var values = this.decorate(this.props.value || []),
        error = !!values.filter(function (v) {
      return !!v.errors;
    }).length;
    return React.createElement("div", {
      className: this.props.enabled ? 'multi-input' : 'multi-input disabled',
      __source: {
        fileName: _jsxFileName,
        lineNumber: 143
      },
      __self: this
    }, React.createElement("label", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 144
      },
      __self: this
    }, this.getLabel(this.props.name)), React.createElement(TagsInput, {
      value: values,
      renderTag: this.renderItem,
      onChange: this.onChange,
      inputProps: {
        placeholder: null,
        onBlur: this.onBlur,
        onChange: this.onInputChange,
        value: this.state.inputValue,
        disabled: !this.props.enabled
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 145
      },
      __self: this
    }), React.createElement("span", {
      className: error ? 'error' : 'info',
      __source: {
        fileName: _jsxFileName,
        lineNumber: 156
      },
      __self: this
    }, error ? this.getLabel('multi-input.error') : this.props.info || this.getLabel('multi-input.info')), this.props.bottom ? this.props.bottom : null);
  }
});
//# sourceMappingURL=MultiInputField.js.map