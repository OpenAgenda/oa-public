"use strict";

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

    return React.createElement(Component, (0, _extends3.default)({ store: store }, routerProps));
  }
});

module.exports = RelayContainer;
//# sourceMappingURL=RelayContainer.js.map