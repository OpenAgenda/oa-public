import _extends from "@babel/runtime-corejs3/helpers/extends";
import _objectWithoutProperties from "@babel/runtime-corejs3/helpers/objectWithoutProperties";
import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _classCallCheck from "@babel/runtime-corejs3/helpers/classCallCheck";
import _assertThisInitialized from "@babel/runtime-corejs3/helpers/assertThisInitialized";
import _createClass from "@babel/runtime-corejs3/helpers/createClass";
import _inherits from "@babel/runtime-corejs3/helpers/inherits";
import _createSuper from "@babel/runtime-corejs3/helpers/createSuper";
import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
import _endsWithInstanceProperty from "@babel/runtime-corejs3/core-js/instance/ends-with";
var _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/components/Image.js";
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types'; // checks for svg if last 4 characters === '.svg'

import { jsx as ___EmotionJSX } from "@emotion/core";

function srcRepresentsSvgFile(src) {
  return _endsWithInstanceProperty(src).call(src, '.svg');
}

var Image = /*#__PURE__*/function (_PureComponent) {
  _inherits(Image, _PureComponent);

  var _super = _createSuper(Image);

  _createClass(Image, null, [{
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

    _classCallCheck(this, Image);

    _this = _super.call(this, props);

    _defineProperty(_assertThisInitialized(_this), "assignImageRef", function (r) {
      _this._image = r;
    });

    _defineProperty(_assertThisInitialized(_this), "onError", function () {
      var fallbackSrc = _this.props.fallbackSrc;

      if (!fallbackSrc) {
        return;
      }

      _this.setState(function (s) {
        return _objectSpread(_objectSpread({}, s), {}, {
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

  _createClass(Image, [{
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
          propsToPass = _objectWithoutProperties(_this$props, ["alt", "onError", "fallbackSrc"]);

      var currentSrc = this.state.currentSrc;
      return ___EmotionJSX("img", _extends({}, propsToPass, {
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
}(PureComponent);

_defineProperty(Image, "propTypes", {
  src: PropTypes.string.isRequired,
  fallbackSrc: PropTypes.string,
  alt: PropTypes.string,
  onError: PropTypes.func
});

_defineProperty(Image, "defaultProps", {
  fallbackSrc: null,
  alt: '',
  onError: function onError() {}
});

export default Image;
//# sourceMappingURL=Image.js.map