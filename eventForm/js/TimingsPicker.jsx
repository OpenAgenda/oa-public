"use strict";

var React = require( 'react' ),

Picker = require( 'react-timings-picker' ),

utils = require( 'utils' ),

transform = require( './timingsTransform' );

module.exports = React.createClass( {

  getDefaultProps: function() {

    return {
      day: {
        start: '07:00',
        end: '07:00'
      }
    }

  },

  getLang: function() {

    var langs = {
      fr: 'fr-FR',
      en: 'en-US'
    }

    return langs[ this.props.lang ];

  },

  onChange: function( timings, targetTiming, operation ) {

    var processed = transform.toEventFormFormat( timings, this.props.day.start, this.props.day.end );

    this.props.onChange( 
      processed, 
      timings.length ? false : this.props.labels.noDates[ this.props.lang ]
    );

  },

  getTimings: function() {

    return transform.toTimingsWidgetFormat( this.props.timings, this.props.day.start, this.props.day.end );

  },

  render: function() {

    return <div>
      <p className="help">
        <a target="_blank" href="https://openagenda.zendesk.com/hc/fr/articles/202667461-Saisir-les-horaires-de-votre-%C3%A9v%C3%A9nement">{this.props.labels.timingsHelp[ this.props.lang ]}</a>
      </p>
      <h2>{this.props.labels.timings[ this.props.lang ]}</h2>
      <Picker
        startTime={this.props.day.start}
        endTime={this.props.day.end}
        timings={this.getTimings()}
        activeDays={ this.props.configuration ? this.props.configuration.activeDays : undefined }
        weekStartDay={1}
        onTimingsChange={this.onChange}
        readOnly={false}
        timeStep={60}
        timingStep={30}
        lang={this.getLang()} />
    </div>;

  }

} );