"use strict";

const _ = require( 'lodash' );

const c = require( './config' );

module.exports = ( userUid, data, cb ) => {

  let { type, subject, identifier } = data;

  _is( {
    userUid,
    type,
    subject,
    identifier
  }, cb );

};

function _is( data, cb ) {

  let nulled = _.mapValues( data, v => v !== undefined ? v : null );

  c.knex( c.schemas.unsubscribed )

    .where( _.mapKeys( nulled, ( v, k ) => _.snakeCase( k ) ) )

    .count( 'id as c' )

  .asCallback( ( err, rows ) => {

    if ( err ) return cb( err );

    cb( null, rows[ 0 ].c > 0 );

  } );

} 