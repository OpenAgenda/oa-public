"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const notificationStates = require( '../notificationStates' );


schema.register( {
  choice: validators.choice,
  text: validators.text
} );


module.exports = count;

function parseArguments( identifiers, query, cb ) {

  const result = {
    identifiers,
    query,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 2 ) {

    Object.assign( result, {
      identifiers: args[ 0 ],
      query: { state: 0 },
      cb: args[ 1 ]
    } );

  }

  return result;

}

function count( config ) {

  const { service, knex } = config;

  let {
    identifiers,
    query,
    cb
  } = parseArguments.apply( null, Array.from( arguments ).slice( 1 ) );

  if ( identifiers.entityType && identifiers.entityType !== 'user' ) {

    return promisePlusCb( Promise.reject( new VError( 'The notifications concern only feeds users' ) ), cb );

  }

  const validateQuery = schema( {
    state: {
      type: 'choice',
      options: notificationStates.codes,
      unique: true,
      optional: true
    }
  } );

  try {

    validateQuery( query );

  } catch ( errors ) {

    return promisePlusCb( Promise.reject( new VError( { info: { errors } }, 'Query validation failed' ) ), cb );

  }

  const where = _.pickBy( _.mapKeys( query, ( value, key ) => _.snakeCase( key ) ), value => value !== undefined );

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      if ( feed === null ) return Promise.reject( new VError( 'Feed not found' ) );

      if ( feed.entityType && feed.entityType !== 'user' ) {
        return Promise.reject( new VError( 'The notifications concern only feeds users' ) );
      }

      return knex( config.schemas.feed_notification ).first().count( 'id as count' )
        .where( where )
        .where( 'feed_id', feed.id )
        .then( ( { count } ) => count );

    } );

  return promisePlusCb( promise, cb );

};
