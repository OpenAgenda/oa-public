'use strict';

var _reactJsxDevRuntime = require("react/jsx-dev-runtime");
var _jsxFileName = "/home/clement/Project/oa/packages/react-form-components/components/MultiInputField.jsx";
const React = require('react');
const createReactClass = require('create-react-class');
const PropTypes = require('prop-types');
const getLabel = require('../lib/makeLabelGetter')(require('../labels'));
const TagsInput = require('react-tagsinput');
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
  getInitialState() {
    return {
      inputValue: ''
    };
  },
  getDefaultProps() {
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
  decorate(values) {
    return this.props.validator.decorate(values);
  },
  getLabel(label, values) {
    let str;
    if (this.props.getLabel) {
      str = this.props.getLabel(label, values, this.props.lang);
    }
    return str || getLabel(label, values, this.props.lang);
  },
  onChange(v) {
    if (!this.props.enabled) return;
    this.setState({
      inputValue: ''
    });
    this.props.onChange(this.props.name, v.map(decoratedItem => typeof decoratedItem === 'string' ? decoratedItem : decoratedItem.value));
  },
  onBlur(v) {
    if (!this.props.enabled) return;
    const value = this.state.inputValue;
    if (!value.length) return;
    this.setState({
      inputValue: ''
    });

    // stick the last typed entry to the values and signal parent
    this.onChange(this.decorate((this.props.value || []).concat(value)));
  },
  onInputChange(v) {
    let {
      value
    } = v.target;
    if (value.indexOf(',') !== -1) {
      this.onChange(this.decorate((this.props.value || []).concat(value.split(',')[0])));
      value = value.split(',')[1];
    }
    this.setState({
      inputValue: value
    });
  },
  renderItem(t) {
    if (t.tag.errors) t.className += ' error';
    return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("span", {
      className: t.className,
      children: [/*#__PURE__*/_reactJsxDevRuntime.jsxDEV("i", {
        className: this.props.typeIconClassNames[t.tag.type || 'error']
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 106,
        columnNumber: 9
      }, this), t.tag.value, /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("a", {
        onClick: t.onRemove.bind(null, t.key)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 108,
        columnNumber: 9
      }, this)]
    }, t.key, true, {
      fileName: _jsxFileName,
      lineNumber: 105,
      columnNumber: 7
    }, this);
  },
  render() {
    const values = this.decorate(this.props.value || []);
    const error = !!values.filter(v => !!v.errors).length;
    return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
      className: this.props.enabled ? 'multi-input' : 'multi-input disabled',
      children: [/*#__PURE__*/_reactJsxDevRuntime.jsxDEV("label", {
        children: this.getLabel(this.props.name)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 121,
        columnNumber: 9
      }, this), /*#__PURE__*/_reactJsxDevRuntime.jsxDEV(TagsInput, {
        value: values,
        renderTag: this.renderItem,
        onChange: this.onChange,
        inputProps: {
          placeholder: null,
          onBlur: this.onBlur,
          onChange: this.onInputChange,
          value: this.state.inputValue,
          disabled: !this.props.enabled
        }
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 122,
        columnNumber: 9
      }, this), /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("span", {
        className: error ? 'error' : 'info',
        children: error ? this.getLabel('multi-input.error') : this.props.info || this.getLabel('multi-input.info')
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 134,
        columnNumber: 9
      }, this), this.props.bottom ? this.props.bottom : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 7
    }, this);
  }
});
//# sourceMappingURL=MultiInputField.js.map