"use strict";

const w = require( 'when' ),

  _ = require( 'lodash' ),

  elastic = require( 'elasticsearch' ),

  utils = require( '@openagenda/utils' ),

  async = require( 'async' ),

  logger = require( '@openagenda/basic-logger' );

let log, esClient;

module.exports = function( obj, service, config ) {

  log = logger( 'search' );

  return {

    // make a listed search
    list,

    // create new index and update alias
    rebuild,

    getClient

  }


  function list( query, offset, limit, cb ) {

    var dsl = obj.query( query, offset, limit ),

    client = getClient( config.elasticsearch );

    client.search( {
      index: obj.alias,
      type: obj.type,
      body: dsl
    }, ( err, result ) => {

      if ( err ) return cb( err );

      cb( null, result.hits.hits.map( obj.parse ), result.hits.total );

    } );

  }


  function rebuild( cb ) {

    log( 'rebuild' );

    w( {
      interfaces: config.interfaces,
      config: config.elasticsearch,
      image: config.image,
      obj: obj,
      service: service,
      previousIndices: false,
      index: obj.alias + '_' + _now()
    } )

    .then( _getPreviousIndices )

    .then( _createIndex )

    .then( _setMapping )

    .then( _populate )

    .then( _refresh )

    .then( _applyAlias )

    .then( _removePreviousIndices )

    .done( v => {

      cb();

    }, cb );

  }

  
}


/**
 * HERE: run interface function for each agenda
 * before running the bulk insert
 */

function _populate( v ) {

  log( 'info', 'populating index' );

  if ( !v.interfaces|| !v.interfaces.agendasList ) {

    console.log( 'DEPRECATED: use interfaces for agendas rebuild' );

  }

  let d = w.defer(),

    pageCount = 0,

    offset = 0, 

    limit = 20,

    indexedCount = 0,

    query = {};

  async.doWhilst( wcb => {

    log( 'info', 'listing agendas from %s to %s', offset, offset + limit );

    ( v.interfaces && v.interfaces.agendasList ? v.interfaces.agendasList : v.service.list.bind( null, { detailed: true } ) )( offset, limit, ( err, items ) => {

      if ( err ) {

        console.log( 'error', err );

        return wcb( err );

      }

      let filteredItems = items.filter( _rebuildFilter );

      pageCount = items.length;

      offset += limit;

      _bulkInsert( v, filteredItems, ( err, result ) => {

        if ( !err ) {

          //log( 'bulk inserted %s items', result.items.length );

          indexedCount += result.items.length;

        } else {

          //log( 'error', 'bulk operation error: %s', err );

        }

        wcb();

      } );

    } );

  }, () => !!pageCount, () => {

    log( 'info', 'indexed %s items', indexedCount );

    v.indexedCount = indexedCount;

    d.resolve( v );

  } );

  return d.promise;

}


function _rebuildFilter( a ) {

  if ( /(t|T)est/.test( a.title ) ) return false;

  if ( /(t|T)est/.test( a.description ) ) return false;

  return a.publishedEvents || a.official;

}


function _bulkInsert( v, items, cb ) {

  var bulked = [],

  client = getClient( v.config );

  items.forEach( item => { 

    // action description
    bulked.push( { index: {
      _index: v.index,
      _type: v.obj.type,
      _id: item.id
    } } );

    bulked.push( v.obj.clean( item, { image: v.image } ) );

  } );

  if ( !bulked.length ) {

    return cb( null, { items: [] } );

  }

  client.bulk( {
    body: bulked
  }, ( err, result ) => {

    cb( err, result );

  } );

}


/**
 * refresh the index v.index
 */

function _refresh( v ) {

  var client = getClient( v.config ),

  d = w.defer();

  client.indices.refresh( {
    index: v.index
  }, ( err, result ) => {

    if ( err ) {

      return d.reject( err );

    }

    d.resolve( v );

  } );

  return d.promise;

}


/**
 * apply alias v.obj.alias on v.index index
 */

function _applyAlias( v ) {

  var client = getClient( v.config ),

  d = w.defer();

  client.indices.putAlias( {
    index: v.index,
    name: v.obj.alias
  }, ( err, result ) => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


/**
 * get indexes pointed to by v.obj.alias
 */
function _getPreviousIndices( v ) {

  log( 'retrieving previous indices' );

  var client = getClient( v.config ),

  d = w.defer();

  client.indices.getAlias( {
    name: v.obj.alias
  }, ( err, result ) => {

    if ( err && err.displayName !== 'NotFound' ) {

      return d.reject( err );

    }

    // if err at this point, means alias not set
    v.previousIndices = err ? [] : Object.keys( result );

    log( 'retrieved %s indices', v.previousIndices.length );

    d.resolve( v );

  } );

  return d.promise;

}


/**
 * remove indexes listed by v.previousIndices
 */
function _removePreviousIndices( v ) {

  if ( !v.previousIndices.length ) {

    return v;

  }

  var client = getClient( v.config ),

  d = w.defer();

  client.indices.delete( {
    index: v.previousIndices.join( ',' )
  }, ( err, result ) => {

    if ( err ) {

      return d.reject( err );

    }

    d.resolve( v );

  } );

  return d.promise;

}


function _createIndex( v ) {

  log( 'creating index' );

  var client = getClient( v.config ),

  d = w.defer();

  client.indices.create( {
    index: v.index,
    timeout: v.config.timeout,
    body: v.obj.indexBody
  }, ( err, result ) => {

    if ( err ) return d.reject( err );

    log( 'index %s created', v.index );

    d.resolve( v );

  } );

  return d.promise;

}


function _setMapping( v ) {

  var client = getClient( v.config ),

  d = w.defer();

  client.indices.putMapping( {
    index: v.index,
    type: v.obj.type,
    body: v.obj.mappings
  }, ( err, result ) => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function getClient( config ) {

  if ( !esClient ) {

    esClient = new elastic.Client( _.pick( config, [ 'host', 'apiVersion' ] ) );

  }

  return esClient;

}


function _now() {

  var now = new Date();

  return [
    [ now.getFullYear(),
    utils.fZ( now.getMonth() + 1 ),
    utils.fZ( now.getDate() ) ].join( '' ),
    [ utils.fZ( now.getHours() ),
    utils.fZ( now.getMinutes() ),
    utils.fZ( now.getSeconds() ) ].join( '' )
  ].join( '_' );

}
