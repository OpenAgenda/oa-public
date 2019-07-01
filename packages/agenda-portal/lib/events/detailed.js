"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment-timezone' );
const isURL = require( 'validator/lib/isURL' )

const spreadPerMonthPerDay = require( './spreadPerMonthPerDay' );

const detailedTiming = require( '../timings/detailed' );

module.exports = ( { lang } ) => ( event, req ) => {

  moment.locale( lang );

  event.timings = event.timings.map( detailedTiming.bind(
    null,
    { event, req }
  ) );

  return Object.assign( event, {
    months: spreadPerMonthPerDay( event.timings, event.timezone, lang )
  } );

}
