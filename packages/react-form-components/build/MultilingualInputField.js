'use strict';

var _reactJsxDevRuntime = require("react/jsx-dev-runtime");
var _jsxFileName = "/home/clement/Project/oa/packages/react-form-components/components/MultilingualInputField.jsx";
const React = require('react');
const createReactClass = require('create-react-class');
const PropTypes = require('prop-types');
const utils = require('@openagenda/utils');
const makeLabelGetter = require('../lib/makeLabelGetter');
const labels = require('../labels');
module.exports = createReactClass({
  displayName: 'MultilingualInputField',
  propTypes: {
    // enabled boolean
    enabled: PropTypes.array,
    // list of language codes to display
    languages: PropTypes.array,
    // language-indexed values. ex: { fr: 'v1', en: 'v2' }
    value: PropTypes.object,
    // used by component to load labels
    getLabel: PropTypes.func,
    // used to optionnally bypass getLabel and load main label as is
    label: PropTypes.string,
    // used to optionnally bypass getLabel and load info as is
    info: PropTypes.string,
    // used to optionnally bypass getLabel and load placeholder as is
    placeholder: PropTypes.string,
    // called when value changes
    onChange: PropTypes.func,
    // rows to display if field is textarea
    rows: PropTypes.number,
    // type of the field. either text or textarea
    type: PropTypes.string,
    // bottom is a component generator that takes a lang
    bottom: PropTypes.func
  },
  getDefaultProps() {
    return {
      type: 'text',
      getLabel: makeLabelGetter(labels),
      bottom: () => null
    };
  },
  onChange(lang) {
    return e => {
      const newValue = JSON.parse(JSON.stringify(this.props.value));
      newValue[lang] = e.target.value;
      this.props.onChange(this.props.name, newValue);
    };
  },
  renderField(lang) {
    const name = this.props.languages.length > 1 ? "".concat(this.props.name, "_").concat(lang) : this.props.name;
    return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
      children: [this.props.type == 'textarea' ? /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("textarea", {
        name: name,
        rows: this.props.rows,
        placeholder: this.props.getLabel(this.props.placeholder) || this.props.placeholder,
        value: this.props.value[lang],
        className: "form-control",
        onChange: this.onChange(lang),
        disabled: !this.isEnabled(lang)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 75,
        columnNumber: 11
      }, this) : /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("input", {
        name: name,
        type: "text",
        placeholder: this.props.getLabel(this.props.placeholder) || this.props.placeholder,
        value: this.props.value[lang],
        className: "form-control",
        onChange: this.onChange(lang),
        disabled: !this.isEnabled(lang)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 88,
        columnNumber: 11
      }, this), this.props.bottom(lang)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 73,
      columnNumber: 7
    }, this);
  },
  isEnabled(lang) {
    if (!utils.isArray(this.props.enabled)) return true;
    return this.props.enabled.indexOf(lang) !== -1;
  },
  renderLanguageBlock(lang) {
    if (this.props.languages.length > 1) {
      return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
        className: "lang-unit",
        children: [/*#__PURE__*/_reactJsxDevRuntime.jsxDEV("label", {
          children: lang
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 117,
          columnNumber: 11
        }, this), /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
          children: this.renderField(lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 118,
          columnNumber: 11
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 116,
        columnNumber: 9
      }, this);
    }
    return this.renderField(lang);
  },
  render() {
    const classes = ['multilingual-input-field', 'form-group'];
    if (this.props.enabled && !this.props.enabled.length) {
      classes.push('disabled');
    }
    return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
      className: classes.join(' '),
      children: [/*#__PURE__*/_reactJsxDevRuntime.jsxDEV("label", {
        children: this.props.label || this.props.getLabel(this.props.name)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 134,
        columnNumber: 9
      }, this), this.props.info ? /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("span", {
        className: "info",
        children: this.props.getLabel(this.props.info) || this.props.info
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 138,
        columnNumber: 11
      }, this) : null, /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("ul", {
        className: "list-unstyled",
        children: this.props.languages.map(lang => /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("li", {
          className: this.isEnabled(lang) ? '' : 'disabled',
          children: this.renderLanguageBlock(lang)
        }, lang, false, {
          fileName: _jsxFileName,
          lineNumber: 144,
          columnNumber: 13
        }, this))
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 142,
        columnNumber: 9
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 133,
      columnNumber: 7
    }, this);
  }
});
//# sourceMappingURL=MultilingualInputField.js.map