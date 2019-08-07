"use strict";

const _ = require( 'lodash' );
const parseListArguments = require( '@openagenda/service-utils/parseListArguments' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const log = require( '@openagenda/logs' )( 'activities/notifications/list' );
const VError = require( 'verror' );
const notificationStates = require( '../notificationStates' );

schema.register( {
  text: validators.text,
  pass: validators.pass,
  number: validators.number
} );

module.exports = list;

function list( config, identifiers ) {

  const { service, knex } = config;

  let args = parseListArguments.apply( null, Array.from( arguments ).slice( 2 ) );

  args.query = _.pick( args.query, [ 'ids', 'actor', 'verb', 'object', 'target', 'groupBy', 'state', 'createdAt' ] );

  const validateArgs = schema( {
    query: {
      type: 'pass'
    },
    offset: {
      type: 'number'
    },
    limit: {
      type: 'number'
    },
    options: {
      type: 'pass'
    },
    cb: {
      type: 'pass'
    }
  } );

  try {

    args = validateArgs( args );

  } catch ( errors ) {

    return promisePlusCb( Promise.reject( new VError( { info: { errors } }, 'Arguments validation failed' ) ), cb );

  }

  let {
    query,
    offset: fromId,
    limit,
    options,
    cb
  } = args;

  const params = _.merge( {}, options );

  if ( identifiers.entityType && identifiers.entityType !== 'user' ) {

    return promisePlusCb( Promise.reject( new VError( 'The notifications concern only feeds users' ) ), cb );

  }

  const validateQuery = schema( {
    verb: {
      type: 'text',
      max: 255,
      optional: true
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
    },
    stateNot: {
      type: 'choice',
      options: notificationStates.codes,
      unique: true,
      optional: true
    },
    ids: {
      type: 'number',
      list: true,
      optional: true
    }
  } );

  try {

    validateQuery( query );

  } catch ( errors ) {

    return promisePlusCb( Promise.reject( new VError( { info: { errors } }, 'Query validation failed' ) ), cb );

  }

  const { ids, stateNot } = query;
  query = _.mapKeys( _.pick( query, 'verb', 'groupBy', 'state' ), ( value, key ) => _.snakeCase( key ) );

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      if ( feed === null ) return Promise.reject( new VError( 'Feed not found' ) );

      if ( feed.entityType && feed.entityType !== 'user' ) {
        return Promise.reject( new VError( 'The notifications concern only feeds users' ) );
      }

      const request = knex( config.schemas.feed_notification ).select()
        .where( query )
        .where( 'feed_id', feed.id )
        .orderBy( 'updated_at', 'desc' )
        .orderBy( 'id', 'desc' );

      if ( ids ) {
        request.whereIn( 'id', ids );
      } else {
        request.limit( limit );
      }

      if ( stateNot !== undefined ) {
        request.where( 'state', '<>', stateNot );
      }

      if ( fromId ) {
        request.where( 'id', '<', fromId );
      }

      return request.then( rows => {

        return rows.map( row => {

          row = _.mapKeys( row, ( value, key ) => _.camelCase( key ) );
          row.store = JSON.parse( row.store || '{}' );
          return row;

        } );

      } );

    } )
    .catch( err => {

      log.error( err );

      return Promise.reject( err );

    } );

  return promisePlusCb( promise, cb );

};
