"use strict";

const _ = require( 'lodash' );
const tz = require( 'moment-timezone' ).tz;

const getTimingsSchemaJSONLD = require( '../timings/getSchemaJSONLD' );

module.exports = event => {

  return {
    ... event,
    JSONLD: get( event )
  }

}

function get( event ) {

  return getTimingsSchemaJSONLD( event, {
    start: _.first( event.timings ).start,
    end: _.last( event.timings ).end
  } );

}
