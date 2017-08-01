"use strict";

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

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _bodyScroll = require('./body-scroll');

var _bodyScroll2 = _interopRequireDefault(_bodyScroll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Modal = (_temp = _class = function (_Component) {
  _inherits(Modal, _Component);

  function Modal(props) {
    _classCallCheck(this, Modal);

    var _this = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this, props));

    _this.state = {
      clickOnModal: false
    };

    _this.handleModalClick = _this.handleModalClick.bind(_this);
    _this.handleOverlayClick = _this.handleOverlayClick.bind(_this);
    _this.handleClose = _this.handleClose.bind(_this);
    _this.handleEsc = _this.handleEsc.bind(_this);
    _this.setModalRef = _this.setModalRef.bind(_this);
    return _this;
  }

  _createClass(Modal, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {

      if (this.props.visible) {

        this.addClickEvents();
      } else {

        this.removeClickEvents();
      }
    }
  }, {
    key: 'addClickEvents',
    value: function addClickEvents() {

      var modalDomNode = _reactDom2.default.findDOMNode(this.modalRef);
      var overlayDomNode = _reactDom2.default.findDOMNode(this.overlayRef);

      if (modalDomNode) modalDomNode.addEventListener('click', this.handleModalClick);
      if (overlayDomNode) overlayDomNode.addEventListener('click', this.handleOverlayClick);

      document.addEventListener('keydown', this.handleEsc);
    }
  }, {
    key: 'removeClickEvents',
    value: function removeClickEvents() {

      var modalDomNode = _reactDom2.default.findDOMNode(this.modalRef);
      var overlayDomNode = _reactDom2.default.findDOMNode(this.overlayRef);

      if (modalDomNode) modalDomNode.removeEventListener('click', this.handleModalClick);
      if (overlayDomNode) overlayDomNode.removeEventListener('click', this.handleOverlayClick);

      document.removeEventListener('keydown', this.handleEsc);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {

      if (this.props.visible) this.addClickEvents();

      if (this.props.disableBodyScroll) _bodyScroll2.default.disable();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {

      this.removeClickEvents();

      if (this.props.disableBodyScroll) _bodyScroll2.default.enable();
    }
  }, {
    key: 'handleModalClick',
    value: function handleModalClick() {

      this.state.clickOnModal = true;
    }
  }, {
    key: 'handleOverlayClick',
    value: function handleOverlayClick(e) {

      if (this.props.visible && !this.state.clickOnModal) {

        this.handleClose();
      }

      this.state.clickOnModal = false;
    }
  }, {
    key: 'handleClose',
    value: function handleClose() {
      var onClose = this.props.onClose;


      if (onClose) onClose();
    }
  }, {
    key: 'handleEsc',
    value: function handleEsc(event) {
      if (event.key === 'Escape') this.handleClose();
    }
  }, {
    key: 'setModalRef',
    value: function setModalRef(ref) {
      this.modalRef = ref;
      if (this.props.modalRef) this.props.modalRef(ref);
    }
  }, {
    key: 'getModalRef',
    value: function getModalRef() {
      return this.modalRef;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          title = _props.title,
          children = _props.children,
          visible = _props.visible;


      if (!visible) {
        return null;
      }

      return _react2.default.createElement(
        'div',
        {
          className: this.props.classNames.overlay,
          onKeyPress: this.onKeyPress,
          ref: function ref(_ref) {
            return _this2.overlayRef = _ref;
          }
        },
        _react2.default.createElement(
          'section',
          { ref: this.setModalRef },
          title ? _react2.default.createElement(
            'header',
            { className: 'popup-title' },
            _react2.default.createElement(
              'h2',
              null,
              title
            ),
            _react2.default.createElement(
              'a',
              { onClick: this.handleClose, className: 'close-link' },
              _react2.default.createElement('i', { className: 'fa fa-times fa-lg' })
            )
          ) : null,
          _react2.default.createElement(
            'div',
            { className: 'popup-content' },
            children
          )
        )
      );
    }
  }]);

  return Modal;
}(_react.Component), _class.propTypes = {
  title: _propTypes2.default.element,
  visible: _propTypes2.default.bool,
  onClose: _propTypes2.default.func,
  disableBodyScroll: _propTypes2.default.bool
}, _class.defaultProps = {
  title: null,
  visible: true,
  disableBodyScroll: false,
  classNames: {
    overlay: 'popup-overlay'
  }
}, _temp);
exports.default = Modal;
module.exports = exports['default'];