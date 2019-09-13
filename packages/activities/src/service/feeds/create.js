"use strict";

const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const log = require( '@openagenda/logs' )( 'activities/feeds/create' );
const method = require( '../../utils/method' );

const FEED_TYPES = require( '../feedTypes' );

schema.register( {
  choice: validators.choice,
  number: validators.number
} );

module.exports = create;

function parseArguments( identifiers, options, cb ) {

  const result = {
    identifiers,
    options,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 2 ) {

    Object.assign( result, {
      identifiers: args[ 0 ],
      options: {},
      cb: args[ 1 ]
    } );

  }

  return result;

}

function create( config ) {

  const { service, knex } = config;
  const {
    identifiers,
    options,
    cb
  } = parseArguments.apply( null, Array.prototype.slice.call(arguments, 1) );

  const {
    entityType,
    entityUid
  } = identifiers;

  const defaultHook = {
    data: {
      entityType,
      entityUid
    }
  };

  const promise = method( [
    {
      field: {
        name: 'entity_type',
        dataKey: 'entityType',
        schema: {
          type: 'choice',
          options: FEED_TYPES,
          unique: true,
          optional: false
        }
      }
    }, {
      field: {
        name: 'entity_uid',
        dataKey: 'entityUid',
        schema: {
          type: 'number',
          optional: false
        }
      }
    }
  ], ( hook, next ) => {

    const dataSchema = hook.fields.reduce( ( prev, field ) => {
      if ( !field.schema ) return prev;

      prev[ field.dataKey || field.name ] = field.schema;

      return prev;
    }, {} );

    const validate = schema( dataSchema );

    try {
      hook.data = validate( hook.data );
    } catch ( e ) {
      return next( e );
    }

    const fields = hook.fields.reduce( ( prev, field ) => {
      if ( !hook.data[ field.dataKey || field.name ] ) return prev;

      prev[ field.name ] = hook.data[ field.dataKey || field.name ];
      return prev;
    }, {} );

    return service.feed( identifiers ).get()
      .then( feed => {

        if ( feed ) return Promise.reject( new Error( 'Feed already exists' ) );

      } )
      .catch( error => {

        if ( error && error.message === 'Feed doesn\'t exists' ) return;

        return Promise.reject( error );

      } )
      .then( () => {

        return knex( config.schemas.feed ).insert( fields );

      } )
      .then( ids => {

        return service.feed( ids[ 0 ] ).get( options );

      } )
      .then( feed => {

        log.info( 'Feed created (type %s, uid %s)', feed.entityType, feed.entityUid );

        return feed;

      } );

  }, { defaultHook } );

  return promisePlusCb( promise, cb );

}
