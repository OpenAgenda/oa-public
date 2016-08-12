"use strict";

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  RelayContainer: {
    displayName: 'RelayContainer'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/RelayContainer.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var React = require('react');

var RelayContainer = _wrapComponent('RelayContainer')(React.createClass({

  displayName: 'RelayContainer',

  childContextTypes: {
    lang: React.PropTypes.string,
    getLabels: React.PropTypes.func
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
    var _props = this.props;
    var Component = _props.Component;
    var store = _props.store;
    var routerProps = _props.routerProps;

    return React.createElement(Component, _extends({ store: store }, routerProps));
  }
}));

module.exports = RelayContainer;