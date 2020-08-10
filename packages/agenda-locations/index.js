"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const w = require( 'when' );

const countries = require( '@openagenda/countries' );
const files = require( '@openagenda/files' );
const images = require( '@openagenda/images' );
const logger = require( '@openagenda/logs' );
const utils = require( '@openagenda/utils' );

const db = require( './lib/db' );
const fieldMap = require( './lib/fieldMap' );
const insee = require( './utils/insee' );
const distance = require( './utils/distance' );
const instanciate = require( './lib/instanciate' );
const mw = require( './lib/middleware' );
const sharedConfig = require( './sharedConfig' );

let log;
let config;

const service = {
  init,
  list,
  set,
  get,
  getNew,
  remove,
  unlink,
  merge,
  resync,
  validate: require( './lib/validate' ), // useful for isolated value validation
  copy,
  getSettings, // deprecated
  settings: {
    get: getSettings,
    copy: db.copySettings
  },
  mw,
  utils: {
    countries,
    distance // in meters
  },
  logger,
  interfaces: {} // get those at init
};

module.exports = service;


function init( c, cb ) {

  config = _.merge( {
    mysql: {},
    logger: null,
    maxLimit: 50,
    defaultLimit: 20,
    interfaces: {

      // get count of events associated with given location
      getEventCount: ( l, cb ) => { cb() },
      // signal location deletion
      locationWillRemove: ( l, cb ) => { cb() },
      // signal location update
      locationDidUpdate: ( lId, cb ) => { if ( cb ) cb() },
      // signal location merge
      locationsWillMerge: ( mergeInLocation, location, cb ) => { cb(); },
      // get agenda settings
      getAgendaSettings: ( agendaId, cb ) => { cb( null, {} ) },
      // get location settings
      getLocationSettings: ( agendaId, options, cb ) => { cb( null, null ) },

    }
  }, c );


  service.interfaces = config.interfaces;

  if ( config.logger ) {

    logger.setModuleConfig( config.logger );

  }

  db.init( Object.assign({ query: config.query }, config.mysql), config.interfaces, () => {

    cb();

  } );

  insee.init( { redis: config.redis } )

  mw.init( service, config );

  images.init( {
    tmpPath: config.files.tmpPath,
    logger
  } );

  files.init( {
    bucket: config.files.bucket,
    accessKeyId: config.files.accessKeyId, // required
    secretAccessKey: config.files.secretAccessKey, // required too
    logger
  } );

  instanciate.init( {
    logger
  } );

  log = logger( 'location/index' );


}


function getSettings( agendaId, options, cb ) {

  if ( cb === undefined ) {

    cb = options;
    options = {};

  }

  db.getSettings( agendaId, options, ( err, settings ) => {

    if ( err ) return cb( err );

    if ( !service.interfaces || !service.interfaces.getAgendaSettings ) {

      return cb( null, settings );

    }

    service.interfaces.getAgendaSettings( agendaId, ( err, agendaSettings ) => {

      if ( err ) return cb( err );

      if ( agendaSettings && agendaSettings.translation ) {

        return cb( null, utils.extend( {}, settings, {
          translation: agendaSettings.translation
        } ) );

      }

      cb( null, settings );

    } );

  } );

}

function set( data, settings, cb ) {

  if ( arguments.length == 2 ) {

    cb = settings;

    settings = {};

  }

  w( {
    create: false, // db set decides,
    data,
    location: false,
    errors: [],
    indexedLocation: false,
    settings: Object.assign( {
      forceTags: false, // for private scripts
      forceIndexCreate: false
    }, settings )
  } )

  // if agendaId is loaded, try to fetch settings
  .then( v => {

    if ( !v.data.agendaId ) return v;

    const d = w.defer();

    getSettings( v.data.agendaId, ( err, settings ) => {

      if ( err ) return d.reject( err );

      utils.extend( v.settings, settings );

      d.resolve( v );

    } );

    return d.promise;

  } )

  // write to primary db
  .then( v => {

    log( 'received data for set: %s', JSON.stringify( v.data ) );

    const d = w.defer();

    db.set( v.data, v.settings, ( err, result ) => {

      if ( err ) {

        return d.reject( err );

      }

      if ( !result.success ) {

        log( 'location could not be %sd. Result: %s', result.operation, JSON.stringify( result ) );

        v.errors = result.errors;

        return d.resolve( v );

      }

      log( 'location was %sd: %s', result.operation, JSON.stringify( result.location ) );

      v.location = result.location;

      v.create = result.operation == 'create';

      if ( config.interfaces.locationDidUpdate ) {

        config.interfaces.locationDidUpdate( result.location.id );

      }

      d.resolve( v );

    } );

    return d.promise;

  } )

  // transfer image if existing
  .then( v => {

    if ( v.errors.length ) return v;

    log( 'transfering image' );

    const d = w.defer();

    if ( !v.create ) {

      log( 'this is not a creation, transfer is only for location creations' );

      return v;

    }

    if ( v.location.image && v.location.image.indexOf( 'new' ) == -1 ) {

      log( 'location image name is already set and is not new, transfer is not needed: %s', v.location.image );

      return v;

    }

    instanciate( v.location, { set: db.set } ).transferImage( ( err, imagePath ) => {

      if ( err ) {

        log( 'error', 'could not transfer image: %s', err );

      }

      d.resolve( v );

    } );

    return d.promise;

  } )

  .done( v => {

    cb( null, {
      success: !v.errors.length,
      valid: !v.errors.length,
      location: v.location,
      errors: v.errors,
      instance: v.location ? instanciate( v.location, { set } ) : false
    } );

  }, cb );

}


/**
 * merge locations into single location
 * of defined data
 *
 * @param {list} identifiers   identifiers defining locations to be merged
 *                             example: { uids: [ .. ], agendaId: 123 }
 */

function merge( data, identifiers, cb ) {

  log( 'processing merge for locations of identifiers %s', JSON.stringify( identifiers ) );

  w( {
    data,
    identifiers,
    locations: [],
    merged: false
  } )

  // fetch the locations
  .then( v => {

    const d = w.defer();

    list( v.identifiers, 0, sharedConfig.mergeMax, { keepId: true }, ( err, locations ) => {

      if ( err ) return d.reject( err );

      v.locations = locations;

      if ( !locations.length ) {

        return d.reject( 'no locations were found' );

      }

      d.resolve( v );

    } );

    return d.promise;

  } )

  // update reference location with data
  .then( v => {

    const d = w.defer();

    v.merged = v.locations.pop();

    data.uid = v.merged.uid;

    data.id = v.merged.id;

    set( data, ( err, result ) => {

      if ( err ) return d.reject( err );

      v.merged = result;

      v.merged.id = data.id;

      d.resolve( v );

    } );

    return d.promise;

  } )

  // signal interfaces that locations will be merged
  .then( v => {

    const d = w.defer();

    config.interfaces.locationsWillMerge( _.get( v, 'merged.location' ), v.locations, err => {

      if ( err ) return d.reject( err );

      log( 'interfaces notified of merge' );

      d.resolve( v );

    } );

    return d.promise;

  } )

  // remove locations from db
  .then( v => {

    const d = w.defer();

    async.eachSeries( v.locations.map( l => { return { id: l.id } } ), remove, err => {

      if ( err ) return d.reject( err );

      d.resolve( v );

    } );

    return d.promise;

  } )

  .done( v => {

    delete v.merged.id;

    cb( null, v.merged );

  }, cb );

}


function unlink( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  const params = Object.assign({}, options);

  log( 'processing remove for location with identifiers %s', JSON.stringify( identifiers ) );

  db.get( identifiers, ( err, location ) => {

    if ( err ) return cb( err );

    if ( !location ) return cb( { code: 404, message: 'location not found' } );

    db.unlink( { id: location.id }, cb );

  } );

}


function remove( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  const params = Object.assign({}, options);

  log( 'processing remove for location with identifiers %s', JSON.stringify( identifiers ) );

  db.get( identifiers, ( err, location ) => {

    if ( err ) return cb( err );

    if ( !location ) return cb( { code: 404, message: 'location not found' } );

    config.interfaces.locationWillRemove( location, () => {

      db.remove( { id: location.id }, ( err, removedLocation ) => {

        if ( err ) return cb( err );

        if ( !removedLocation ) {

          log( 'error', 'location %s could not be removed', location.id );

          return cb( null, {
            removed: false,
            unindexed: false
          } );

        } else {

          cb( null, {
            removed: true
          } );

        }

      } );

    } );

  } );

}


list.terms = db.list.terms;


function list( query, offset, limit, options, cb ) {

  if ( arguments.length == 4 ) {

    cb = options;

    options = {};

  }

  const params = utils.extend( {
    keepId: false,
    fromDb: false,
    internal: true, // should be false in new service. true here for backward compatibility
    detailed: true  // should be false in new service. true here for backward compatibility
  }, options );

  db.list( query, offset, limit, ( err, locations, total ) => {

    if ( err ) return cb( err );

    cb( null, locations.map( l => {

      if ( !params.keepId ) delete l.id;

      return _filterByFieldMap( l, params );

    } ), total );

  } );

}


function _filterByFieldMap( location, params ) {

  return _.pickBy( location, ( value, field ) => {

    const matches = fieldMap.filter( f => f.key === field );

    if ( !matches.length ) return true;

    const fieldParams = _.extend( {
      internal: false,
      detailed: false
    }, matches[ 0 ] );

    if ( fieldParams.internal && !params.internal ) return false;

    if ( fieldParams.detailed && !params.detailed ) return false;

    return true;

  } );

}

function get( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;

    options = true;

  }

  w( {
    params: Object.assign( {
      fromDb: typeof options === 'boolean' ? options : true,
      instanciate: true,
      decorate: false,
      fullImagePath: false,
      stakeholderId: false
    }, typeof options === 'object' ? options : {} ),

    location: null
  } )

  // get location
  .then( v => {

    const d = w.defer();

    db.get( identifiers, ( err, l ) => {

      if ( err ) return d.reject( err );

      v.location = l;

      d.resolve( v );

    } );

    return d.promise;

  } )

  // load image path if required
  .then( v => {

    if ( !v.location ) return v;

    if ( v.location.image ) {

      v.location.image = ( v.params.fullImagePath ? '//' + config.files.bucket + '.s3.amazonaws.com/' : '' ) + v.location.image.split( '/' ).pop();

    }

    return v;

  } )

  // decorate with agenda data if required
  .then( v => {

    if ( !v.location || !v.params.decorate ) return v;

    const d = w.defer();

    db.decorate( v.location, ( err, decorated ) => {

      if ( err ) return d.reject( err );

      v.location = decorated;

      d.resolve( v );

    } );

    return d.promise;

  } )

  // instanciate location if required
  .then( v => {

    if ( !v.location || !v.params.instanciate ) return v;

    v.location = instanciate( v.location, service );

    return v;

  } )

  // and give it
  .done( v => {

    cb( null, v.location );

  }, cb );

}


/**
 * sync db data with agenda settings ( tag labels in particular )
 * sync search index with db data
 */

function resync( agendaId, cb ) {

  db.resync( agendaId, cb );

}


function copy( sourceAgendaId, destinationAgendaId, locationIdentifiers, cb ) {

  get( utils.extend( { agendaId: sourceAgendaId }, locationIdentifiers ), {
    instanciate: false
  }, ( err, location ) => {

    if ( err ) return cb( err );

    if ( location === null ) {

      return cb( 'source location not found' );

    }

    set( utils.extend( {}, location, { agendaId: destinationAgendaId, id: null, uid: null, slug: null } ), cb );

  } );

}


function getNew( data, cb ) {

  cb( null, instanciate.new( data, service ) );

}
