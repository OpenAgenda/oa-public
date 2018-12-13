"use strict";

const log = require( '@openagenda/logs' )( 'search' );

var elastic = require( 'elasticsearch' ),

utils = require( '@openagenda/utils' ),

w = require( 'when' ),

fs = require( 'fs' ),

async = require( 'async' ),

config, db, client,

types = {
  location: require( './location.js' )
};

module.exports = list;

Object.assign( module.exports, {
  init,
  isReady: () => !!config,
  setPrimaryDb: ( ref ) => db = ref,
  create: _set( _create ),
  update: _set( _update ),
  refresh,
  remove,
  rebuild,
  resync,
  get,
  list,
  count,
  clear
} );


function _set( fn ) {

  return function( data, options, cb ) {

    if ( arguments.length == 2 ) {

      cb = options;

      options = {};

    }

    let params = utils.extend( {
      refresh: false,
      refreshUpdatedAt: true
    }, options );

    if ( !client ) return cb( 'elasticsearch client is not available' );

    w( {
      config: config,
      data: data,
      client: client,
      location: false,
      refresh: !!params.refresh,
      refreshUpdatedAt: !!params.refreshUpdatedAt
    } )

    .then( _clean )

    .then( fn )

    .done( v => {

      cb( null, types.location.parse( v.location ) );

    }, cb );

  }

}


function remove( identifiers, options, cb ) {

  if ( arguments.length == 2 ) {

    cb = options;

    options = {};

  }

  if ( !client ) return cb( 'elasticsearch client is not available' );

  w( {
    config,
    identifiers,
    client,
    location: null,
    refresh: !!options.refresh,
    removed: false
  } )

  .then( _cleanIdentifiers )

  .then( _retrieveLocation )

  .then( _remove )

  .done( v => {

    cb( null, v.removed );

  }, cb );

}


function refresh( cb ) {

  if ( !client ) return cb( 'elasticsearch client is not available' );

  w( {
    client: client,
    config: config
  } )

  .then( _refresh )

  .done( v => cb( null ), cb );

}


function get( query, cb ) {

  list( query, 0, 1, ( err, locations ) => {

    if ( err ) return cb( err );

    if ( !locations.length ) return cb( 'unknown location' );

    cb( null, locations[ 0 ] );

  } );

}


function list( query, offset, limit, cb ) {

  var dsl = types.location.query( query, offset, limit );

  client.search( {
    index: config.index,
    body: dsl
  }, ( err, result ) => {

    if ( err ) return cb( err );

    let locations = result.hits.hits.map( h => {

      let data = types.location.parse( h._source );

      data.id = parseInt( h._id );

      return data;

    } );

    // add missing data ( namely, tag labels )
    db.decorate( locations, ( err, decorated ) => {

      if ( err ) return cb( err );

      cb( null, decorated, result.hits.total );

    } );

  } );

}


function count( query, cb ) {

  client.count( {
    index: config.index,
    body: { query: types.location.query( query ).query }
  }, ( err, result ) => {

    if ( err ) return cb( err );

    cb( null, result.count );

  } );

}


/**
 * resync index of agenda to db: clear, populate, refresh.
 */

function resync( agendaId, cb ) {

  if ( !db || !client ) return cb( 'search not initialized' );

  w( {
    config: config,
    client: client,
    agendaId: agendaId
  } )

  .then( _clearGhosts )

  .then( _clear )

  .then( _populate )

  .then( _refresh )

  .done( v => { cb() }, cb );

}


function clear( agendaId, cb ) {

  if ( !db || !client ) return cb( 'search not initialized' );

  w( {
    config: config,
    client: client,
    agendaId: agendaId,
    removedCount: 0
  } )

  .then( _clear )

  .then( _refresh )

  .done( v => { cb( null, v.removedCount ); }, cb );

}


/**
 * build entire index from scratch and from primary db data
 */

function rebuild( cb ) {

  if ( !db ) return cb( 'primary db ref missing' );

  if ( !client ) return cb( 'elasticsearch client is not available' );

  w( {
    config: config,
    client: client
  } )

  .then( _removeIndex )

  .then( _createIndex )

  .then( _populate )

  .then( _refresh )

  .done( ( v ) => {

    if ( cb ) cb( null, v );

  }, cb );

}


function init( cfg, cb ) {

  config = utils.extend( {
    host: false, // host : port
    index: false
  }, cfg );

  client = new elastic.Client( {
    host: config.host,
    index: config.index
  } );

  w( {
    config: cfg,
    client: client,
    indexCreated: false
  } )

  .then( _ping )

  .then( _createIndex )

  .done( ( v ) => {

    if ( cb ) cb( null, v );

  }, cb );

}


function _create( v ) {

  var d = w.defer();

  client.create( {

    index: v.config.index,
    type: 'location',
    id: v.location.id,
    refresh: v.refresh,
    body: v.location

  }, ( err, response ) => {

    // if document exists, update it.
    if ( err && err.message.indexOf( 'DocumentAlreadyExistsException' ) !== -1 ) {

      return _update( v ).done( d.resolve, d.reject );

    }

    if ( err ) return d.reject( err );

    v.response = response;

    d.resolve( v );

  } );

  return d.promise;

}

function _update( v ) {

  log( 'updating search index for %s', JSON.stringify( v.location ) );

  var d = w.defer();

  client.update( {
    index: v.config.index,
    type: 'location',
    id: v.location.id,
    refresh: v.refresh,
    body: {
      doc: v.location
    }
  }, ( err, response ) => {

    if ( err ) {

      return d.reject( err );

    }

    v.response = response;

    d.resolve( v );

  } );

  return d.promise;

}


function _clean( v ) {

  v.location = types.location.clean( v.data, v.refreshUpdatedAt );

  return v;

}


function _cleanIdentifiers( v ) {

  var cleanIds = {};

  [ 'id', 'uid', 'agendaId' ].forEach( ( f ) => {

    if ( v.identifiers[ f ] !== undefined ) {

      cleanIds[ f ] = v.identifiers[ f ];

    }

  } );

  if ( !Object.keys( cleanIds ).length ) throw 'Identifiers missing';

  v.identifiers = cleanIds;

  return v;

}


function _retrieveLocation( v ) {

  var d = w.defer();

  list( v.identifiers, 0, 1, ( err, locations, total ) => {

    if ( err ) return d.reject( err );

    if ( total !== 1 ) return d.reject( 'Fetched wrong number of locations. Could not remove' );

    v.location = locations[ 0 ];

    d.resolve( v );

  } );

  return d.promise;

}


function _remove( v ) {

  var d = w.defer();

  log( 'removing location %s from search', v.location.id );

  v.client.delete( {
    index: v.config.index,
    type: 'location',
    id: v.location.id,
    refresh: v.refresh
  }, ( err, result ) => {

    if ( err ) return d.reject( err );

    v.removed = result.found;

    d.resolve( v );

  } );

  return d.promise;

}


function _refresh( v ) {

  var d = w.defer();

  v.client.indices.refresh( {
    index: v.config.index
  }, ( err, result ) => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _clearGhosts( v ) {

  if ( !v.agendaId ) return v;

  var d = w.defer(), has = true, offset = 0, limit = 20, ghosts = [];

  async.whilst( () => has, wcb => {

    list( { agendaId: v.agendaId }, offset, limit, ( err, locations ) => {

      if ( err ) return d.reject( err );

      if ( !locations.length ) {

        has = false;

        return wcb();

      }

      async.eachSeries( locations, ( location, ecb ) => {

        if ( err ) return ecb( err );

        db.exists( { uid: location.uid }, ( err, exists ) => {

          if ( !exists ) ghosts.push( location.uid );

          ecb();

        } );

      }, err => {

        offset+=limit;

        wcb( err );

      } );

    } );

  }, err => {

    if ( err ) return d.reject( err );

    async.eachSeries( ghosts, ( locationUid, ecb ) => {

      remove( { uid: locationUid }, ecb );

    }, err => {

      if ( err ) return d.reject( err );

      d.resolve( v );

    } );

  } );

  return d.promise;

}


function _clear( v ) {

  if ( !v.agendaId ) return v;

  var d = w.defer(), has = true, offset = 0, limit = 20;

  async.whilst( () => has, wcb => {

    db.list( { agendaId: v.agendaId }, offset, limit, ( err, locations ) => {

      if ( err ) return d.reject( err );

      async.eachSeries( locations, ( l, ecb ) => {

        _remove( {
          client: v.client,
          config: v.config,
          location: l
        } ).done( result => {

          v.removedCount++;

          ecb();

        }, err => ecb() );

      }, err => {

        has = !!locations.length;

        offset += limit;

        wcb( err );

      } );

    } );

  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _populate( v ) {

  var d = w.defer(),

  pageCount = 0, offset = 0, limit = 20, indexedCount = 0, query = {};

  if ( v.agendaId ) query.agendaId = v.agendaId;

  async.doWhilst( wcb => {

    db.list( query, offset, limit, ( err, locations ) => {

      if ( err ) {

        log( 'error', err );

        return wcb( err );

      }

      pageCount = locations.length;

      offset += limit;

      _bulkInsert( v, locations, ( err, result ) => {

        if ( !err && result.errors !== true ) {

          log( 'bulk inserted %s locations', result.items.length );

          indexedCount += result.items.length;

        } else {

          log( 'error', 'bulk operation error: %s', err || JSON.stringify( result.items ) );

        }

        wcb();

      } );

    } );

  }, () => !!pageCount, () => {

    log( 'info', 'indexed %s locations', indexedCount );

    v.indexedCount = indexedCount;

    d.resolve( v );

  } );

  return d.promise;

}

function _bulkInsert( v, locations, cb ) {

  var bulked = [];

  locations.forEach( l => {

    // action description
    bulked.push( { index: {
      _index: v.config.index,
      _type: 'location',
      _id: l.id
    } } );

    bulked.push( types.location.clean( l ) );

  } );

  if ( !bulked.length ) return cb( null, { items: [] } );

  v.client.bulk( {
    body: bulked
  }, cb );

}


/**
 * check index existence and create if does not exist.
 */

function _createIndex( v ) {

  var d = w.defer();

  v.client.indices.create( {
    index: v.config.index,
    timeout: v.config.timeout,
    body: {
      analysis: {
        analyzer: {
          custom: {
            type: 'custom',
            tokenizer: 'standard',
            filter : [ 'standard', 'lowercase', 'asciifolding', 'my_word_delimiter' ]
          }
        },
        filter : {
          my_word_delimiter : {
            type : 'word_delimiter',
            preserve_original: "true"
          }
        }
      }
    }
  }, ( err, result ) => {

    if ( err && err.message && err.message.indexOf( 'IndexAlreadyExistsException' ) !== -1 ) {

      log( 'info', 'index %s already exists, no need to create', v.config.index );

      return d.resolve( v );

    } else if ( err ) {

      return d.reject( err );

    }

    v.indexCreated = true;

    v.client.indices.putMapping( {
      timeout: v.config.timeout,
      index: v.config.index,
      type: 'location',
      body: {
        location: types.location.mapping
      }
    }, ( err, result ) => {

      if ( err ) return d.reject( err );

      d.resolve( v );

    } );


  } );

  return d.promise;

}

function _removeIndex( v ) {

  var d = w.defer();

  v.client.indices.delete( {
    index: v.config.index
  }, ( err ) => {

    if ( err ) return d.reject();

    return d.resolve( v );

  } );

  return d.promise;

}


function _ping( v ) {

  var d = w.defer();

  v.client.ping( {
    requestTimeout: v.config.timeout,
    hello: "just nod if you can hear me, is there anyone at home?"
  }, ( err ) => {

    if ( err ) {

      log( 'error', 'could not ping elasticsearch' );

      return d.reject( err );

    }

    log( 'info', 'elasticsearch successfully pinged' );

    d.resolve( v );

  } );

  return d.promise;

}
