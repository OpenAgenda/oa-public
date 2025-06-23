import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
var _jsxFileName = "/home/kaore/Dev/lib/oa/public/agenda-docx/client/src/Modal.js";
import React, { Component } from 'react';
import * as bodyScroll from './utils/bodyScroll.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export default class Modal extends Component {
  constructor(props) {
    super(props);
    _defineProperty(this, "handleEsc", event => {
      if (event.key === 'Escape') this.handleClose();
    });
    _defineProperty(this, "handleClose", () => {
      const {
        onClose
      } = this.props;
      if (onClose) onClose();
    });
    _defineProperty(this, "handleOverlayClick", () => {
      const {
        visible
      } = this.props;
      const {
        clickOnModal
      } = this.state;
      if (visible && !clickOnModal) {
        this.handleClose();
      }
      this.state.clickOnModal = false;
    });
    _defineProperty(this, "handleModalClick", () => {
      this.state.clickOnModal = true;
    });
    _defineProperty(this, "addClickEvents", () => {
      const modalDomNode = this.modalRef.current;
      const overlayDomNode = this.overlayRef.current;
      if (modalDomNode) modalDomNode.addEventListener('click', this.handleModalClick);
      if (overlayDomNode) overlayDomNode.addEventListener('click', this.handleOverlayClick);
      document.addEventListener('keydown', this.handleEsc);
    });
    _defineProperty(this, "removeClickEvents", () => {
      const modalDomNode = this.modalRef.current;
      const overlayDomNode = this.overlayRef.current;
      if (modalDomNode) modalDomNode.removeEventListener('click', this.handleModalClick);
      if (overlayDomNode) overlayDomNode.removeEventListener('click', this.handleOverlayClick);
      document.removeEventListener('keydown', this.handleEsc);
    });
    this.state = {
      clickOnModal: false
    };
    this.modalRef = /*#__PURE__*/React.createRef();
    this.overlayRef = /*#__PURE__*/React.createRef();
  }
  componentDidMount() {
    const {
      visible,
      disableBodyScroll
    } = this.props;
    if (visible) {
      this.addClickEvents();
    }
    if (disableBodyScroll) {
      bodyScroll.disable();
    }
  }
  componentDidUpdate() {
    const {
      visible
    } = this.props;
    if (visible) {
      this.addClickEvents();
    } else {
      this.removeClickEvents();
    }
  }
  componentWillUnmount() {
    this.removeClickEvents();
    const {
      disableBodyScroll
    } = this.props;
    if (disableBodyScroll) {
      bodyScroll.enable();
    }
  }
  render() {
    const {
      title,
      children,
      visible,
      classNames
    } = this.props;
    if (!visible) {
      return null;
    }
    return /*#__PURE__*/_jsxDEV("div", {
      role: "button",
      tabIndex: 0,
      className: classNames.overlay,
      onKeyPress: this.onKeyPress,
      ref: this.overlayRef,
      children: /*#__PURE__*/_jsxDEV("section", {
        ref: this.modalRef,
        children: [title ? /*#__PURE__*/_jsxDEV("header", {
          className: "popup-title",
          children: [/*#__PURE__*/_jsxDEV("h2", {
            children: title
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 122,
            columnNumber: 15
          }, this), /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            "aria-label": "Close",
            onClick: this.handleClose,
            className: "btn btn-link close-link",
            children: /*#__PURE__*/_jsxDEV("i", {
              className: "fa fa-times fa-lg"
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 129,
              columnNumber: 17
            }, this)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 123,
            columnNumber: 15
          }, this)]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 121,
          columnNumber: 13
        }, this) : null, /*#__PURE__*/_jsxDEV("div", {
          className: "popup-content",
          children: children
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 133,
          columnNumber: 11
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 119,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 112,
      columnNumber: 7
    }, this);
  }
}
_defineProperty(Modal, "defaultProps", {
  children: null,
  title: null,
  visible: true,
  disableBodyScroll: false,
  onClose: null,
  classNames: {
    overlay: 'popup-overlay'
  }
});
//# sourceMappingURL=Modal.js.map