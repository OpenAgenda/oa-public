'use strict';

var _reactJsxDevRuntime = require("react/jsx-dev-runtime");
var _jsxFileName = "/home/clement/Project/oa/packages/react-form-components/components/SearchField.jsx";
const React = require('react');
const createReactClass = require('create-react-class');
const PropTypes = require('prop-types');
const {
  Spinner
} = require('@openagenda/react-shared');
module.exports = createReactClass({
  displayName: 'SearchField',
  propTypes: {
    value: PropTypes.string,
    threshold: PropTypes.number,
    name: PropTypes.string,
    dynamic: PropTypes.bool,
    timeout: PropTypes.number,
    loading: PropTypes.bool,
    enableLoadingDisplay: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func
  },
  getDefaultProps() {
    return {
      value: '',
      name: 'search',
      dynamic: false,
      timeout: 1500,
      loading: false,
      threshold: 2,
      enableLoadingDisplay: true
    };
  },
  getInitialState() {
    return {
      value: this.props.value,
      edit: this.props.value
    };
  },
  componentDidUpdate() {
    if (this.props.value !== this.state.value) {
      this.setState({
        value: this.props.value,
        edit: this.props.value
      });
    }
  },
  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  },
  onFocus(e) {
    if (!this.props.onFocus) return;
    this.props.onFocus(e.target.value);
  },
  onChange(e) {
    const self = this;
    this.setState({
      edit: e.target.value.length ? e.target.value : undefined
    });

    /**
     * A change call should be delayed only if the previous
     * change has been called less than a threshold delay
     * */

    if (e.target.value.length < this.props.threshold) {
      return;
    }
    if (!this.timeout) {
      self.props.onChange(self.props.name, self.state.edit);
      self.setState({
        value: self.state.edit
      });
      this.timeout = setTimeout(() => {
        self.timeout = undefined;
      }, this.props.timeout);
    } else {
      this.clearTimeout();
      this.timeout = setTimeout(() => {
        self.props.onChange(self.props.name, self.state.edit);
        self.setState({
          value: self.state.edit
        });
        self.timeout = undefined;
      }, this.props.timeout);
    }
  },
  onCommit(e) {
    e.preventDefault();
    if (typeof e.keyCode === 'undefined' || e.keyCode == 13) {
      this.clearTimeout();
      this.props.onChange(this.props.name, this.state.edit);
      this.setState({
        value: this.state.edit
      });
    }
  },
  isLoading() {
    if (!this.props.enableLoadingDisplay) return false;
    return !!(this.props.loading || this.timeout);
  },
  renderSpinner() {
    return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
      className: "input-spinner",
      children: this.isLoading() ? /*#__PURE__*/_reactJsxDevRuntime.jsxDEV(Spinner, {
        options: {
          width: 1,
          length: 3,
          radius: 4,
          color: '#666'
        }
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 130,
        columnNumber: 11
      }, this) : null
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 128,
      columnNumber: 7
    }, this);
  },
  renderButton() {
    return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("span", {
      className: "input-group-btn",
      children: /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("button", {
        className: "btn btn-default",
        type: "button",
        onClick: this.onCommit,
        children: this.props.loading ? this.renderSpinner() : /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("i", {
          className: "fa fa-search"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 154,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 146,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 145,
      columnNumber: 7
    }, this);
  },
  render() {
    return /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("div", {
      className: this.props.dynamic ? 'search-field' : 'search-field input-group',
      children: [/*#__PURE__*/_reactJsxDevRuntime.jsxDEV("label", {
        className: "sr-only",
        htmlFor: this.props.name,
        children: this.props.label
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 168,
        columnNumber: 9
      }, this), /*#__PURE__*/_reactJsxDevRuntime.jsxDEV("input", {
        placeholder: this.props.placeholder,
        type: "text",
        className: "form-control",
        onFocus: this.onFocus,
        onChange: this.onChange,
        onKeyUp: this.onCommit,
        value: this.state.edit || ''
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 171,
        columnNumber: 9
      }, this), this.props.dynamic ? this.renderSpinner() : this.renderButton()]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 163,
      columnNumber: 7
    }, this);
  }
});
//# sourceMappingURL=SearchField.js.map