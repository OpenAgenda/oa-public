"use strict";

const _ = require( 'lodash' );
const config = require( './config' );
const parseListArguments = require( 'service-utils/parseListArguments' );
const promisePlusCb = require( 'service-utils/promisePlusCb' );

module.exports = ( userUid, cb ) => {

  const promise = config.knex( config.schemas.unsubscribed )
    .where( 'user_uid', userUid )
    .orderBy( 'id', 'desc' )
    .then( rows => rows.map( row => _.mapKeys( row, ( v, k ) => _.camelCase( k ) ) ) )
    .then( unsubscriptions => ({
      success: true,
      unsubscriptions
    }) );

  return promisePlusCb( promise, cb );

};
