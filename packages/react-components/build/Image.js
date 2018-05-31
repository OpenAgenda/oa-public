'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _dec, _class;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _recompose = require('recompose');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// checks for svg if last 4 characters === '.svg'
function srcRepresentsSvgFile(src) {
  return src && /\.svg$/.test(src);
}

var Image = (_dec = (0, _recompose.compose)(
// make sure we recieved original image src prop
(0, _recompose.setPropTypes)({ src: _propTypes2.default.string.isRequired, fallbackSrc: _propTypes2.default.string }),
// track original image src and current image src
(0, _recompose.withState)('imgState', 'updateImgState', function (_ref) {
  var src = _ref.src;
  return { origSrc: src, currentSrc: src };
}), (0, _recompose.lifecycle)({
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    // if this Image components src changes, make sure we update origSrc and currentSrc
    if (nextProps.src !== nextProps.imgState.origSrc) {
      nextProps.updateImgState({ origSrc: nextProps.src, currentSrc: nextProps.src });
    }
  }
}), (0, _recompose.mapProps)(function (_ref2) {
  var fallbackSrc = _ref2.fallbackSrc,
      imgState = _ref2.imgState,
      updateImgState = _ref2.updateImgState,
      propsToPass = _objectWithoutProperties(_ref2, ['fallbackSrc', 'imgState', 'updateImgState']);

  return _extends({}, propsToPass, {
    src: imgState.currentSrc,
    // on image load error:
    // spread origSrc to remember it, and update new currentSrc to the fallback image
    onError: function onError() {
      if (!fallbackSrc) return;
      updateImgState(function (s) {
        return _extends({}, s, { currentSrc: fallbackSrc });
      });
    }
  });
})), _dec(_class = function (_Component) {
  _inherits(Image, _Component);

  function Image() {
    _classCallCheck(this, Image);

    var _this = _possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).call(this));

    _this.assignImageRef = _this.assignImageRef.bind(_this);
    return _this;
  }

  _createClass(Image, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var src = this.props.src;
      // if image hasn't completed loading, then let react handle error

      if (!this._image.complete) return;
      /*
       * If an image has finished loading and has 'errored' (errored when naturalWidth === 0, or if svg check width)
       * Then run the onError callback
       * NOTE IF SVG: need to use width because firefox and IE assign naturalWidth from the svg elements width property,
       * but some svgs don't have that specified
       */
      var isInvalidSvg = srcRepresentsSvgFile(src) && !this._image.width;
      var imgFailedToLoad = this._image.naturalWidth === 0;

      if (isInvalidSvg || imgFailedToLoad) {
        this.props.onError();
      }
    }
  }, {
    key: 'assignImageRef',
    value: function assignImageRef(r) {
      this._image = r;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          src = _props.src,
          onError = _props.onError,
          propsToPass = _objectWithoutProperties(_props, ['src', 'onError']);

      return _react2.default.createElement('img', _extends({ ref: this.assignImageRef, src: src, onError: onError }, propsToPass));
    }
  }]);

  return Image;
}(_react.Component)) || _class);
exports.default = Image;
;
module.exports = exports['default'];
//# sourceMappingURL=Image.js.map