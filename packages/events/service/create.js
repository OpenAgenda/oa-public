
"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );

const logger = require( '@openagenda/logs' );
const slugs = require( '@openagenda/slugs' );

const cleanCreateArgs = require( './lib/cleanCreateArgs' );
const cleanCreateOptions = require( './validate/createOptions' );
const draft = require( './lib/draft.w' );
const get = require( './lib/get.w' );
const map = require( './databaseFieldMap' );
const now = require( './lib/now.w' );
const transferToLegacy = require( './lib/transferToLegacy.w' );
const unique = require( './lib/unique.w' );
const validate = require( './lib/validate.w' );
const processImage = require( './lib/processImage' );

const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );

let schemas, service, knex, config, log;

module.exports = _.extend( function( d, o, c ) {

  const { data, options, cb } = cleanCreateArgs( d, o, c );

  const p = createPromise( data, options );

  if ( cb === null ) return p;

  p.catch( cb );

  p.then( result => {

    setImmediate( () => {

      cb( null, result );

    } );

  } );

}, {
  init: ( svc, c ) => {

    service = svc;

    schemas = c.schemas;

    knex = c.knex;

    config = c;

    log = logger( 'events service/create' );

  }
} );


async function createPromise( data, options ) {

  let cleanOptions = {};

  const { interfaces } = config;

  try {

    cleanOptions = cleanCreateOptions( options );

  } catch ( e ) {};

  let v = await w( _.extend( {}, cleanOptions, {
    id: false,
    data,
    clean: null,
    created: null,
    errors: [],
    identifiers: null,
    success: false,
    transferedToLegacy: false
  } ) )

    .then( _verifyUniqueUidIfSet );

  if ( !data.uid ) {

    v.data.uid = await _createUid(
      config.knex( schemas.event ),
      config.legacyKnex( config.legacy.schemas.event )
    );

  }

  v = await w( v )

    .then( _createSlugIfNotSet )

    .then( unique.verify( {
      mysql: config.mysql, 
      table: schemas.event, 
      field: 'slug', 
      log 
    } ) )

    .then( now.setTo( 'data', 'updatedAt', cleanOptions.protected ) )

    .then( now.setTo( 'data', 'createdAt', cleanOptions.protected ) )

    .then( draft( 'data' ) )

    .then( validate( { target: 'data', log } ) );

  // if image was set as path or url, image should be processed before event create.
  _.extend( v, await processImage.w( config, v ) );

  return w( v ).then( _doCreate )

    .then( cleanOptions.transferToLegacy ? transferToLegacy.bind( null, service ) : v => v )

    .then( get( {
      log,
      get: service.get,
      target: 'created', 
      internal: true, 
      prerequisite: v => v.success && !v.errors.length,
      includeImagePath: cleanOptions.includeImagePath
    } ) )

    .then( _cleanResult );

}


function _cleanResult( v ) {

  if ( v.success && config.interfaces ) {

    config.interfaces.onCreate( v.created, v.context );

  }

  return {
    event: v.internal ? v.created : dbParse.exclude( v.created, 'internal' ),
    valid: !v.errors.length,
    success: v.success,
    errors: v.errors,
    transferedToLegacy: v.transferedToLegacy
  }

}


function _doCreate( v ) {

  if ( v.errors.length ) {

    log( 'create will not proceed' );

    return v;

  }

  return knex( schemas.event )

    .insert( dbParse.toDb( v.clean ) )

    .then( result => {

      v.success = !!( result && result[ 0 ] );

      if ( !v.success ) return v;

      log( 'event of slug %s, uid %s, id %s successfully created', v.clean.slug, v.clean.uid, result[ 0 ] );

      v.identifiers = {
        id: result[ 0 ]
      };

      v.id = result[ 0 ];

      return v;

    } );

}


function _verifyUniqueUidIfSet( v ) {

  if ( !v.data.uid ) return v;

  return unique.verify( {
    mysql: config.mysql, 
    table: schemas.event, 
    field: 'uid',
    log
  } )( v );

}


async function _createUid( eventSchema, legacyEventSchema ) {

  let uniqueUid = null;

  while ( !uniqueUid ) {

    let newUid = Math.ceil( Math.random() * 99999999 );

    const exists = !!( await eventSchema.first( 'id' ).where( { uid: newUid } ) );

    uniqueUid = exists ? null : newUid;

  }

  const uidExistsInLegacy = !!( await legacyEventSchema.first( 'uid' ).where( { uid: uniqueUid } ) );

  if ( uidExistsInLegacy ) {

    // if at first you don't succeed
    return _createUid( eventSchema, legacyEventSchema );

  }

  return uniqueUid;

}


function _createSlugIfNotSet( v ) {

  if ( v.data.slug ) return v;

  let d = w.defer(),

  title = _getFirstTitle( v.data );

  unique.define( {
    table: schemas.event,
    field: 'slug',
    mysql: config.mysql
  }, previousSlug => slugs.generate( title, !!previousSlug ),
  ( err, slug ) => {

    if ( err ) return d.reject( err );

    log( 'created slug %s', slug );

    v.data.slug = slug;

    d.resolve( v );

  } );

  return d.promise;

}


function _getFirstTitle( data ) {

  if ( !data || !data.title || typeof data.title !== 'object' ) {

    return false;

  }

  let firstLang = Object.keys( data.title )[ 0 ];

  return data.title[ firstLang ];

}