"use strict";

const _ = require( 'lodash' );
const config = require( './config' );
const parseListArguments = require( '@openagenda/service-utils/parseListArguments' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );

module.exports = ( userUid, query, cb ) => {

  if ( typeof query === 'function' ) {
    cb = query;
    query = {};
  } else if ( !query ) {
    query = {};
  }

  const request = config.knex( config.schemas.unsubscribed )
    .where( 'user_uid', userUid );

  if ( query.subject ) {
    request.andWhere( 'subject', query.subject );
  }
  if ( query.type ) {
    request.andWhere( 'type', query.type );
  }
  if ( query.identifier ) {
    request.andWhere( 'identifier', 'in', query.identifier );
  }

  const promise = request
    .orderBy( 'id', 'desc' )
    .then( rows => rows.map( row => {
      const result = _.mapKeys( row, ( v, k ) => _.camelCase( k ) );

      result.identifier = !isNaN( parseFloat( row.identifier ) ) && isFinite( row.identifier )
        ? parseFloat( row.identifier )
        : row.identifier;

      return result;
    } ) )
    .then( unsubscriptions => ({
      success: true,
      unsubscriptions: unsubscriptions.map( u => _.pickBy( u, v => v !== null ) )
    }) );

  return promisePlusCb( promise, cb );

};
