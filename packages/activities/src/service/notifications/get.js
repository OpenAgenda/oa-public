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


module.exports = get;

function parseArguments( identifiers, query, options, cb ) {

  const result = {
    identifiers,
    query,
    options,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 3 ) {

    Object.assign( result, {
      identifiers: args[ 0 ],
      query: args[ 1 ],
      options: {},
      cb: args[ 2 ]
    } );

  }

  return result;

}

function get( config ) {

  const { service, knex } = config;

  let {
    identifiers,
    query,
    options,
    cb
  } = parseArguments.apply( null, Array.from( arguments ).slice( 1 ) );

  const params = _.merge( {
    excludeIds: []
  }, options );

  if ( identifiers.entityType && identifiers.entityType !== 'user' ) {

    return promisePlusCb( Promise.reject( new VError( 'The notifications concern only feeds users' ) ), cb );

  }

  const validateQuery = schema( {
    feedId: {
      type: 'number',
      optional: true
    },
    verb: {
      type: 'text',
      max: 255,
      optional: false
    },
    groupBy: {
      type: 'text',
      max: 255,
      optional: true
    },
    state: {
      type: 'choice',
      options: notificationStates.codes,
      unique: true,
      optional: true
    }
  } );

  if ( typeof query !== 'number' ) {

    try {

      validateQuery( query );

    } catch ( errors ) {

      return promisePlusCb( Promise.reject( new VError( { info: { errors } }, 'Query validation failed' ) ), cb );

    }

  } else {

    query = { id: query };

  }

  const where = _.pickBy( _.mapKeys( query, ( value, key ) => _.snakeCase( key ) ), value => value !== undefined );

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      if ( feed === null ) return Promise.reject( new VError( 'Feed not found' ) );

      if ( feed.entityType && feed.entityType !== 'user' ) {
        return Promise.reject( new VError( 'The notifications concern only feeds users' ) );
      }

      const request = knex( config.schemas.feed_notification ).first()
        .where( where )
        .where( 'feed_id', feed.id );

      if ( params.excludeIds ) {
        request.whereNotIn( 'id', params.excludeIds );
      }

      return request
        .then( result => {

          if ( result ) {
            result = _.mapKeys( result, ( value, key ) => _.camelCase( key ) );
            result.store = JSON.parse( result.store || '{}' );
          }

          return result;

        } );

    } );

  return promisePlusCb( promise, cb );

};
