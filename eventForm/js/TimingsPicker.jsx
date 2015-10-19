"use strict";

var React = require( 'react' ),

Picker = require( 'react-timings-picker' ),

utils = require( 'utils' );

module.exports = React.createClass( {

  getLang: function() {

    var langs = {
      fr: 'fr-FR',
      en: 'en-US'
    }

    return langs[ this.props.lang ];

  },

  onChange: function( timings, targetTiming, operation ) {

    this.props.onChange( timings.map( function( t ) {

      var s = new Date( t.start ),

      e = new Date( t.end );

      return {
        date: s.getFullYear() + '-' + utils.fZ( s.getMonth() + 1 ) + '-' + utils.fZ( s.getDate() ),
        begin: utils.fZ( s.getHours() ) + ':' + utils.fZ( s.getMinutes() ),
        end: utils.fZ( e.getHours() ) + ':' + utils.fZ( e.getMinutes() )
      }

    }), false );

  },

  onSelect: function( start, end, targetTiming ) {

    console.log( 'select' );

  },

  getTimings: function() {

    var self = this;

    var timings = this.props.timings.map( function( t ) {

      return {
        start: t.date + 'T' + t.begin + self._tZ(),
        end: t.date + 'T' + t.end + self._tZ()
      }

    });

    return timings;

  },

  render: function() {

    return <div>
      <h2>{this.props.labels.timings[ this.props.lang ]}</h2>
      <Picker
        startTime="7:00"
        endTime="3:00"
        timings={this.getTimings()}
        weekStartDay={1}
        onTimingsChange={this.onChange}
        onTimingClick={this.onSelect}
        readOnly={false} 
        lang={this.getLang()} />
    </div>;

  },

  _tZ: function() {

    var tzh = ( new Date ).getTimezoneOffset() / 60;

    return ( tzh >= 0 ? '' : '+' ) + utils.fZ( - tzh ) + ':00';

  }

} );