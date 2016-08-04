"use strict";

var React = require('react'),
    getLabel = require('labels')(require('labels/agenda-search'));

module.exports = React.createClass({
  displayName: 'exports',


  propTypes: {
    agenda: React.PropTypes.object,
    lang: React.PropTypes.string
  },

  render: function render() {

    return React.createElement(
      'div',
      { className: 'agenda-item media' },
      React.createElement(
        'a',
        null,
        React.createElement(
          'div',
          { className: 'media-left' },
          React.createElement('img', {
            className: 'media-object ill avatar',
            src: this.props.agenda.image,
            alt: this.props.agenda.title
          })
        ),
        React.createElement(
          'div',
          { className: 'media-body' },
          React.createElement(
            'div',
            { className: 'title media-heading' },
            React.createElement(
              'h4',
              null,
              this.props.agenda.title
            ),
            this.props.agenda.verified ? React.createElement(
              'span',
              { className: 'badge badge-primary' },
              getLabel('verified', this.props.lang)
            ) : null
          ),
          React.createElement(
            'p',
            { className: 'description' },
            this.props.agenda.description
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'span',
              null,
              'événements: ',
              this.props.agenda.publishedEvents
            ),
            ' /',
            React.createElement(
              'span',
              null,
              'à venir: ',
              this.props.agenda.upcomingPublishedEvents
            )
          )
        )
      )
    );
  }

});