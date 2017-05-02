"use strict";

const model = require( '../../model' );

module.exports = function( agendaId, cb ) {

  model.lib.query( 'select id from aggregator where review_id = ? limit 0, 1', agendaId, ( err, rows ) => {

    if ( err ) return cb( err );

    cb( null, !!rows.length );

  } );

}