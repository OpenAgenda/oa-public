"use strict";

const _ = require( 'lodash' );

const initializeControlData = require( './initializeControlData' );

const log = require( '@openagenda/logs' )( 'controlData/loadAgendaControlData' );

module.exports = async ( redis, prefix, agendaUid, options = {} ) => {

  const {
    parse,
    initialize
  } = _.assign( { parse: true, initialize: false }, options );

  const ctlDataStr = await redis.get( prefix + agendaUid );

  const isNotDefined = !ctlDataStr || ctlDataStr === 'null';

  if ( isNotDefined && !initialize ) {

    return null;

  } else if ( isNotDefined && !parse ) {

    return JSON.stringify( initializeControlData() );

  } else if ( isNotDefined ) {

    return initializeControlData();

  } else if ( !parse ) {

    return ctlDataStr;

  }

  try {

    return JSON.parse( ctlDataStr );

  } catch ( e ) {

    log( 'error', 'could not parse control data of agenda %s: %s', agendaUid, ctlDataStr );

  }

  return initializeControlData();
}
