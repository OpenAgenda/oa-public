"use strict";

var React = require('react'),
    ReactDom = require('react-dom'),
    Spinner = require('spin.js');

module.exports = React.createClass({

  displayName: 'Spinner',

  propTypes: {
    loading: React.PropTypes.bool.isRequired
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

      this.spinner.spin(ReactDom.findDOMNode(this.refs.canvas));
    } else {

      this.spinner.stop();
    }
  },

  render: function render() {

    return React.createElement('div', { className: this.props.loading ? 'spin-canvas' : '', ref: 'canvas' });
  }

});