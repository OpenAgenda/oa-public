"use strict";

var React = require('react'),
    getLabel = require('@openagenda/labels')(require('@openagenda/labels/agenda-search')),
    PropTypes = require('prop-types'),
    createReactClass = require('create-react-class'),
    url = require('../../service/url');

module.exports = createReactClass({

  displayName: 'AgendaItem',

  propTypes: {
    agenda: PropTypes.object,
    lang: PropTypes.string
  },

  render: function render() {

    return React.createElement(
      'div',
      { className: 'agenda-item media' },
      React.createElement(
        'a',
        { href: url.agenda(this.props.agenda) },
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
            ),
            this.props.agenda.official ? React.createElement(
              'div',
              { className: 'official' },
              React.createElement('img', { src: '//s3.eu-central-1.amazonaws.com/oastatic/official14.png', alt: 'officiel' }),
              React.createElement(
                'div',
                { className: 'tooltip right', role: 'tooltip' },
                React.createElement('div', { className: 'tooltip-arrow' }),
                React.createElement(
                  'div',
                  { className: 'tooltip-inner' },
                  getLabel('official', this.props.lang)
                )
              )
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