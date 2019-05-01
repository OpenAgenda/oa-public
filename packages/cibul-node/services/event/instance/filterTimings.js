"use strict";

const moment = require( 'moment-timezone' );

module.exports = ( timings, filter, timezone ) => {

  let filtered = timings;

  if ( filter.from ) {

    filtered = _filterFrom( filtered, filter.from, timezone );

  }

  if ( filter.to ) {

    filtered = _filterTo( filtered, filter.to, timezone );

  }

  return filtered;

}

function _filterFrom( timings, fromValue, timezone ) {

  return timings.filter( t => moment.tz( fromValue.replace( ' ', '+' ), timezone ).format( 'YYYY-MM-DD' ) <= moment.tz( t.start, timezone ).format( 'YYYY-MM-DD' ) );

}

function _filterTo( timings, toValue, timezone ) {

  return timings.filter( t => moment.tz( toValue.replace( ' ', '+' ), timezone ).format( 'YYYY-MM-DD' ) >= moment.tz( t.start, timezone ).format( 'YYYY-MM-DD' ) );

}
