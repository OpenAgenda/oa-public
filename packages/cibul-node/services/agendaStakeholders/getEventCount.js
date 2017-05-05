"use strict";

const model = require( '../model' );

let log = console.log;

module.exports = ( agendaId, userId, cb ) => {

  model.lib.query( [
    'select count( distinct ra.id ) event_count',
    'from review_article as ra',
    'where ra.review_id = ? and ra.user_id = ?'
  ].join( ' ' ), [ agendaId, userId ], ( err, rows ) => {

    if ( err ) return cb( err );

    if ( !rows.length ) return cb( null, 0 );

    cb( null, parseInt( rows[ 0 ].event_count ) );

  } );

}

module.exports.setLog = l => log = l;