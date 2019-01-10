"use strict";

const _ = require( 'lodash' );

const parseLocation = require( './parseLocation' );

module.exports = ( ctlData, location ) => {

  const index = _.findIndex( ctlData.l, { u: location.uid } );

  const parsed = parseLocation( location );

  if ( index === -1 ) {

    ctlData.l.push( parsed );

  } else {

    ctlData.l[ index ] = parsed;

  }

  return parsed;

}
