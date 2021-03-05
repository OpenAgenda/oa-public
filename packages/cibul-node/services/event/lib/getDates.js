'use strict';

const moment = require('moment-timezone');

function _fZ( n ) {
  return (n>9?'':'0') + n;
};

module.exports = (timings = [], timezone) => {
  var dates = [],

  timingsByDate = {};

  timings.forEach( function( t ) {

    var d = _stringifyDate( t.start, timezone);

    if ( dates.indexOf( d ) == -1 ) {

      dates.push( d );

      timingsByDate[ d ] = [];

    }

    timingsByDate[ d ].push( t );

  });

  return dates.sort().map( function( d ) {

    return {
      date: new Date( d ),
      timings: timingsByDate[ d ]
    }

  });

}

function _stringifyDate( d, timezone ) {

  const stringified = moment.tz( d, timezone || 'Europe/Paris' ).format( 'YYYY-MM-DD' );

  return moment.locale() === 'ar' ? stringified.split( '-' ).map( parseArabic ).map( _fZ ).join( '-' ) : stringified;

}

function parseArabic(str) {
  return Number( str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function(d) {
      return d.charCodeAt(0) - 1632; // Convert Arabic numbers
  }).replace(/[۰۱۲۳۴۵۶۷۸۹]/g, function(d) {
      return d.charCodeAt(0) - 1776; // Convert Persian numbers
  }) );
}