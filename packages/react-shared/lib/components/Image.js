"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/assertThisInitialized"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/inherits"));

var _createSuper2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createSuper"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _endsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/ends-with"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _core = require("@emotion/core");

var _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/components/Image.js";

// checks for svg if last 4 characters === '.svg'
function srcRepresentsSvgFile(src) {
  return (0, _endsWith.default)(src).call(src, '.svg');
}

var Image = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2.default)(Image, _PureComponent);

  var _super = (0, _createSuper2.default)(Image);

  (0, _createClass2.default)(Image, null, [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(_ref, state) {
      var src = _ref.src;

      // if this Image components src changes, make sure we update origSrc and currentSrc
      if (src !== state.origSrc) {
        return {
          origSrc: src,
          currentSrc: src
        };
      }

      return null;
    }
  }]);

  function Image(props) {
    var _this;

    (0, _classCallCheck2.default)(this, Image);
    _this = _super.call(this, props);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "assignImageRef", function (r) {
      _this._image = r;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "onError", function () {
      var fallbackSrc = _this.props.fallbackSrc;

      if (!fallbackSrc) {
        return;
      }

      _this.setState(function (s) {
        return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, s), {}, {
          currentSrc: fallbackSrc
        });
      });
    });
    _this.state = {
      origSrc: props.src,
      currentSrc: props.src
    };
    return _this;
  }

  (0, _createClass2.default)(Image, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var src = this.props.src;

      if (!this._image.complete) {
        return;
      } // if image hasn't completed loading, then let react handle error

      /*
       * If an image has finished loading and has 'errored' (errored when naturalWidth === 0, or if svg check width)
       * Then run the onError callback
       * NOTE IF SVG: need to use width because firefox and IE assign naturalWidth from the svg elements width property,
       * but some svgs don't have that specified
       */


      var isInvalidSvg = srcRepresentsSvgFile(src) && !this._image.width;
      var imgFailedToLoad = this._image.naturalWidth === 0;

      if (isInvalidSvg || imgFailedToLoad) {
        this.onError();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          alt = _this$props.alt,
          onError = _this$props.onError,
          fallbackSrc = _this$props.fallbackSrc,
          propsToPass = (0, _objectWithoutProperties2.default)(_this$props, ["alt", "onError", "fallbackSrc"]);
      var currentSrc = this.state.currentSrc;
      return (0, _core.jsx)("img", (0, _extends2.default)({}, propsToPass, {
        ref: this.assignImageRef,
        src: currentSrc,
        alt: alt,
        onError: this.onError,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 87,
          columnNumber: 7
        }
      }));
    }
  }]);
  return Image;
}(_react.PureComponent);

(0, _defineProperty2.default)(Image, "propTypes", {
  src: _propTypes.default.string.isRequired,
  fallbackSrc: _propTypes.default.string,
  alt: _propTypes.default.string,
  onError: _propTypes.default.func
});
(0, _defineProperty2.default)(Image, "defaultProps", {
  fallbackSrc: null,
  alt: '',
  onError: function onError() {}
});
var _default = Image;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=Image.js.map