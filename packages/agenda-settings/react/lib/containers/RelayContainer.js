'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var RelayContainer = _wrapComponent('RelayContainer')((_temp = _class = function (_Component) {
  _inherits(RelayContainer, _Component);

  function RelayContainer() {
    _classCallCheck(this, RelayContainer);

    return _possibleConstructorReturn(this, (RelayContainer.__proto__ || Object.getPrototypeOf(RelayContainer)).apply(this, arguments));
  }

  _createClass(RelayContainer, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var _this2 = this;

      return {
        lang: this.props.lang,
        getLabels: function getLabels(label) {
          return _this2.props.getLabels(label, _this2.props.lang);
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var Component = _props.Component;
      var routerProps = _props.routerProps;

      return _react3.default.createElement(Component, routerProps);
    }
  }]);

  return RelayContainer;
}(_react2.Component), _class.displayName = 'RelayContainer', _class.childContextTypes = {
  lang: _react2.PropTypes.string,
  getLabels: _react2.PropTypes.func
}, _temp));

exports.default = RelayContainer;
module.exports = exports['default'];