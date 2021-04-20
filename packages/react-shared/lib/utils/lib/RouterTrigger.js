"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/inherits"));

var _createSuper2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createSuper"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactRouterDom = require("react-router-dom");

var _core = require("@emotion/core");

var _class,
    _class2,
    _temp,
    _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/utils/lib/RouterTrigger.js";

var RouterTrigger = (0, _reactRouterDom.withRouter)(_class = (_temp = _class2 = /*#__PURE__*/function (_Component) {
  (0, _inherits2.default)(RouterTrigger, _Component);

  var _super = (0, _createSuper2.default)(RouterTrigger);

  function RouterTrigger() {
    var _context;

    var _this;

    (0, _classCallCheck2.default)(this, RouterTrigger);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, (0, _concat.default)(_context = [this]).call(_context, args));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "state", {
      needTrigger: false,
      location: null,
      previousLocation: null
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "trigger", function () {
      var _this$props = _this.props,
          trigger = _this$props.trigger,
          location = _this$props.location;
      var needTrigger = _this.state.needTrigger;

      if (needTrigger) {
        _this.safeSetState({
          needTrigger: false
        }, function () {
          trigger({
            pathname: location.pathname
          }).catch(function (err) {
            return console.log('Failure in RouterTrigger:', err);
          }).then(function () {
            // clear previousLocation so the next screen renders
            _this.safeSetState({
              previousLocation: null
            });
          });
        });
      }
    });
    return _this;
  }

  (0, _createClass2.default)(RouterTrigger, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.mounted = true;
      this.trigger();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.mounted = false;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      this.trigger();
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      return nextState.previousLocation !== this.state.previousLocation;
    }
  }, {
    key: "safeSetState",
    value: function safeSetState(nextState, callback) {
      if (this.mounted) {
        this.setState(nextState, callback);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          children = _this$props2.children,
          location = _this$props2.location;
      var previousLocation = this.state.previousLocation; // use a controlled <Route> to trick all descendants into
      // rendering the old location

      return (0, _core.jsx)(_reactRouterDom.Route, {
        location: previousLocation || location,
        render: function render() {
          return children;
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 83,
          columnNumber: 12
        }
      });
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(props, state) {
      var location = state.location;
      var pathname = props.location.pathname;
      var navigated = !location || pathname !== location.pathname;

      if (navigated) {
        return {
          needTrigger: true,
          location: props.location,
          previousLocation: location || props.location
        };
      }

      return null;
    }
  }]);
  return RouterTrigger;
}(_react.Component), (0, _defineProperty2.default)(_class2, "defaultProps", {
  trigger: function trigger() {}
}), _temp)) || _class;

var _default = RouterTrigger;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=RouterTrigger.js.map