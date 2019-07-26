"use strict";

const applyTimezone = require( './applyTimezone' );
const getLabels = require( './getLabels' );
const getSchemaJSONLD = require( './getSchemaJSONLD' );
const links = require( './links' );

module.exports = ( { event, req }, timing ) => ( {
  ... timing,
  labels: getLabels( event.location.timezone, timing ),
  'JSONLD': getSchemaJSONLD(
    event,
    applyTimezone( timing, event.location.timezone )
  ),
  ... links( { event, req }, timing )
} );
