"use strict";

const model = require( '../../model' );
const config = require( '../../../config' );

module.exports = function( agendaId, cb ) {

  model.lib.query( `select id from ${config.schemas.aggregator} where review_id = ? limit 0, 1`, agendaId, ( err, rows ) => {

    if ( err ) return cb( err );

    cb( null, !!(rows && rows.length) );

  } );

}