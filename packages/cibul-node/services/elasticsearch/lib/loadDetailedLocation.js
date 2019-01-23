"use strict";

const utils = require( '@openagenda/utils' );
const al = require( '@openagenda/agenda-locations' );


/**
 * inject detailed location info given by
 * location service
 */
module.exports = function( data, cb ) {

  if ( !data

  || typeof data !== 'object'

  || !utils.isArray( data.locations )

  || !data.locations.length ) return cb();

  al.get( { id: data.locations[ 0 ].id }, {
    instanciate: false,
    decorate: true,
    fullImagePath: true
  }, ( err, location ) => {

    if ( err ) return cb( err );

    for( let k in location ) {

      data.locations[ 0 ][ k ] = location[ k ];

    }

    cb();

  } )

}
