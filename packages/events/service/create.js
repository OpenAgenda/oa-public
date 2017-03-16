
"use strict";

const w = require( 'when' ),

  _ = require( 'lodash' ),

  slugs = require( 'slugs' ),

  get = require( './lib/get.w' ),

  now = require( './lib/now.w' ),

  logger = require( 'basic-logger' ),

  draft = require( './lib/draft.w' ),

  unique = require( './lib/unique.w' ),

  map = require( './databaseFieldMap' ),

  validate = require( './lib/validate.w' ),

  dbParse = require( 'mysql-utils/mapper' )( map );

let schemas, service, knex, config, log;

module.exports = _.extend( function( data, options, cb ) {

  if ( cb === undefined ) {

    cb = options;
    options = {};

  }

  const params = _.extend( {
    internal: false,
    includeImagePath: false,
    draft: false
  }, options );


  w( _.extend( {}, params, {
    id: false,
    data,
    clean: null,
    created: null,
    errors: [],
    identifiers: null,
    success: false
  } ) )

  .then( _verifyUniqueUidIfSet )

  .then( _createUid )

  .then( _createSlugIfNotSet )

  .then( unique.verify( {
    mysql: config.mysql, 
    table: schemas.event, 
    field: 'slug', 
    log 
  } ) )

  .then( now.setTo( 'data', 'updatedAt' ) )

  .then( now.setTo( 'data', 'createdAt' ) )

  .then( draft( 'data' ) )

  .then( validate( { target: 'data', log } ) )

  .then( _doCreate )

  .then( get( {
    log,
    get: service.get,
    target: 'created', 
    internal: true, 
    prerequisite: v => v.success && !v.errors.length,
    includeImagePath: params.includeImagePath
  } ) )

  .done( v => {

    if ( v.success && config.interfaces ) {

      config.interfaces.onCreate( v.created );

    }

    cb( null, {
      event: params.internal ? v.created : dbParse.exclude( v.created, 'internal' ),
      valid: !v.errors.length,
      success: v.success,
      errors: v.errors
    } );

  }, cb );

}, {
  init: ( svc, c ) => {

    service = svc;

    schemas = c.schemas;

    knex = c.knex;

    config = c;

    log = logger( 'events service/create' );

  }
} );


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

    log( 'agenda of slug %s, uid %s, id %s successfully created', v.clean.slug, v.clean.uid, result[ 0 ] );

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


function _createUid( v ) {

  let d = w.defer();

  if ( v.data.uid ) {

    log( 'uid is already defined, no need to create new' );

    return v;

  }

  unique.define( {
    table: schemas.event,
    field: 'uid',
    mysql: config.mysql
  }, () => Math.ceil( Math.random() * 99999999 ), ( err, uid ) => {

    if ( err ) return d.reject( err );

    v.data.uid = uid;

    log( 'created uid %s', uid );

    d.resolve( v );

  } );

  return d.promise;

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