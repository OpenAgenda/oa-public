"use strict";

const fieldMap = require( './lib/fieldMap' ),

 _ = require( 'lodash' ),

 logger = require( '@openagenda/basic-logger' ),

 images = require( '@openagenda/images' ),

  files = require( '@openagenda/files' ),

  w = require( 'when' ),

  async = require( 'async' ),

  utils = require( '@openagenda/utils' ),

  deepExtend = require( 'deep-extend' );

let log;

var db = require( './lib/db' ),

  search = require( './lib/search' ),

  searchLocation = require( './lib/search/location' ),

  mw = require( './lib/middleware' ),

  geocodeFarm = require( '@openagenda/geocode-farm' ),

  countries = require( '@openagenda/countries' ),

  instanciate = require( './lib/instanciate' ),

  sharedConfig = require( './sharedConfig' ),

  config,

  service = {
    init,
    list,
    count: search.count,
    set,
    get,
    getNew,
    remove,
    unlink,
    merge,
    rebuild: search.rebuild,
    resync,
    refresh: search.refresh,
    geocode: geocodeFarm, // deprecate this
    validate: require( './lib/validate' ), // useful for isolated value validation
    copy,
    getSettings, // deprecated
    settings: {
      get: getSettings,
      copy: db.copySettings
    },
    mw,
    utils: {
      countries: countries,
      geocode: geocodeFarm
    },
    tasks: {
      setLocationTimezones: require( './tasks/setLocationTimezones' )
    },
    logger,
    interfaces: {} // get those at init
  }

module.exports = service;


function init( c, cb ) {

  config = deepExtend( {
    mysql: {},
    logger: null,
    maxLimit: 50,
    defaultLimit: 20,
    interfaces: {

      // get count of events associated with given location
      getEventCount: ( l, cb ) => { cb() },
      // signal location deletion
      locationWillRemove: ( lId, cb ) => { cb() },
      // signal location update
      locationDidUpdate: ( lId, cb ) => { if ( cb ) cb() },
      // signal location merge
      locationsWillMerge: ( mergeInLocationId, locationIds, cb ) => { cb(); },
      // get stakeholder data
      getStakeholder: ( stakeholderId, cb ) => { cb() },
      // get agenda settings
      getAgendaSettings: ( agendaId, cb ) => { cb( null, {} ) }

    }
  }, c );


  service.interfaces = config.interfaces;

  if ( config.logger ) {

    logger.setLogger( config.logger );

  }

  db.init( config.mysql, () => {

    search.setPrimaryDb( db );

    search.init( config.elasticsearch, cb );

    searchLocation.init( {
      imagePath: '//' + config.files.bucket + '.s3.amazonaws.com/'
    } );

  } );

  geocodeFarm.init( config.geocodefarm );

  mw.init( service, config );

  images.init( {
    tmpPath: config.files.tmpPath,
    logger: logger
  } );

  files.init( {
    bucket: config.files.bucket,
    accessKeyId: config.files.accessKeyId, // required
    secretAccessKey: config.files.secretAccessKey, // required too
    logger: logger
  } );

  instanciate.init( {
    logger: logger
  } );

  log = logger( 'location/index' );


}


function getSettings( agendaId, cb ) {

  db.getSettings( agendaId, ( err, settings ) => {

    if ( err ) return cb( err );

    if ( !service.interfaces || !service.interfaces.getAgendaSettings ) {

      cb( null, settings );

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
    data: data,
    location: false,
    errors: [],
    indexedLocation: false,
    settings: Object.assign( {
      forceTags: false, // for private scripts
    }, settings )
  } )

  // if agendaId is loaded, try to fetch settings
  .then( v => {

    if ( !v.data.agendaId ) return v;

    let d = w.defer();

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

    let d = w.defer();

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

    let d = w.defer();

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

  // index in search
  .then( v => {

    if ( v.errors.length ) return v;

    log( 'indexing location %s - ( %s )', v.location.uid, v.create ? 'create' : 'update' );

    let d = w.defer();

    search[ v.create ? 'create' : 'update' ]( v.location, { refresh: !!v.create }, ( err, indexedLocation ) => {

      if ( err ) return d.reject( err );

      v.indexedLocation = indexedLocation;

      d.resolve( v );

    } );

    return d.promise;

  } )

  .done( v => {

    if ( v.indexedLocation ) delete v.indexedLocation.id;

    cb( null, {
      success: !v.errors.length,
      valid: !v.errors.length,
      location: v.indexedLocation,
      errors: v.errors,
      instance: v.location ? instanciate( v.location, { set: set } ) : false
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
    data: data,
    identifiers: identifiers,
    locations: [],
    merged: false
  } )

  // fetch the locations
  .then( v => {

    let d = w.defer();

    list( v.identifiers, 0, sharedConfig.mergeLimit, { keepId: true }, ( err, locations ) => {

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

    let d = w.defer();

    v.merged = v.locations.pop();

    data.uid = v.merged.uid;

    data.id = v.merged.id;

    set( data, ( err, location ) => {

      if ( err ) return d.reject( err );

      v.merged = location;

      v.merged.id = data.id;

      d.resolve( v );

    } );

    return d.promise;

  } )

  // signal interfaces that locations will be merged
  .then( v => {

    let d = w.defer();

    config.interfaces.locationsWillMerge( v.merged.id, v.locations.map( l => l.id ), err => {

      if ( err ) return d.reject( err );

      log( 'interfaces notified of merge' );

      d.resolve( v );

    } );

    return d.promise;

  } )

  // remove locations from db
  .then( v => {

    let d = w.defer();

    async.eachSeries( v.locations.map( l => { return { id: l.id } } ), remove, err => {

      if ( err ) return d.reject( err );

      d.resolve( v );      

    } );

    return d.promise;

  } )

  .then( v => {

    let d = w.defer();

    search.refresh( err => {

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

  let params = Object.assign( {
    refresh: false // force refresh of search index after remove
  }, options );

  log( 'processing remove for location with identifiers %s', JSON.stringify( identifiers ) );

  db.get( identifiers, ( err, location ) => {

    if ( err ) return cb( err );

    if ( !location ) return cb( { code: 404, message: 'location not found' } );

    db.unlink( { id: location.id }, ( err, unlinkedLocation ) => {

      if ( err ) return cb( err );

      _removeFromSearch( unlinkedLocation, params, cb );

    } );

  } );

}


function remove( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  let params = Object.assign( {
    refresh: false // force refresh of search index after remove
  }, options );

  log( 'processing remove for location with identifiers %s', JSON.stringify( identifiers ) );

  db.get( identifiers, ( err, location ) => {

    if ( err ) return cb( err );

    if ( !location ) return cb( { code: 404, message: 'location not found' } );

    config.interfaces.locationWillRemove( location.id, () => {

      db.remove( { id: location.id }, ( err, removedLocation ) => {

        if ( err ) return cb( err );

        if ( !removedLocation ) {

          log( 'error', 'location %s could not be removed', location.id );

          return cb( null, {
            removed: false,
            unindexed: false
          } );

        }

        _removeFromSearch( removedLocation, params, cb );

      } );

    } );
    
  } );

}


function _removeFromSearch( location, options, cb ) {

  search.remove( { id: location.id }, options, ( err, removed ) => {

    if ( err ) return cb( err );

    cb( null, {
      removed: true,
      unindexed: true
    } );

  } );

}

list.terms = db.list.terms;


function list( query, offset, limit, options, cb ) {

  if ( arguments.length == 4 ) {

    cb = options;

    options = {};

  }

  let params = utils.extend( { 
    keepId: false,
    fromDb: false,
    internal: true, // should be false in new service. true here for backward compatibility
    detailed: true  // should be false in new service. true here for backward compatibility
  }, options );

  ( params.fromDb ? db : search ).list( query, offset, limit, ( err, locations, total ) => {

    if ( err ) return cb( err );

    cb( null, locations.map( l => {

      if ( !params.keepId ) delete l.id;

      return _filterByFieldMap( l, params );

    } ), total );

  } );

}


function _filterByFieldMap( location, params ) {

  return _.pickBy( location, ( value, field ) => {

    let matches = fieldMap.filter( f => f.key === field );

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

    let d = w.defer();

    ( v.params.fromDb ? db : search ).get( identifiers, ( err, l ) => {
    
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

    let d = w.defer();

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

  db.resync( agendaId, err => {

    if ( err ) return cb( err );

    search.resync( agendaId, cb );

  } );

}


function copy( sourceAgendaId, destinationAgendaId, locationIdentifiers, cb ) {

  get( utils.extend( { agendaId: sourceAgendaId }, locationIdentifiers ), {
    fromDb: true,
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