"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

require("core-js/modules/es6.function.name");

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _jsxFileName = "/home/bertho/oa/packages/react-form-components/components/MultilingualInputField.jsx";

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    makeLabelGetter = require('../lib/makeLabelGetter'),
    labels = require('../labels'),
    utils = require('@openagenda/utils');

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
  getDefaultProps: function getDefaultProps() {
    return {
      type: 'text',
      getLabel: makeLabelGetter(labels),
      bottom: function bottom() {
        return null;
      }
    };
  },
  onChange: function onChange(lang) {
    var _this = this;

    return function (e) {
      var newValue = JSON.parse((0, _stringify.default)(_this.props.value));
      newValue[lang] = e.target.value;

      _this.props.onChange(_this.props.name, newValue);
    };
  },
  renderField: function renderField(lang) {
    var name = this.props.languages.length > 1 ? this.props.name + '_' + lang : this.props.name;
    return React.createElement("div", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 84
      },
      __self: this
    }, this.props.type == 'textarea' ? React.createElement("textarea", {
      name: name,
      rows: this.props.rows,
      placeholder: this.props.getLabel(this.props.placeholder) || this.props.placeholder,
      value: this.props.value[lang],
      className: "form-control",
      onChange: this.onChange(lang),
      disabled: !this.isEnabled(lang),
      __source: {
        fileName: _jsxFileName,
        lineNumber: 86
      },
      __self: this
    }) : React.createElement("input", {
      name: name,
      type: "text",
      placeholder: this.props.getLabel(this.props.placeholder) || this.props.placeholder,
      value: this.props.value[lang],
      className: "form-control",
      onChange: this.onChange(lang),
      disabled: !this.isEnabled(lang),
      __source: {
        fileName: _jsxFileName,
        lineNumber: 95
      },
      __self: this
    }), this.props.bottom(lang));
  },
  isEnabled: function isEnabled(lang) {
    if (!utils.isArray(this.props.enabled)) return true;
    return this.props.enabled.indexOf(lang) !== -1;
  },
  renderLanguageBlock: function renderLanguageBlock(lang) {
    if (this.props.languages.length > 1) {
      return React.createElement("div", {
        className: "lang-unit",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 122
        },
        __self: this
      }, React.createElement("label", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 123
        },
        __self: this
      }, lang), React.createElement("div", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 124
        },
        __self: this
      }, this.renderField(lang)));
    } else {
      return this.renderField(lang);
    }
  },
  render: function render() {
    var _this2 = this;

    var classes = ['multilingual-input-field', 'form-group'];

    if (this.props.enabled && !this.props.enabled.length) {
      classes.push('disabled');
    }

    return React.createElement("div", {
      className: classes.join(' '),
      __source: {
        fileName: _jsxFileName,
        lineNumber: 147
      },
      __self: this
    }, React.createElement("label", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 148
      },
      __self: this
    }, this.props.label || this.props.getLabel(this.props.name)), this.props.info ? React.createElement("span", {
      className: "info",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 149
      },
      __self: this
    }, this.props.getLabel(this.props.info) || this.props.info) : null, React.createElement("ul", {
      className: "list-unstyled",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 150
      },
      __self: this
    }, this.props.languages.map(function (lang) {
      return React.createElement("li", {
        key: lang,
        className: _this2.isEnabled(lang) ? '' : 'disabled',
        __source: {
          fileName: _jsxFileName,
          lineNumber: 152
        },
        __self: this
      }, _this2.renderLanguageBlock(lang));
    })));
  }
});
//# sourceMappingURL=MultilingualInputField.js.map