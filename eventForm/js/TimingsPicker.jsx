"use strict";

var React = require( 'react' ),

Picker = require( 'react-timings-picker' );

module.exports = React.createClass( {

  getLang: function() {

    var langs = {
      fr: 'fr-FR',
      en: 'en-US'
    }

    return langs[ this.props.lang ];

  },

  getTimings: function() {

    return this.props.timings.map( function( t ) {

      return {
        start: t.date + 'T' + t.begin + ':00Z',
        end: t.date + 'T' + t.end + ':00Z'
      }

    });

  },

  render: function() {

    function onTimingsChange(timings, targetTiming, operation) {
      console.log(arguments);
    };

    function onTimingClick(start, end, targetTiming) {
      console.log(arguments);
    }

    return <Picker
      startTime="7:00"
      endTime="3:00"
      timings={this.getTimings()}
      weekStartDay={1}
      onTimingsChange={onTimingsChange}
      onTimingClick={onTimingClick}
      readOnly={false} 
      lang={this.getLang()} />

  }

} );