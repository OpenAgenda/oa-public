
"use strict";

const _ = require( 'lodash' );
const uuidV4 = require( 'uuid/v4' );
const w = require( 'when' );

const logger = require( '@openagenda/logs' );
const slugs = require( '@openagenda/slugs' );

const cleanCreateArgs = require( './lib/cleanCreateArgs' );
const cleanCreateOptions = require( './validate/createOptions' );

const get = require( './lib/get.w' );
const map = require( './databaseFieldMap' );

const validate = require( './validate' );
const processImage = require( './lib/processImage' );

const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );

let schemas, service, knex, config, log, legacySchemas;

module.exports = _.extend( ( d, o, c ) => {

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

    legacySchemas = _.get( c, 'legacy.schemas' );

    knex = c.knex;

    config = c;

    log = logger( 'events service/create' );

  }
} );


async function createPromise( data, options ) {

  let cleanOptions = {};

  const { interfaces } = config;

  // clean given data
  let preCleanEvent;

  // clean completed data
  let cleanEvent;

  // id of created event
  let createdId;

  // created event was transfered to legacy
  let transferedToLegacy = false;

  // created event fetched from db
  let created;

  try {

    cleanOptions = cleanCreateOptions( options );

  } catch ( e ) {};

  const errors = [];

  try {

    if ( cleanOptions.draft ) {

      preCleanEvent = validate.draft( data );

      preCleanEvent.draft = true;

    } else {

      preCleanEvent = _.assign( validate.front( data, { 
        optionalSlug: true,
        includeUid: true
      } ), {
        draft: false
      } );

    }

  } catch ( frontValidationErrors ) {

    console.log(frontValidationErrors);

    frontValidationErrors.forEach( e => errors.push( _.assign( e, { step: 'pre' } ) ) );

  }

  if ( !errors.length && preCleanEvent.uid && await _exists( 'uid', preCleanEvent.uid, cleanOptions.evaluateLegacyIdentifiers ) ) {

    errors.push( {
      code: 'unavailable.uid',
      message: 'uid is taken by another event'
    } );

  }

  if ( !errors.length && preCleanEvent.slug && await _exists( 'slug', preCleanEvent.slug, cleanOptions.evaluateLegacyIdentifiers ) ) {

    errors.push( {
      code: 'unavailable.slug',
      message: 'slug is taken by another event'
    } );

  }

  if ( !errors.length && !preCleanEvent.uid ) {

    preCleanEvent.uid = await _defineUnique( 'uid', () => Math.ceil( Math.random() * 99999999 ) );

  }

  if ( !errors.length && !preCleanEvent.slug ) {

    const title = preCleanEvent.title[ _.keys( preCleanEvent.title )[ 0 ] ];

    preCleanEvent.slug = await _defineUnique( 'slug', prev => [ 
      title ? slugs.generate( title ) : null,
      prev || !title ? Math.ceil( Math.random()*1000 ) : null
    ].filter( v => !!v ).join( '_' ) );

  }

  if ( !errors.length ) {

    if ( cleanOptions.protected || !data.createdAt instanceof Date ) {

      preCleanEvent.createdAt = new Date();

    }

    if ( cleanOptions.protected || !data.updatedAt instanceof Date ) {

      preCleanEvent.updatedAt = new Date();

    }

    try {
      
      cleanEvent = ( cleanOptions.draft ? validate.draft : validate )( _.omit( _.assign( {}, data, preCleanEvent ), [ 'id' ]  ) );

    } catch ( validationErrors ) {

      validationErrors.forEach( e => errors.push( _.assign( e, { step: 'validation' } ) ) );

    }

  }


  if ( !errors.length && ( _.get( data, 'image.path' ) || _.get( data, 'image.url' ) ) ) {

    try {

      cleanEvent.image = await _processImage( _.get( data, 'image.url' ), _.get( data, 'image.path' ), {
        image: _.get( data, 'image' ),
        filePath: _.get( data, 'fileKey' )
      } );

    } catch ( e ) {

      errors.push( { step: 'image', caught: e } );

    }

  }


  if ( !errors.length ) {

    try {

      createdId = _.head( await knex( schemas.event ).insert( dbParse.toDb( cleanEvent ) ) );

    } catch( e ) {

      errors.push( { step: 'db', caught: e } );

    }

    if ( !createdId ) {

      errors.push( { step: 'db', message: 'Id of created event was not retrieved' } );

    }

  }

  if ( !errors.length && cleanOptions.transferToLegacy ) {

    try {

      const result = await service.legacy.update( { id: createdId } );

      transferedToLegacy = !!result.success;

      if ( !transferToLegacy ) log( 'error', 'could not transfer event to legacy', createdId );

    } catch ( e ) {

      log( 'error', 'could not transfer event to legacy', createdId, e );

    }

  }

  if ( createdId ) {

    try {

      created = await service.get( { id: createdId }, {
        internal: true,
        private: null,
        includeImagePath: cleanOptions.includeImagePath
      } );

    } catch ( e ) {

      errors.push( {
        message: 'Event was created but fetch after creation failed',
        uid: cleanEvent.uid,
        step: 'get',
        caught: e
      } );

    }

  }

  if ( created && _.get( interfaces, 'onCreate' ) ) {

    try {
      
      interfaces.onCreate( created, cleanOptions.context );

    } catch ( e ) {

      log( 'error', 'interfaces onCreate', { caught: e } );

    }

  }

  return {
    event: cleanOptions.internal ? created : dbParse.exclude( created, 'internal' ),
    valid: !errors.length,
    success: !!created,
    errors,
    transferedToLegacy
  }

}


async function _processImage( url, path, event ) {

  const fileKey = _.get( event, 'fileKey' ) || uuidV4().replace( /\-/g, '' );

  return _.assign( await processImage(
    config.interfaces.imageFilesLoad,
    config.image.formats,
    fileKey,
    { url, path },
  ), {
    credits: _.get( event, 'image.credits' )
  } );

}


async function _defineUnique( field, generator  ) {

  let value = null;

  value = generator( value );

  while ( await _exists( field, value ) ) {

    value = generator( value );

  }

  return value;

}


async function _exists( field, value, evaluateLegacyIdentifiers = true ) {

  // knex is defined in global
  // schemas is defined in global
  // legacySchemas is defined in global

  const exists = await knex( schemas.event ).first( 'id' ).where( field, value ).then( r => !!r );

  if ( !evaluateLegacyIdentifiers ) return !!exists;

  const legacyExists = await knex( legacySchemas.event ).first( 'id' ).where( field, value ).then( r => !!r );

  return exists || legacyExists;

}