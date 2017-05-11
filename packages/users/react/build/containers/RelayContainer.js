"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types');

var RelayContainer = createReactClass({

  displayName: 'RelayContainer',

  childContextTypes: {
    lang: PropTypes.string,
    getLabels: PropTypes.func
  },

  getChildContext: function getChildContext() {
    var _this = this;

    return {
      lang: this.props.lang,
      getLabels: function getLabels(label) {
        return _this.props.getLabels(label, _this.props.lang);
      }
    };
  },
  render: function render() {
    var _props = this.props,
        Component = _props.Component,
        store = _props.store,
        routerProps = _props.routerProps;

    return React.createElement(Component, _extends({ store: store }, routerProps));
  }
});

module.exports = RelayContainer;