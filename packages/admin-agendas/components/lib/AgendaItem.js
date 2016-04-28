"use strict";

var React = require('react');

module.exports = React.createClass({

  displayName: 'AgendaItem',

  propTypes: {
    agenda: React.PropTypes.object,
    onSelect: React.PropTypes.func
  },

  render: function render() {

    return React.createElement(
      'div',
      { className: 'agenda-item media cursor-pointer', onClick: this.props.onSelect.bind(null, this.props.agenda.id, 1) },
      React.createElement(
        'a',
        null,
        React.createElement(
          'div',
          { className: 'media-body' },
          React.createElement(
            'h4',
            { className: 'title media-heading' },
            this.props.agenda.title
          )
        )
      )
    );
  }

});