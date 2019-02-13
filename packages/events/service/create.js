
"use strict";

const _ = require( 'lodash' );
const uuidV4 = require( 'uuid/v4' );
const w = require( 'when' );

const slugs = require( '@openagenda/slugs' );

const cleanCreateArgs = require( './lib/cleanCreateArgs' );
const cleanCreateOptions = require( './validate/createOptions' );

const get = require( './lib/get.w' );
const map = require( './databaseFieldMap' );

const validate = require( './validate' );
const processImage = require( './lib/processImage' );

const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );

const log = require( '@openagenda/logs' )( 'events service/create' );

let schemas, service, knex, config, legacySchemas;

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

  }
} );


async function createPromise( data, options ) {

  log( 'create called' );

  const cleanOptions = cleanCreateOptions( options );

  if ( !config ) throw new Error( 'Service has not been initialized' );

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

  const errors = [];

  try {

    if ( cleanOptions.draft ) {

      log( 'draft create' );

      preCleanEvent = validate.draft( data );

      preCleanEvent.draft = true;

    } else {

      log( 'non-draft create' );

      preCleanEvent = _.assign( validate.front( data, {
        optionalSlug: true,
        legacy: cleanOptions.legacy
      } ), { draft: false } );

    }

  } catch ( frontValidationErrors ) {

    log( 'pre-validation errors', frontValidationErrors );

    frontValidationErrors.forEach( e => errors.push( _.assign( e, { step: 'pre' } ) ) );

  }

  if ( !errors.length && preCleanEvent.uid && await _exists( 'uid', preCleanEvent.uid, cleanOptions.evaluateLegacyIdentifiers ) ) {

    log( 'warn', 'uid was specified in data but is not available' );

    errors.push( {
      code: 'unavailable.uid',
      message: 'uid is taken by another event'
    } );

  }

  if ( !errors.length && preCleanEvent.slug && await _exists( 'slug', preCleanEvent.slug, cleanOptions.evaluateLegacyIdentifiers ) ) {

    log( 'warn', 'slug was specified in data but is not available' );

    errors.push( {
      code: 'unavailable.slug',
      message: 'slug is taken by another event'
    } );

  }

  if ( !errors.length && !preCleanEvent.uid ) {

    log( 'assigning event uid' );

    preCleanEvent.uid = await _defineUnique( 'uid', () => Math.ceil( Math.random() * 99999999 ) );

  }

  if ( !errors.length && !preCleanEvent.slug ) {

    log( 'assigning event slug' );

    const title = preCleanEvent.title[ _.keys( preCleanEvent.title )[ 0 ] ];

    preCleanEvent.slug = await _defineUnique( 'slug', prev => [
      title ? slugs.generate( title ) : null,
      prev || !title ? Math.ceil( Math.random()*1000000 ) : null
    ].filter( v => !!v ).join( '_' ) );

  }

  if ( !errors.length ) {

    if ( cleanOptions.protected || !data.createdAt instanceof Date ) {

      log( 'specifying createdAt' );

      preCleanEvent.createdAt = new Date();

    }

    if ( cleanOptions.protected || !data.updatedAt instanceof Date ) {

      log( 'specifying updatedAt' );

      preCleanEvent.updatedAt = new Date();

    }

    try {

      cleanEvent = ( cleanOptions.draft ? validate.draft : validate )( _.omit( _.assign( {}, data, preCleanEvent ), [ 'id' ]  ) );

    } catch ( validationErrors ) {

      log( 'loaded event data did not validate', validationErrors );

      validationErrors.forEach( e => errors.push( _.assign( e, { step: 'validation' } ) ) );

    }

  }

  if ( !errors.length && processImage.hasImage( data ) ) {

    try {

      cleanEvent.image = await processImage( config, _.get( data, 'image.url' ), _.get( data, 'image.path' ), {
        image: _.get( data, 'image' ),
        filePath: _.get( data, 'fileKey' )
      } );

    } catch ( e ) {

      errors.push( { step: 'image', code: _.get( e, 'code' ), caught: e } );

    }

  }


  if ( !errors.length ) {

    try {

      createdId = _.head( await knex( schemas.event ).insert( dbParse.toDb( cleanEvent ) ) );

    } catch( e ) {

      log( 'error', 'db insert error found for event %j', _.pick( cleanEvent, [ 'slug', 'uid' ] ), e );

      errors.push( { step: 'db', caught: e } );

    }

    if ( !createdId ) {

      errors.push( { step: 'db', message: 'Id of created event was not retrieved' } );

    }

  }

  if ( !errors.length && cleanOptions.transferToLegacy ) {

    try {

      log( 'transfering to legacy' );

      const result = await service.legacy.update( { id: createdId } );

      transferedToLegacy = !!result.success;

      if ( !transferedToLegacy ) log( 'error', 'could not transfer event to legacy', createdId );

    } catch ( e ) {

      log( 'error', 'could not transfer event to legacy', createdId, e );

    }

  }

  if ( createdId ) {

    try {

      log( 'fetching created event' );

      created = await service.get( { id: createdId }, {
        internal: true,
        private: null,
        includeImagePath: cleanOptions.includeImagePath,
        detailed: cleanOptions.detailed
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

    log( 'calling onCreate interface' );

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

async function _defineUnique( field, generator  ) {

  let value = null;

  log( 'defining unique %s', field );

  value = generator( value );

  while ( await _exists( field, value ) ) {

    log( 'field %s value %s is taken, generating new value', field, value );

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
