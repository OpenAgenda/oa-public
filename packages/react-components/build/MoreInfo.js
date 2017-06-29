'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Popover = require('react-bootstrap/lib/Popover');

var _Popover2 = _interopRequireDefault(_Popover);

var _OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

var _OverlayTrigger2 = _interopRequireDefault(_OverlayTrigger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MoreInfo = (_temp = _class = function (_Component) {
  _inherits(MoreInfo, _Component);

  function MoreInfo(props) {
    _classCallCheck(this, MoreInfo);

    var _this = _possibleConstructorReturn(this, (MoreInfo.__proto__ || Object.getPrototypeOf(MoreInfo)).call(this, props));

    _this.renderIcon = _this.renderIcon.bind(_this);
    return _this;
  }

  _createClass(MoreInfo, [{
    key: 'renderIcon',
    value: function renderIcon() {
      var _props = this.props,
          className = _props.className,
          link = _props.link,
          style = _props.style;


      var iconStyle = Object.assign({
        color: '#41acdd',
        fontSize: '1.3em'
      }, style);

      var icon = _react2.default.createElement('i', { className: 'fa fa-question-circle ' + className, 'aria-hidden': 'true', style: iconStyle });

      return link ? _react2.default.createElement(
        'a',
        { href: link, target: '_blank' },
        icon
      ) : icon;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          children = _props2.children,
          id = _props2.id,
          title = _props2.title,
          content = _props2.content,
          placement = _props2.placement;


      if (!content) return children;

      var popover = _react2.default.createElement(
        _Popover2.default,
        { id: id, title: title },
        content
      );

      return _react2.default.createElement(
        _OverlayTrigger2.default,
        { trigger: ['hover', 'focus'], placement: placement, overlay: popover },
        children || this.renderIcon()
      );
    }
  }]);

  return MoreInfo;
}(_react.Component), _class.propTypes = {
  id: _propTypes2.default.string.isRequired,
  title: _propTypes2.default.node,
  content: _propTypes2.default.node,
  link: _propTypes2.default.string,
  placement: _propTypes2.default.oneOf(['top', 'right', 'bottom', 'left']),
  className: _propTypes2.default.string,
  style: _propTypes2.default.object
}, _class.defaultProps = {
  title: null,
  content: null,
  link: null,
  placement: 'right',
  className: '',
  style: null
}, _temp);
exports.default = MoreInfo;
module.exports = exports['default'];