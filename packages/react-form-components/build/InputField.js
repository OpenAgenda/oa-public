"use strict";

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.function.name");

var _jsxFileName = "/home/bertho/oa/packages/react-form-components/components/InputField.jsx";

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    _getLabel = require('../lib/makeLabelGetter')(require('../labels'));

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
  getInitialState: function getInitialState() {
    return {
      userHasTyped: false
    };
  },
  getDefaultProps: function getDefaultProps() {
    return {
      type: 'text',
      autoFocus: false,
      enabled: true
    };
  },
  onChange: function onChange(e) {
    if (!this.props.enabled) {
      return;
    }

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
      return React.createElement("p", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 114
        },
        __self: this
      }, errors.map(function (error) {
        return React.createElement("span", {
          key: error.code,
          className: "error",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 116
          },
          __self: this
        }, self.getLabel(error.code, error.values, self.props.lang));
      }));
    }

    return null;
  },
  render: function render() {
    var className = this.props.enabled ? 'form-group' : 'form-group disabled';
    if (this.props.groupClassName) className += ' ' + this.props.groupClassName;
    return React.createElement("div", {
      className: className,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 136
      },
      __self: this
    }, React.createElement("label", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 137
      },
      __self: this
    }, this.getLabel(this.props.name)), this.props.info && this.getLabel(this.props.info) ? React.createElement("div", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 139
      },
      __self: this
    }, this.getLabel(this.props.info)) : null, React.createElement("div", {
      className: this.props.className || '',
      __source: {
        fileName: _jsxFileName,
        lineNumber: 141
      },
      __self: this
    }, this.props.type !== "textarea" ? React.createElement("input", {
      className: "form-control",
      type: "text",
      placeholder: this.getLabel(this.props.placeholder),
      value: this.props.value,
      onChange: this.onChange,
      disabled: !this.props.enabled,
      autoFocus: !!this.props.autoFocus,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 142
      },
      __self: this
    }) : React.createElement("textarea", {
      className: "form-control",
      value: this.props.value,
      rows: 6,
      disabled: !this.props.enabled,
      onChange: this.onChange,
      autoFocus: !!this.props.autoFocus,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 150
      },
      __self: this
    }), " ", this.props.renderButton ? this.props.renderButton() : ''), this.renderErrors(), this.props.bottom ? this.props.bottom : null);
  }
});
//# sourceMappingURL=InputField.js.map