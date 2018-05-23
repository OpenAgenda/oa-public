"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'remove' );

const c = require( './config' );

module.exports = ( userUid, data, cb ) => {

  let { type, subject, identifier } = data;

  _doRemove( {
    userUid,
    type,
    subject,
    identifier
  }, ( err, deletedCount ) => {

    if ( err ) return cb( err );

    log( 'info', 'user %s removed his unsubscription %s', userUid, subject, data );

    cb( null, {
      success: deletedCount > 0,
      deletedCount
    } );

  } );

};

function _doRemove( data, cb ) {

  let filtered = _.pickBy( data, v => v !== undefined );

  c.knex( c.schemas.unsubscribed )

    .where( _.mapKeys( filtered, ( v, k ) => _.snakeCase( k ) ) )

    .del()

  .asCallback( ( err, deletedCount ) => {

    if ( err ) return cb( err );

    cb( null, deletedCount );

  } );

} 