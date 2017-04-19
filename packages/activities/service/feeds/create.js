"use strict";

const _ = require( 'lodash' );
const promisePlusCb = require( 'service-utils/promisePlusCb' );
const schema = require( 'validators/schema' );
const validators = require( 'validators' );
const logger = require( 'basic-logger' );
const method = require( '../../utils/method' );

const FEED_TYPES = require( '../feedTypes' );

let config;
let knex;
let service;
let log;

schema.register( {
  choice: validators.choice,
  number: validators.number
} );

module.exports = Object.assign( create, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  log = logger( 'activities - create' );

}

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

function create() {

  const {
    identifiers,
    options,
    cb
  } = parseArguments.apply( null, arguments );

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

        log( 'info', { message: 'Feed created', feed } );

        return feed;

      } );

  }, { defaultHook } );

  return promisePlusCb( promise, cb );

}
