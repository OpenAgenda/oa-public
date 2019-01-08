"use strict";

const _ = require( 'lodash' );

const spreadPerMonthPerDay = require( './spreadPerMonthPerDay' );

module.exports = ( { lang } ) => event => {

  event.months = spreadPerMonthPerDay( event.timings, event.timezone, lang );

  return event;

}
