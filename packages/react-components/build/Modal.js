"use strict";

var React = require('react'),
    ReactDOM = require("react-dom");

var Modal = React.createClass({

  displayName: 'Modal',

  propTypes: {
    title: React.PropTypes.string.isRequired,
    visible: React.PropTypes.bool,
    onClose: React.PropTypes.func
  },

  clickOnModal: false,

  getDefaultProps: function getDefaultProps() {
    return { visible: true };
  },
  componentDidUpdate: function componentDidUpdate() {

    if (this.props.visible) {
      ReactDOM.findDOMNode(this.modalRef).addEventListener('click', this.handleModalClick);
      document.addEventListener('click', this.handleDocumentClick);
    } else {
      ReactDOM.findDOMNode(this.modalRef).removeEventListener('click', this.handleModalClick);
      document.removeEventListener('click', this.handleDocumentClick);
    }
  },
  handleModalClick: function handleModalClick(e) {

    this.clickOnModal = true;
  },
  handleDocumentClick: function handleDocumentClick(e) {

    if (this.props.visible && !this.clickOnModal) {

      var area = ReactDOM.findDOMNode(this.modalRef);

      if (!area.contains(e.target)) {
        this.handleClose();
      }
    }

    this.clickOnModal = false;
  },
  handleClose: function handleClose() {
    var onClose = this.props.onClose;


    if (onClose) onClose();
  },
  render: function render() {
    var _this = this;

    var _props = this.props;
    var visible = _props.visible;
    var title = _props.title;
    var children = _props.children;


    return React.createElement(
      "div",
      { style: { display: visible ? 'block' : 'none' }, className: "popup-overlay" },
      React.createElement(
        "section",
        { ref: function ref(_ref) {
            return _this.modalRef = _ref;
          } },
        React.createElement(
          "header",
          { className: "popup-title" },
          React.createElement(
            "h2",
            null,
            title
          ),
          React.createElement(
            "a",
            { onClick: this.handleClose, className: "close-link" },
            React.createElement("i", { className: "fa fa-times fa-lg" })
          )
        ),
        React.createElement(
          "div",
          { className: "popup-content" },
          children
        )
      )
    );
  }
});

module.exports = Modal;