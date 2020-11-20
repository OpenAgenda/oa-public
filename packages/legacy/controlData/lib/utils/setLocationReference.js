"use strict";

const _ = require( 'lodash' );

const parseLocation = require( './parseLocation' );

const log = require( '@openagenda/logs' )( 'controlData/utils/setLocationReference' );

module.exports = ( ctlData, location ) => {

  if ( !ctlData ) {
    log('warn', 'control data object is not initialized');
    return null;
  }

  const index = _.findIndex( ctlData.l, { u: location.uid } );

  const parsed = parseLocation( location );

  if ( index === -1 ) {

    ctlData.l.push( parsed );

  } else {

    ctlData.l[ index ] = parsed;

  }

  return parsed;

}
