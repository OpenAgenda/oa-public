"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'add' );

const c = require( './config' );

module.exports = function( userUid, data, cb ) {

  let { type, subject, identifier } = data;

  _doAdd( {
    userUid,
    type,
    subject,
    identifier
  }, ( err, insertId ) => {

    if ( err ) return cb( err );

    if ( !insertId ) return cb( 'could not insert unsubscribe reference' );

    log( 'info', 'unsubscribed user %s from %s', userUid, subject, data );

    cb( null, {
      success: true 
    } );

  } );

};

function _doAdd( data, cb ) {

  c.knex( c.schemas.unsubscribed )

    .insert( _.extend( {
      created_at: new Date()
    }, _.mapKeys( data, ( v, k ) => _.snakeCase( k ) ) ) )

    .asCallback( ( err, insertIds ) => {

      if ( err ) return cb( err );

      cb( null, insertIds.length ? insertIds[ 0 ] : null );

    } );

} 