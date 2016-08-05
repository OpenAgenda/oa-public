"use strict";

var React = require('react'),
    getLabel = require('labels')(require('labels/agenda-search'));

module.exports = React.createClass({

  displayName: 'AgendaItem',

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
        { href: '/agendas/' + this.props.agenda.uid },
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
              'strong',
              null,
              this.props.agenda.title
            )
          ),
          React.createElement(
            'p',
            { className: 'description' },
            this.props.agenda.description
          ),
          React.createElement(
            'div',
            null,
            this.props.agenda.verified ? React.createElement(
              'span',
              { className: 'badge badge-primary' },
              React.createElement('i', { className: 'fa fa-check' }),
              ' ',
              getLabel('verified', this.props.lang)
            ) : null,
            this.props.agenda.upcomingPublishedEvents === 0 && this.props.agenda.publishedEvents === 1 ? React.createElement(
              'span',
              { className: 'badge badge-default' },
              getLabel('publishedEvent', this.props.lang)
            ) : null,
            this.props.agenda.upcomingPublishedEvents === 0 && this.props.agenda.publishedEvents > 1 ? React.createElement(
              'span',
              { className: 'badge badge-default' },
              getLabel('publishedEvents', { count: this.props.agenda.publishedEvents }, this.props.lang)
            ) : null,
            this.props.agenda.upcomingPublishedEvents === 1 ? React.createElement(
              'span',
              { className: 'badge badge-info' },
              getLabel('upcomingEvent', this.props.lang)
            ) : null,
            this.props.agenda.upcomingPublishedEvents > 1 ? React.createElement(
              'span',
              { className: 'badge badge-info' },
              getLabel('upcomingEvents', { count: this.props.agenda.upcomingPublishedEvents }, this.props.lang)
            ) : null
          )
        )
      )
    );
  }
});