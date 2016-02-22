"use strict";

var React = require('react');

module.exports = React.createClass({
  displayName: "exports",

  propTypes: {
    agenda: React.PropTypes.object
  },

  render: function render() {

    return React.createElement(
      "div",
      { className: "agenda-item media" },
      React.createElement(
        "a",
        null,
        React.createElement(
          "div",
          { className: "media-left" },
          React.createElement("img", {
            className: "media-object ill avatar",
            src: this.props.agenda.image,
            alt: this.props.agenda.title
          })
        ),
        React.createElement(
          "div",
          { className: "media-body" },
          React.createElement(
            "h4",
            { className: "title media-heading" },
            this.props.agenda.title
          ),
          React.createElement(
            "p",
            { className: "description" },
            this.props.agenda.description
          )
        )
      )
    );
  }

});