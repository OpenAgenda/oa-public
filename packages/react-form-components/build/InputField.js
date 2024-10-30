'use strict';

var _reactJsxDevRuntime = require("react/jsx-dev-runtime");
var _valuesInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/values");
var _jsxFileName = "/home/clement/Project/oa/packages/react-form-components/components/InputField.jsx";
const React = require('react');
const createReactClass = require('create-react-class');
const PropTypes = require('prop-types');
const getLabel = require('../lib/makeLabelGetter')(require('../labels'));
module.exports = createReactClass({
  displayName: 'InputField',
  propTypes: {
    // value - usually a string
    lang: PropTypes.string,
    // the name of the input
    name: PropTypes.string,
    // used by component to load labels
    getLabel: PropTypes.func,
    // called when value changes
    onChange: PropTypes.func,
    // optional validator
    validator: PropTypes.func,
    // optional placeholder
    placeholder: PropTypes.string,
    // type of input ( textarea or text )
    type: PropTypes.string,
    // optional button
    renderButton: PropTypes.func,
    // optional autofocus
    autoFocus: PropTypes.bool,
    enabled: PropTypes.bool
  },
  getInitialState() {
    return {
      userHasTyped: false
    };
  },
  getDefaultProps() {
    return {
      type: 'text',
      autoFocus: false,
      enabled: true
    };
  },
  onChange(e) {
    if (!this.props.enabled) {
      return;
    }
    this.setState({
      userHasTyped: true
    });
    this.props.onChange(this.props.name, e.target.value);
  },
  getLabel(label, values) {
    let str;
    if (this.props.getLabel) {
      str = this.props.getLabel(label, values, this.props.lang);
    }
    return str || getLabel(label, values, this.props.lang);
  },
  renderErrors() {
    const self = this;
    if (!this.props.validator) return null;
    if ((!this.props.value || !this.props.value.length) && !this.state.userHasTyped) return null;
    try {
      this.props.validator(this.props.value);
    } catch (errors) {
      return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("p", {
        children: errors.map(error => /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("span", {
          className: "error",
          children: self.getLabel(error.code, _valuesInstanceProperty(error), self.props.lang)
        }, error.code, false, {
          fileName: _jsxFileName,
          lineNumber: 97,
          columnNumber: 13
        }, this))
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 95,
        columnNumber: 9
      }, this);
    }
    return null;
  },
  render() {
    let className = this.props.enabled ? 'form-group' : 'form-group disabled';
    if (this.props.groupClassName) className += " ".concat(this.props.groupClassName);
    return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
      className: className,
      children: [/*#__PURE__*/_reactJsxDevRuntime.jsxDEV("label", {
        children: this.getLabel(this.props.name)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 115,
        columnNumber: 9
      }, this), this.props.info && this.getLabel(this.props.info) ? /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
        children: this.getLabel(this.props.info)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 117,
        columnNumber: 11
      }, this) : null, /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
        className: this.props.className || '',
        children: [this.props.type !== 'textarea' ? /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("input", {
          className: "form-control",
          type: "text",
          placeholder: this.getLabel(this.props.placeholder),
          value: this.props.value,
          onChange: this.onChange,
          disabled: !this.props.enabled,
          autoFocus: !!this.props.autoFocus
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 121,
          columnNumber: 13
        }, this) : /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("textarea", {
          className: "form-control",
          value: this.props.value,
          rows: 6,
          disabled: !this.props.enabled,
          onChange: this.onChange,
          autoFocus: !!this.props.autoFocus
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 131,
          columnNumber: 13
        }, this), ' ', this.props.renderButton ? this.props.renderButton() : '']
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 119,
        columnNumber: 9
      }, this), this.renderErrors(), this.props.bottom ? this.props.bottom : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 114,
      columnNumber: 7
    }, this);
  }
});
//# sourceMappingURL=InputField.js.map