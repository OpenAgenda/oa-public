"use strict";

var React = require('react');

var Modal = React.createClass({

  displayName: 'Modal',

  propTypes: {
    title: React.PropTypes.string.isRequired,
    visible: React.PropTypes.bool,
    onClose: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return { visible: true };
  },
  handleClose: function handleClose() {
    var onClose = this.props.onClose;


    if (onClose) onClose();
  },
  render: function render() {
    var _props = this.props;
    var visible = _props.visible;
    var title = _props.title;
    var children = _props.children;


    return React.createElement(
      'div',
      { style: { display: visible ? 'block' : 'none' }, className: 'popup-overlay' },
      React.createElement(
        'section',
        null,
        React.createElement(
          'header',
          { className: 'popup-title' },
          React.createElement(
            'h2',
            null,
            title
          ),
          React.createElement(
            'a',
            { onClick: this.handleClose, className: 'close-link' },
            React.createElement('i', { className: 'fa fa-times fa-lg' })
          )
        ),
        React.createElement(
          'div',
          { className: 'popup-content' },
          children
        )
      )
    );
  }
});

module.exports = Modal;