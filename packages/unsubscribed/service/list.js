"use strict";

const _ = require( 'lodash' );
const config = require( './config' );
const parseListArguments = require( '@openagenda/service-utils/parseListArguments' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );

module.exports = ( userUid, cb ) => {

  const promise = config.knex( config.schemas.unsubscribed )
    .where( 'user_uid', userUid )
    .orderBy( 'id', 'desc' )
    .then( rows => rows.map( row => _.mapKeys( row, ( v, k ) => _.camelCase( k ) ) ) )
    .then( unsubscriptions => ({
      success: true,
      unsubscriptions: unsubscriptions.map( u => _.pickBy( u, v => v !== null ) )
    }) );

  return promisePlusCb( promise, cb );

};
