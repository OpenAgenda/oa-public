"use strict";

var React = require('react'),
    ReactDOM = require("react-dom"),
    bodyScroll = require('./bodyScroll');

var Modal = React.createClass({

  displayName: 'Modal',

  propTypes: {
    title: React.PropTypes.string,
    visible: React.PropTypes.bool,
    onClose: React.PropTypes.func,
    disableBodyScroll: React.PropTypes.bool
  },

  clickOnModal: false,

  getDefaultProps: function getDefaultProps() {

    return {
      title: null,
      visible: true,
      disableBodyScroll: false,
      classNames: {
        overlay: 'popup-overlay'
      }
    };
  },
  componentDidUpdate: function componentDidUpdate() {

    if (this.props.visible) {

      this.addClickEvents();
    } else {

      this.removeClickEvents();
    }
  },
  addClickEvents: function addClickEvents() {

    ReactDOM.findDOMNode(this.modalRef).addEventListener('click', this.handleModalClick);

    document.addEventListener('click', this.handleDocumentClick);
  },
  removeClickEvents: function removeClickEvents() {

    ReactDOM.findDOMNode(this.modalRef).removeEventListener('click', this.handleModalClick);

    document.removeEventListener('click', this.handleDocumentClick);
  },
  componentDidMount: function componentDidMount() {

    if (this.props.visible) this.addClickEvents();

    if (this.props.disableBodyScroll) bodyScroll.disable();
  },
  componentWillUnmount: function componentWillUnmount() {

    this.removeClickEvents();

    if (this.props.disableBodyScroll) bodyScroll.enable();
  },
  handleModalClick: function handleModalClick() {

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

    var _props = this.props,
        visible = _props.visible,
        title = _props.title,
        children = _props.children;


    return React.createElement(
      "div",
      { style: { display: visible ? 'block' : 'none' }, className: this.props.classNames.overlay },
      React.createElement(
        "section",
        { ref: function ref(_ref) {
            return _this.modalRef = _ref;
          } },
        title ? React.createElement(
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
        ) : null,
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