'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _dec,
    _class,
    _jsxFileName = 'src/components/Image/Image.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _recompose = require('recompose');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  Image: {
    displayName: 'Image'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/Image/Image.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

// checks for svg if last 4 characters === '.svg'
function srcRepresentsSvgFile(src) {
  return src && /\.svg$/.test(src);
}

var Image = _wrapComponent('Image')((_dec = (0, _recompose.compose)(
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
      propsToPass = (0, _objectWithoutProperties3.default)(_ref2, ['fallbackSrc', 'imgState', 'updateImgState']);

  return (0, _extends3.default)({}, propsToPass, {
    src: imgState.currentSrc,
    // on image load error:
    // spread origSrc to remember it, and update new currentSrc to the fallback image
    onError: function onError() {
      if (!fallbackSrc) return;
      updateImgState(function (s) {
        return (0, _extends3.default)({}, s, { currentSrc: fallbackSrc });
      });
    }
  });
})), _dec(_class = function (_Component) {
  (0, _inherits3.default)(Image, _Component);

  function Image() {
    (0, _classCallCheck3.default)(this, Image);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Image.__proto__ || (0, _getPrototypeOf2.default)(Image)).call(this));

    _this.assignImageRef = _this.assignImageRef.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Image, [{
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
          propsToPass = (0, _objectWithoutProperties3.default)(_props, ['src', 'onError']);


      return _react3.default.createElement('img', (0, _extends3.default)({ ref: this.assignImageRef, src: src, onError: onError }, propsToPass, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 67
        }
      }));
    }
  }]);
  return Image;
}(_react2.Component)) || _class));

exports.default = Image;
;
module.exports = exports['default'];
//# sourceMappingURL=Image.js.map