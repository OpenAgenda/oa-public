"use strict";

//const moment = require( 'moment' );
const tz = require( 'moment-timezone' ).tz;

module.exports = ( d, timezone ) => {

  return Math.ceil(
    ( tz( d, timezone ).diff(
      tz( d, timezone ).date( 1 ).day( 1 ),
      'days'
    ) + 1 )
  / 7 );

}
