import _concatInstanceProperty from "@babel/runtime-corejs3/core-js/instance/concat";
import _classCallCheck from "@babel/runtime-corejs3/helpers/classCallCheck";
import _createClass from "@babel/runtime-corejs3/helpers/createClass";
import _assertThisInitialized from "@babel/runtime-corejs3/helpers/assertThisInitialized";
import _inherits from "@babel/runtime-corejs3/helpers/inherits";
import _createSuper from "@babel/runtime-corejs3/helpers/createSuper";
import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";

var _class,
    _class2,
    _temp,
    _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/utils/lib/RouterTrigger.js";

import React, { Component } from 'react';
import { withRouter, Route } from 'react-router-dom';
import { jsx as ___EmotionJSX } from "@emotion/core";

var RouterTrigger = withRouter(_class = (_temp = _class2 = /*#__PURE__*/function (_Component) {
  _inherits(RouterTrigger, _Component);

  var _super = _createSuper(RouterTrigger);

  function RouterTrigger() {
    var _context;

    var _this;

    _classCallCheck(this, RouterTrigger);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, _concatInstanceProperty(_context = [this]).call(_context, args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      needTrigger: false,
      location: null,
      previousLocation: null
    });

    _defineProperty(_assertThisInitialized(_this), "trigger", function () {
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

  _createClass(RouterTrigger, [{
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

      return ___EmotionJSX(Route, {
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
}(Component), _defineProperty(_class2, "defaultProps", {
  trigger: function trigger() {}
}), _temp)) || _class;

export default RouterTrigger;
//# sourceMappingURL=RouterTrigger.js.map