"use strict";

var _jsxFileName = "/home/bertho/oa/packages/react-form-components/components/Spinner.jsx";

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    ReactDom = require('react-dom'),
    Spinner = require('spin.js');

module.exports = createReactClass({
  displayName: 'Spinner',
  propTypes: {
    loading: PropTypes.bool
  },
  getDefaultProps: function getDefaultProps() {
    return {
      loading: true
    };
  },
  componentDidMount: function componentDidMount() {
    this.spinner = new Spinner(this.props.spinner || {
      width: 1,
      length: 6,
      radius: 10,
      color: '#666'
    });
    this.evaluate();
  },
  componentDidUpdate: function componentDidUpdate() {
    this.evaluate();
  },
  evaluate: function evaluate() {
    if (this.props.loading) {
      this.spinner.spin(ReactDom.findDOMNode(this.canvas));
    } else {
      this.spinner.stop();
    }
  },
  render: function render() {
    var _this = this;

    return React.createElement("div", {
      className: this.props.loading ? 'spin-canvas' : '',
      ref: function ref(r) {
        return _this.canvas = r;
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 64
      },
      __self: this
    });
  }
});
//# sourceMappingURL=Spinner.js.map